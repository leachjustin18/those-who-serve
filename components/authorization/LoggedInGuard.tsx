import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Box, LinearProgress } from '@mui/material';
import Loading from '../util/loading';
import { useUser } from '../../context/userContext';

const LoggedInGuard = ({ children }: { children: ReactNode }): JSX.Element => {
  const { user, isLoadingUser } = useUser();
  const router = useRouter();

  if (isLoadingUser) {
    return <Loading />;
  }

  if (user === null) {
    router.push('/authorize');
  }

  return <>{children}</>;
};

export default LoggedInGuard;
