import dotenv from 'dotenv';
import axios from 'axios';
import Job from '../models/Job';
import { createHash } from 'crypto';
import { detectFraud } from '../utils/fraudDetector';
import { deduplicate } from '../utils/deduplicate';

dotenv.config();

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  url: string;
}

const API_KEY = process.env.GOOGLE_API_KEY || "api key";  // Replace with your actual API key
const CSE_ID = process.env.GOOGLE_API_ID || "api id";  // Replace with your CSE ID

async function fetchGoogleJobs(query: string): Promise<ScrapedJob[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: API_KEY,
        cx: CSE_ID,
        q: query,  // The search query, e.g., 'software developer jobs'
      },
    });

    const jobs: ScrapedJob[] = response.data.items.map((item: any) => ({
      title: item.title || '',
      company: item.pagemap?.organization?.[0]?.name || '',  // Using the organization name if available
      location: item.pagemap?.localbusiness?.[0]?.address?.locality || '',  // Extract location if available
      description: item.snippet || '',  // Snippet as job description
      datePosted: item.pagemap?.metatags?.[0]?.['article:published_time'] || '',  // Try to get posted date if available
      url: item.link,  // URL of the job post
    }));

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs from Google Custom Search API:', error);
    return [];
  }
}

export default async function scrapeAllGoogleJobs(): Promise<void> {
  const query = 'job';
  try {
    // Step 1: Fetch Google Jobs using the Custom Search API
    const jobs = await fetchGoogleJobs(query);
console.log(jobs, "jobs")
    if (jobs.length === 0) {
      console.log('No jobs found');
      return;
    }

    // Step 2: Store jobs in DB
    for (const job of jobs) {
      const hash = createHash('sha256')
        .update(`${job.title}${job.company}${job.location}${job.datePosted}`)
        .digest('hex');

      const exists = await deduplicate(hash);
      if (exists) continue;

      const isFraud = detectFraud(job);
      await Job.create({ ...job, hash, isFraud });
    }

    console.log(`Saved ${jobs.length} jobs`);
  } catch (err: any) {
    console.error('Error in scraping jobs:', err.message || err);
  }
}
