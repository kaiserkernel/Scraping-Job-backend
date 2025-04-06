const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(100);
  res.json(jobs);
});

module.exports = router;
