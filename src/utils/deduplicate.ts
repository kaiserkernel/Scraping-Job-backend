import Job from '../models/Job';

export async function deduplicate(hash: string): Promise<boolean> {
  return (await Job.exists({ hash })) !== null;
}
