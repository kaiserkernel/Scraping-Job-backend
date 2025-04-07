// utils/detectFraud.ts

export interface JobInput {
  title: string;
  description: string;
}

export function detectFraud(job: JobInput): boolean {
  const redFlags = ['quick money', 'no experience', 'work from anywhere with no skills'];
  const content = `${job.title} ${job.description}`.toLowerCase();
  return redFlags.some(flag => content.includes(flag));
}
