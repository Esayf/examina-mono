import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { handleTwitterCallback } from '@/lib/Client/Auth/socials';
import { setSession } from '@/features/client/session';
import { useAppDispatch } from '@/app/hooks';
import toast from 'react-hot-toast';

export default function TwitterCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Process the callback once the router query parameters are available
    if (router.isReady) {
      const { code, state, error, error_description } = router.query;

      // Handle error responses from Twitter
      if (error) {
        setStatus('error');
        setErrorMessage(error_description as string || 'Authentication was denied or failed');
        return;
      }

      // Ensure required parameters are present
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing required parameters');
        return;
      }

      // Complete the authentication process
      handleTwitterCallback(code as string, state as string)
        .then((response) => {
          if (response?.session) {
            // Store session in Redux
            dispatch(setSession(response.session));

            // Show success message
            toast.success('Successfully signed in with Twitter!', {
              duration: 5000,
              className: "chozToastSuccess",
            });

            setStatus('success');

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/app/dashboard/choose-role');
            }, 1000);
          } else {
            throw new Error('Invalid response from server');
          }
        })
        .catch((error) => {
          console.error('Error during Twitter authentication:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Authentication failed');
        });
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-secondary-100">
      <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-brand-primary-900 mb-4">
              Completing Sign In...
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we complete your authentication with Twitter.
            </p>
            <div className="w-12 h-12 border-t-4 border-brand-primary-600 border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-brand-primary-900 mb-4">
              Authentication Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              You have successfully signed in with Twitter.
              Redirecting you to the dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'There was a problem authenticating your Twitter account.'}
            </p>
            <button
              className="bg-brand-primary-600 text-white px-4 py-2 rounded-full hover:bg-brand-primary-700 transition"
              onClick={() => router.push('/')}
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 