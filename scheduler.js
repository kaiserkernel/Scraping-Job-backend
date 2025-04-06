const cron = require('node-cron');
const scrapeGoogleJobs = require('./scrapers/googleJobs');
// Add others later...

cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled scraping...');
  await scrapeGoogleJobs();
});
