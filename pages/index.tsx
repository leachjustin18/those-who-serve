import Head from 'next/head';
import { Typography } from '@mui/material';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';
import { useData } from '../context/dataContext';

const Home = () => {
  const { state } = useData();
  console.log('🚀 ~ file: index.tsx:9 ~ Home ~ state', state);
  return (
    <>
      <Head>
        <title>Those who serve</title>
      </Head>

      <Container>
        <LoggedInGuard>
          <Typography variant="h2">Hello world!</Typography>
        </LoggedInGuard>
      </Container>
    </>
  );
};

export default Home;
