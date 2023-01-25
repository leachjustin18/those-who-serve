import { getDatabase } from 'firebase-admin/database';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { key } = req.query;

  const db = getDatabase();
  const jobsRef = db.ref(`thoseWhoServe/jobs/${key}`);

  let errorMessage = undefined;

  jobsRef.set(null, (error) => {
    if (error) {
      errorMessage = error;
    }
  });

  !errorMessage
    ? res.status(200).json({ message: 'Job deleted' })
    : res.status(500).json({ message: errorMessage });
};

export default handler;
