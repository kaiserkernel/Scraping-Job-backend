import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define a TypeScript interface for the Job document
export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  hash: string;
  createdAt: Date;
  isFraud: boolean;
}

// 2. Define the schema using the interface
const JobSchema: Schema<IJob> = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: false },
  description: { type: String, required: false },
  url: { type: String, required: false },
  hash: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  isFraud: { type: Boolean, default: false },
});

// 3. Export the model with types
const Job: Model<IJob> = mongoose.model<IJob>('Job', JobSchema);
export default Job;
