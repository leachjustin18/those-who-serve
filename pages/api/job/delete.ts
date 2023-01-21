import { getDatabase } from 'firebase-admin/database';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { key } = JSON.parse(req.body);

  const db = getDatabase();
  const jobsRef = db.ref(`thoseWhoServe/jobs/${key}`);

  jobsRef.set(null, (error) => {
    if (error) {
      console.log('Data could not be removed.' + error);
    } else {
      console.log('Data removed successfully.');
    }
  });

  //   newJobsRef.set(data);

  //   newJobsRef?.key
  //     ? res.status(200).json({ data, key: newJobsRef?.key, message: 'Job added' })
  //     : res.status(500).json({ message: 'Failed to add record' });

  res.status(200).json({ message: 'Job deleted' });
};

export default handler;
