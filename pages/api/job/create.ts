import { getDatabase } from 'firebase-admin/database';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const data = JSON.parse(req.body);
  const db = getDatabase();
  const jobsRef = db.ref('thoseWhoServe/jobs');
  const newJobsRef = jobsRef.push();

  newJobsRef.set(data);

  newJobsRef?.key
    ? res.status(200).json({ data, message: 'Job added' })
    : res.status(500).json({ message: 'Failed to add record' });
};

export default handler;
