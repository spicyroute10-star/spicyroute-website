import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import supabaseAuthService from '../services/supabaseAuth';
import { fetchApi } from '../api/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const { setSession } = useAuth();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Check for error in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const urlError = urlParams.get('error_description') || urlParams.get('error');
        if (urlError) {
          throw new Error(decodeURIComponent(urlError.replace(/\+/g, ' ')));
        }

        // Try PKCE code exchange first
        const code = urlParams.get('code');
        let session = null;

        if (code) {
          const { data, error: exchangeError } = await supabaseAuthService.supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data?.session) {
            session = data.session;
          }
        }

        // Fallback: getSession()
        if (!session) {
          const { data: sessionData } = await supabaseAuthService.supabase.auth.getSession();
          session = sessionData?.session;
        }

        // Fallback: wait for onAuthStateChange
        if (!session) {
          await new Promise((resolve) => {
            const { data: listener } = supabaseAuthService.supabase.auth.onAuthStateChange((event, s) => {
              if (s?.user) {
                session = s;
                listener.subscription.unsubscribe();
                resolve();
              }
            });
            setTimeout(() => { listener.subscription.unsubscribe(); resolve(); }, 4000);
          });
        }

        if (session?.user) {
          const authUser = session.user;
          const userEmail = authUser.email;
          const userName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || userEmail.split('@')[0];

          // Sync with backend to get our JWT
          const syncRes = await fetchApi('/auth/oauth-sync', {
            method: 'POST',
            body: JSON.stringify({
              email: userEmail,
              name: userName,
              authId: authUser.id,
              role: 'CUSTOMER'
            })
          });

          if (syncRes.token && syncRes.user) {
            if (setSession) setSession(syncRes.token, syncRes.user);

            // Role-based redirect
            const role = syncRes.user.role;
            const redirectPath = role === 'ADMIN' ? '/?view=admin'
              : role === 'VENDOR' ? '/?view=vendor'
              : '/';

            if (isMounted) {
              setStatus('success');
              setTimeout(() => { window.location.href = redirectPath; }, 800);
            }
          } else if (isMounted) {
            setStatus('success');
            setTimeout(() => { window.location.href = '/'; }, 800);
          }
        } else {
          throw new Error('No session returned from Google. Please try again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        if (isMounted) {
          setStatus('error');
          setError(err.message || 'Authentication failed');
          setTimeout(() => { window.location.href = '/'; }, 3000);
        }
      }
    };

    handleCallback();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 max-w-md w-full text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-rose-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Completing Google Sign-In...</h2>
            <p className="text-sm text-gray-500">Please wait while we set up your account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Sign-In Successful!</h2>
            <p className="text-sm text-gray-500">Redirecting you to the app...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-rose-600 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Sign-In Failed</h2>
            <p className="text-sm text-rose-500 font-semibold">{error}</p>
            <p className="text-xs text-gray-400">Redirecting back to home...</p>
          </>
        )}
      </div>
    </div>
  );
}