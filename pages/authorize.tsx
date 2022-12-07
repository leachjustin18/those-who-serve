import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Box, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import GoogleIcon from '@mui/icons-material/Google';

import { createFirebaseApp } from '../firebase/clientApp';
import { useUser } from '../context/userContext';

const Authorize = () => {
  const provider = useMemo(() => new GoogleAuthProvider(), []);
  const [isLoading, setIsLoading] = useState(false);
  const app = createFirebaseApp();
  const auth = getAuth(app);
  const router = useRouter();

  const { isLoadingUser, user } = useUser();

  useEffect(() => {
    if (!isLoadingUser) {
      setIsLoading(false);
      if (user) {
        router.push('/');
      }
    } else if (isLoadingUser) {
      setIsLoading(true);
    }
  }, [isLoadingUser, user]);

  const onSignIn = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <>
      <Head>
        <title>Those who serve - Authorize</title>
      </Head>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        {isLoading === false ? (
          <Button
            startIcon={<GoogleIcon />}
            onClick={onSignIn}
            variant="contained"
            color="secondary"
          >
            Sign in with Google
          </Button>
        ) : (
          <LoadingButton loading variant="contained">
            Submit
          </LoadingButton>
        )}
      </Box>
    </>
  );
};

export default Authorize;
