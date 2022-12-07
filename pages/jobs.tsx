import Head from 'next/head';
import { Typography } from '@mui/material';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import admin from '../firebase/nodeApp';
import type { TJobs } from '../types/dataTypes';

const Jobs = ({ data }: { data: { jobs: TJobs[] } }) => {
  console.log('🚀 ~ file: jobs.tsx ~ line 9 ~ Jobs ~ data', data);
  const title = 'Jobs';
  return (
    <>
      <Head>
        <title>Those who serve - {title}</title>
      </Head>

      <Container title={title}>
        <LoggedInGuard>
          <Typography>Jobs</Typography>
        </LoggedInGuard>
      </Container>
    </>
  );
};

export const getServerSideProps = async () => {
  const db = admin.database();
  const ref = db.ref('thoseWhoServe/jobs');
  let jobs: TJobs[] = [];
  await ref.once('value', (snapshot) => {
    jobs = snapshot.val();
  });

  return { props: { data: { jobs } } };
};

export default Jobs;
