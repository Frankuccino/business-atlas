import { useCallback, useState } from 'react';
import { auth, setAccessToken } from './client';

/**
 * The authenticated bootstrap.
 *
 * Both the Session and Progress pages need the same thing: establish that the
 * user has a usable session before rendering anything that depends on it.
 *
 * The access token lives in memory, so a page load starts with none. The refresh
 * cookie survives, so the fix is to try it once before declaring the user
 * unauthenticated. Without this a logged-in user sees the login screen on every
 * reload — the token is gone but the session is not.
 *
 * Extracted rather than duplicated because the two copies would drift, and the
 * drift would be invisible until one of them failed in production.
 */
export function useAuthGate() {
  const [phase, setPhase] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');

  const check = useCallback(async () => {
    setPhase('checking');

    // A token from earlier in this page's life is tried first. It is cheap and
    // avoids a refresh round-trip when it is still valid.
    try {
      await auth.me();
      setPhase('authenticated');
      return true;
    } catch {
      // Fall through to the cookie.
    }

    try {
      const refreshed = await auth.refresh();
      setAccessToken(refreshed.accessToken);
      setPhase('authenticated');
      return true;
    } catch {
      setPhase('anonymous');
      return false;
    }
  }, []);

  return { phase, check };
}
