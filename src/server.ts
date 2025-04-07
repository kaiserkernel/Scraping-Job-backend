import dotenv from 'dotenv';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import jobRoutes from './routes/jobs';
import '../scheduler';

dotenv.config();

// connect DB
const MONGO_URI = process.env.MONGO_URI as string;
const connectDB = async () => {
	try {
	  const result = await mongoose.connect(MONGO_URI);
	  console.log("Connected to DB:", result.connection.name);
	} catch (error) {
	  console.error("DB Connection Error:", error);
	}
};
connectDB();

const app : Application = express();

app.use('/api/jobs', jobRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
