const puppeteer = require('puppeteer');
const Job = require('../models/Job');
const { createHash } = require('crypto');
const detectFraud = require('../utils/fraudDetector');
const deduplicate = require('../utils/deduplicate');

module.exports = async function scrapeGoogleJobs() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/search?q=software+developer+jobs');

  // Replace this with actual scraping logic
  const jobs = await page.evaluate(() => {
    // Fake example
    return [{ title: "Developer", company: "ABC", location: "Remote", description: "..." }];
  });

  for (const job of jobs) {
    const hash = createHash('sha256')
      .update(`${job.title}${job.company}${job.location}`)
      .digest('hex');

    const exists = await deduplicate(hash);
    if (exists) continue;

    const isFraud = detectFraud(job);

    await Job.create({ ...job, hash, isFraud });
  }

  await browser.close();
};
