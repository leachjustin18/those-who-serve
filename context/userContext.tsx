import { useState, useEffect, createContext, useContext } from 'react';
import { createFirebaseApp } from '../firebase/clientApp';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { Dispatch, SetStateAction } from 'react';

export const UserContext = createContext<{
  user: User | null;
  isLoadingUser: boolean;
  setUser?: Dispatch<SetStateAction<User | null>>;
}>({
  user: null,
  isLoadingUser: false,
});

export default function UserContextComp({
  children,
}: {
  children: JSX.Element;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Helpful, to update the UI accordingly.

  useEffect(() => {
    // Listen authenticated user
    const app = createFirebaseApp();
    const auth = getAuth(app);
    const unsubscriber = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log(
          '🚀 ~ file: userContext.tsx ~ line 30 ~ unsubscriber ~ error',
          error
        );
        // Most probably a connection error. Handle appropriately.
      } finally {
        setIsLoadingUser(false);
      }
    });

    // Unsubscribe auth listener on unmount
    return () => unsubscriber();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook that shorthands the context!
export const useUser = () => useContext(UserContext);
