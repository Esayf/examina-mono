import styles from '../styles/app/Layout.module.css';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isMobile } from 'react-device-detect';
import toast, { Toaster } from 'react-hot-toast';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';

// Components
import { useQuery } from '@tanstack/react-query';
import { getSession, login, logout } from '@/lib/Client/Auth';
import { resetSession, setSession } from '../../features/client/session';
import { authenticate } from '../../hooks/auth';

// Custom hooks
// ! - This is a custom hook that is not yet implemented
// import { useContractStatus } from '../../hooks/useContractStatus';

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  const router = useRouter();
  const dispatch = useDispatch();

  const session = useSelector((state: RootState) => state.session);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    // @ts-ignore
    cacheTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRendered(true);
    /** account change listener */
    (window as any)?.mina?.on('accountsChanged', async (accounts: string[]) => {
      console.log('accountsChanged', accounts);
      if (accounts.length > 0) {
        logout().then(async () => {
          const resetted_session = dispatch(resetSession());
          const res = await authenticate(resetted_session);
          dispatch(setSession((res as any).session));
        });
      } else {
        logout().then(async () => {
          dispatch(resetSession());
          console.log(router.pathname);
          const accs = await (window as any)?.mina?.requestAccounts();
          if (accs.length > 0) {
            const res = await authenticate(session);
            dispatch(setSession((res as any).session));
          }
        });
        console.log('disconnect'); // handled disconnect here
      }
    });
  }, []);

  useEffect(() => {
    refetch();
  }, [router.pathname]);

  useEffect(() => {
    if (rendered && !isLoading && router.pathname !== '/') {
      (window as any)?.mina?.getAccounts().then((accounts: string[]) => {
        if (data && accounts.length === 0) {
          logout().then(() => {
            dispatch(resetSession());
            toast.error('Please connect wallet to continue.');
            router.push('/');
          });
          return;
        }

        if (!data && accounts.length === 0) {
          dispatch(resetSession());
          toast.error('Please login to continue.');
          router.push('/');
          return;
        }

        if (data && accounts.length > 0) {
          dispatch(setSession((data as any).session));
          return;
        }

        if (!data && accounts.length > 0) {
          dispatch(resetSession());
          toast.error('Please sign message while authentication to continue.');
          router.push('/');
          return;
        }
      });
    }

    if (rendered && !isLoading && router.pathname == '/') {
      (window as any)?.mina?.getAccounts().then((accounts: string[]) => {
        if (data && accounts.length > 0) {
          if (accounts[0] !== (data as any)?.session?.walletAddress) {
            logout().then(() => {
              dispatch(resetSession());
            });
            return;
          }
          dispatch(setSession((data as any).session));
          return;
        }
      });
    }
  }, [rendered, isLoading, router.pathname]);

  return (
    <div>
      <main>{children}</main>
      <Toaster position="top-left" />
    </div>
  );
}

export default Layout;
