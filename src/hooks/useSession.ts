import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// Components
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession, logout } from '@/lib/Client/Auth';
import { resetSession, setSession } from '@/features/client/session';
import { authenticate } from '../hooks/auth';
import { useAppDispatch, useAppSelector } from '../app/hooks';

export const useSession = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const session = useAppSelector((state) => state.session);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    // @ts-ignore
    cacheTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isRendered = useRef(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['exams'],
    });
  }, [queryClient, session]);

  useEffect(() => {
    /** account change listener */
    const handler = async (accounts: string[]) => {
      if (accounts.length > 0) {
        logout().then(async () => {
          const resetted_session = dispatch(resetSession());
          const res = await authenticate(resetted_session);

          if (!res) {
            return;
          }

          dispatch(setSession(res));
        });
      } else {
        logout().then(async () => {
          dispatch(resetSession());

          const accs = await window?.mina?.requestAccounts();
          if (!accs) {
            return;
          }

          if (accs && 'message' in accs) {
            return;
          }

          if (accs.length > 0) {
            const res = await authenticate(session);
            dispatch(setSession(res));
          }
        });
        console.log('disconnect'); // handled disconnect here
      }
    };

    window?.mina?.on('accountsChanged', handler);

    return () => {
      window?.mina?.off('accountsChanged', handler);
    };
  }, [dispatch, session]);

  useEffect(() => {
    refetch();
  }, [refetch, router.pathname]);

  useEffect(() => {
    if (router.pathname.includes('get-started')) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (isRendered.current) {
      return;
    }

    isRendered.current = true;

    if (router.pathname !== '/') {
      window?.mina?.getAccounts().then((accounts: string[]) => {
        if (accounts.length === 0) {
          // the browser wallet does not exist but there was a session in the server
          if (data) {
            logout().then(() => {
              dispatch(resetSession());
              toast.error('Please connect wallet to continue.');
              router.push('/');
            });
            return;
          }

          if (!data) {
            dispatch(resetSession());
            toast.error('Please login to continue.');
            router.push('/');
            return;
          }
        } else {
          if (data) {
            console.log('data', data);
            if ('error' in data) {
              toast.error(data.error);
              return;
            }

            dispatch(setSession(data));
            return;
          }

          if (!data) {
            dispatch(resetSession());
            toast.error('Please sign message while authentication to continue.');
            router.push('/');
            return;
          }
        }
      });
    }

    if (!isLoading && router.pathname == '/') {
      window?.mina?.getAccounts().then((accounts: string[]) => {
        if (data && accounts.length > 0) {
          if ('error' in data) {
            toast.error(data.error);
            return;
          }

          if (accounts[0] !== data?.session?.walletAddress) {
            logout().then(() => {
              dispatch(resetSession());
            });
            return;
          }
          dispatch(setSession(data));
          return;
        }
      });
    }
  }, [data, dispatch, isLoading, router, router.pathname]);

  return { session, isLoading };
};