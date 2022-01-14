import { ReactElement } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import firebase from '../../firebase/clientApp';

const LoggedInGuard = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [user, loading] = useAuthState(firebase.auth());
  const router = useRouter();

  if (loading) {
    return <>Loading</>;
  }

  if (!user) {
    router.push('/auth');
  }

  return children;
};

export default LoggedInGuard;
