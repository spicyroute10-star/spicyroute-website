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
        const supabase = supabaseAuthService.supabase;

        // Check for error in URL first (query params or hash)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

        const urlError = urlParams.get('error_description') || urlParams.get('error')
          || hashParams.get('error_description') || hashParams.get('error');
        if (urlError) throw new Error(decodeURIComponent(urlError.replace(/\+/g, ' ')));

        let session = null;

        // --- Strategy 1: Implicit flow — tokens arrive in hash (#access_token=...)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken) {
          const { data, error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          if (!setErr && data?.session) session = data.session;
        }

        // --- Strategy 2: PKCE flow — code arrives in query (?code=...)
        if (!session) {
          const code = urlParams.get('code');
          if (code) {
            const { data, error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchErr && data?.session) session = data.session;
          }
        }

        // --- Strategy 3: getSession() — Supabase may have auto-detected tokens
        if (!session) {
          await new Promise(r => setTimeout(r, 500)); // small wait for Supabase to process hash
          const { data } = await supabase.auth.getSession();
          session = data?.session;
        }

        // --- Strategy 4: Wait for onAuthStateChange
        if (!session) {
          session = await new Promise((resolve) => {
            const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
              if (s?.user) {
                listener.subscription.unsubscribe();
                resolve(s);
              }
            });
            setTimeout(() => { listener.subscription.unsubscribe(); resolve(null); }, 5000);
          });
        }

        if (session?.user) {
          const authUser = session.user;
          const userEmail = authUser.email;
          const userName = authUser.user_metadata?.full_name
            || authUser.user_metadata?.name
            || userEmail.split('@')[0];

          const pendingRole = localStorage.getItem('pending_oauth_role') || 'CUSTOMER';
          try { localStorage.removeItem('pending_oauth_role'); } catch (e) {}

          // Sync with backend to get JWT and role
          const syncRes = await fetchApi('/auth/oauth-sync', {
            method: 'POST',
            body: JSON.stringify({
              email: userEmail,
              name: userName,
              authId: authUser.id,
              role: pendingRole
            })
          });

          if (syncRes.token && syncRes.user) {
            if (setSession) setSession(syncRes.token, syncRes.user);

            const role = syncRes.user.role;
            const isSuperAdminEmail = (userEmail || '').trim().toLowerCase() === 'spicyroute10@gmail.com';
            const redirectPath = (role === 'ADMIN' || isSuperAdminEmail) ? '/?view=admin'
              : role === 'VENDOR' ? '/?view=vendor'
              : '/';

            if (isMounted) {
              setStatus('success');
              setTimeout(() => {
                // Clear hash/params from URL then redirect
                window.location.replace(redirectPath);
              }, 800);
            }
          } else {
            throw new Error('Failed to sync with backend. Please try again.');
          }
        } else {
          throw new Error('No session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        if (isMounted) {
          setStatus('error');
          setError(err.message || 'Authentication failed');
          setTimeout(() => { window.location.replace('/'); }, 3000);
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