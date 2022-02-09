import { useEffect, useMemo } from 'react';
import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/router';
import useUser from '../hooks/useUser';

const Auth = () => {
  const provider = useMemo(() => new GoogleAuthProvider(), []);
  const auth = getAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push('/');
      } else {
        signInWithRedirect(auth, provider);
      }
    }
  }, [isUserLoading, user, provider, router, auth]);

  return '';
};

export default Auth;
