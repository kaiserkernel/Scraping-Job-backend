import cron from 'node-cron';
import scrapeGoogleJobs from './src/scrapers/googleJobs'; // Make sure this is a default export

// Schedule the job to run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled scraping...');
  try {
    await scrapeGoogleJobs();
  } catch (error) {
    console.error('Error during scraping:', error);
  }
});
