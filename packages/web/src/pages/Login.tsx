import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, setAccessToken } from '../api/client';

/**
 * Login and registration.
 *
 * One page for both, toggled. They are the same form with one extra field, and
 * splitting them would mean two pages that drift apart.
 *
 * The access token is held in memory only. The refresh cookie is httpOnly and
 * survives the reload, so a refresh token in localStorage would buy persistence
 * the cookie already provides — and cost XSS exposure.
 */

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result =
        mode === 'login'
          ? await auth.login(email, password)
          : await auth.register(email, password, name || undefined);

      setAccessToken(result.accessToken);
      navigate('/session');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1>{mode === 'login' ? 'Log in' : 'Create an account'}</h1>
      <p className="muted">
        The catalog is public. An account is only needed to track your reviews.
      </p>

      <form className="auth-form" onSubmit={(e) => void submit(e)}>
        {mode === 'register' ? (
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        ) : null}

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={8}
            required
          />
        </label>

        {error ? <p className="warn">{error}</p> : null}

        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p className="muted">
        {mode === 'login' ? (
          <>
            No account?{' '}
            <button className="link" onClick={() => setMode('register')}>
              Create one
            </button>
          </>
        ) : (
          <>
            Already have one?{' '}
            <button className="link" onClick={() => setMode('login')}>
              Log in
            </button>
          </>
        )}
      </p>

      <p>
        <Link to="/">Back to the catalog</Link>
      </p>
    </div>
  );
}
