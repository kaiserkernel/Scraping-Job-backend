import puppeteer, { Browser, Page } from 'puppeteer';
import Job from '../models/Job';
import { createHash } from 'crypto';
import detectFraud from '../utils/fraudDetector';
import deduplicate from '../utils/deduplicate';

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  url: string;
}

export default async function scrapeAllGoogleJobs(): Promise<void> {
  const browser : Browser = await puppeteer.launch({ headless: false });
  const page : Page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36'
  );

  try {
    // Step 1: Go to Google Search
    await page.goto('https://www.google.com/search?q=job', { waitUntil: 'networkidle2' });

    // Step 2: Click on the Google Job widget
    await page.waitForSelector('div[role="region"]');
    await page.click('div[role="region"]');

    // Step 3: Wait for the job listings panel
    await page.waitForSelector('.PwjeAc');

    // Step 4: Scroll to load more jobs
    let prevHeight = 0;
    let tries = 0;

    while (tries < 5) {
      await page.evaluate(() => {
        const scrollBox = document.querySelector('.gws-plugins-horizon-job__tl-lvc') as HTMLElement;
        scrollBox?.scrollBy(0, 1000);
      });
      await page.waitForTimeout(1500);

      const newHeight = await page.evaluate(() => {
        const el = document.querySelector('.gws-plugins-horizon-job__tl-lvc') as HTMLElement;
        return el?.scrollHeight || 0;
      });

      if (newHeight === prevHeight) tries++;
      else tries = 0;

      prevHeight = newHeight;
    }

    // Step 5: Scrape visible job cards
    const jobs: ScrapedJob[] = await page.evaluate(() => {
      const cards = document.querySelectorAll('.PwjeAc');
      const jobList: ScrapedJob[] = [];

      cards.forEach((card) => {
        const title = (card.querySelector('.BjJfJf') as HTMLElement)?.innerText;
        const company = (card.querySelector('.vNEEBe') as HTMLElement)?.innerText;
        const location = (card.querySelector('.Qk80Jf') as HTMLElement)?.innerText;
        const date = (card.querySelector('.LL4CDc') as HTMLElement)?.innerText;

        if (title && company) {
          jobList.push({
            title,
            company,
            location: location || '',
            description: '', // Could enhance by clicking each job later
            datePosted: date || '',
            url: '', // No URL available directly
          });
        }
      });

      return jobList;
    });

    // Step 6: Store jobs in DB
    for (const job of jobs) {
      const hash = createHash('sha256')
        .update(`${job.title}${job.company}${job.location}${job.datePosted}`)
        .digest('hex');

      const exists = await deduplicate(hash);
      if (exists) continue;

      const isFraud = detectFraud(job);
      await Job.create({ ...job, hash, isFraud });
    }

    console.log(`Google Jobs Widget: Saved ${jobs.length} jobs`);
  } catch (err: any) {
    console.error('Full Google Jobs error:', err.message || err);
  } finally {
    await browser.close();
  }
}
