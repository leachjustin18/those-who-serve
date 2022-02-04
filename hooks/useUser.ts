import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import '../pages/firebase/initializeApp';

const useUser = () => {
  const [user, setUser] = useState<User>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscriber = onAuthStateChanged(auth, (googleUser) => {
      try {
        if (googleUser) {
          setUser(googleUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('error', error);
      } finally {
        setIsUserLoading(false);
      }
    });

    return () => unsubscriber();
  }, [auth]);

  return { user, isUserLoading };
};

export default useUser;
