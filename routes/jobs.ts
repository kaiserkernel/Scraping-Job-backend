import express, { Request, Response } from "express";
import Job from '../models/Job';

const router = express.Router();

// GET /api/jobs
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).limit(100);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
});

export default router;
