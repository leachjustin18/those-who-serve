import Head from 'next/head';
import Link from 'next/link';
import { Typography } from '@mui/material';
import { useCollection } from 'react-firebase-hooks/firestore';
import firebase from './firebase/clientApp';
import LoggedInGuard from './components/authorization/LoggedInGuard';
import Container from './components/layout/Container';

const Servants = () => {
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
        <title>Those who serve - Servants</title>
      </Head>

      <LoggedInGuard>
        <Container>
          <main>
            <Typography variant="h2">Servants</Typography>
            <Link href="/">Home</Link>
          </main>
        </Container>
      </LoggedInGuard>
    </>
  );
};

export default Servants;
