import Head from 'next/head';
import { Typography } from '@mui/material';
import LoggedInGuard from '../components/authorization/LoggedInGuard';
import Container from '../components/layout/Container';

const Home = () => {
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
