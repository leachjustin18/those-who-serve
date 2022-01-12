import Head from 'next/head';
import { Typography } from '@mui/material';
import { useCollection } from 'react-firebase-hooks/firestore';
import firebase from './firebase/clientApp';
import LoggedInGuard from './components/authorization/LoggedInGuard';
import Container from './components/layout/Container';

const Home = () => {
  const [servants, servantsLoading] = useCollection(
    firebase.firestore().collection('servants'),
    {}
  );

  if (!servantsLoading && servants) {
    servants.docs.map((doc) => console.log(doc.data()));
  }

  return (
    <>
      <Head>
        <title>Those who serve</title>
      </Head>

      <LoggedInGuard>
        <Container>
          <main>
            <Typography variant="h2">Hello world!</Typography>
          </main>
        </Container>
      </LoggedInGuard>
    </>
  );
};

export default Home;
