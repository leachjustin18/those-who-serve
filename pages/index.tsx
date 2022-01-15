import Head from 'next/head';
import { Typography } from '@mui/material';
import LoggedInGuard from './components/authorization/LoggedInGuard';
import Container from './components/layout/Container';

const Home = () => (
  <>
    <Head>
      <title>Those who serve</title>
    </Head>

    <LoggedInGuard>
      <Container>
        <div>
          <Typography variant="h2">Hello world!</Typography>
        </div>
      </Container>
    </LoggedInGuard>
  </>
);

export default Home;
