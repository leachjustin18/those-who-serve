import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import useUser from '../../hooks/useUser';

const LoggedInGuard = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  if (isUserLoading) {
    return <>Loading</>;
  }

  if (!user) {
    router.push('/auth');
  }

  return children;
};

export default LoggedInGuard;
