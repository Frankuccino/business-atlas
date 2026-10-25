/**
 * The API client.
 *
 * Two decisions shape this file:
 *
 *   1. The access token lives in memory, never in localStorage. localStorage is
 *      readable by any script on the page, so a token there is XSS-exfiltratable.
 *      The refresh token is already in an httpOnly cookie the JS cannot read, so
 *      the only thing localStorage would buy is persistence across reloads — and
 *      the refresh cookie already provides that.
 *   2. A 401 triggers one refresh-and-retry, then gives up. Retrying in a loop
 *      turns a broken auth setup into a request storm.
 *
 * The catalog is bundled, so content browsing never touches this file. Only
 * user state does.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let accessToken: string | null = null;

/** Set the access token after login or refresh. */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** The current token, for callers that need to inspect it. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** True when a token is held. Does not mean the token is still valid. */
export function isAuthenticated(): boolean {
  return accessToken !== null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/**
 * Make an authenticated request.
 *
 * `credentials: 'include'` is required for the refresh cookie to be sent. Without
 * it the browser silently drops the cookie and refresh fails with "no refresh
 * token" — the same class of bug as a mismatched cookie path.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // A 401 means the access token is missing or expired. Refresh once and retry
  // the original request, so the caller never sees the expiry.
  if (response.status === 401 && accessToken) {
    const refreshed = await tryRefresh();
    if (!refreshed) {
      setAccessToken(null);
      throw new ApiError(401, 'Session expired');
    }

    const retry = await fetch(`/api${path}`, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!retry.ok) throw await toError(retry);
    return (await retry.json()) as T;
  }

  if (!response.ok) throw await toError(response);
  return (await response.json()) as T;
}

async function toError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === 'string') message = data.error;
  } catch {
    // A non-JSON error body is fine; the status code is the message.
  }
  return new ApiError(response.status, message);
}

/**
 * Exchange the refresh cookie for a new access token.
 *
 * Returns false when there is no usable cookie, which is the signal to send the
 * user to login rather than to retry.
 */
async function tryRefresh(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = (await response.json()) as { accessToken?: string };
    if (!data.accessToken) return false;

    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------------------
   Auth
   -------------------------------------------------------------------------- */

export interface SafeUser {
  id: number;
  email: string;
  name: string | null;
}

export const auth = {
  register: (email: string, password: string, name?: string) =>
    request<SafeUser & { accessToken: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    }),

  login: (email: string, password: string) =>
    request<SafeUser & { accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  /** Refresh is unauthenticated by design — it consumes the cookie. */
  refresh: () => request<{ accessToken: string; expiresAt: string }>('/auth/refresh', { method: 'POST' }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => request<SafeUser>('/auth/me'),
};

/* --------------------------------------------------------------------------
   Study state
   -------------------------------------------------------------------------- */

export interface SessionRecord {
  id: number;
  entryIds: string[];
  quoteId: string | null;
  createdAt: string;
}

export interface ProgressDomain {
  id: string;
  name: string;
  total: number;
  unseen: number;
  seen: number;
  canExplain: number;
  canApply: number;
  mastered: number;
}

export interface WeakSpot {
  entryId: string;
  title: string;
  domain: string;
  failures: number;
}

export interface Progress {
  domains: ProgressDomain[];
  streak: number;
  totalReviews: number;
  weakSpots: WeakSpot[];
}

export const study = {
  /** Generate a session. Deterministic for a given state, so a reload is stable. */
  createSession: () => request<SessionRecord>('/session', { method: 'POST' }),

  completeSession: (sessionId: number) =>
    request<{ id: number; completedAt: string }>(`/session/${sessionId}/complete`, { method: 'POST' }),

  review: (sessionId: number, entryId: string, quality: number) =>
    request<{ entryId: string; quality: number; rung: string; dueAt: string; mastery: string }>(
      `/session/${sessionId}/items/${entryId}/review`,
      { method: 'POST', body: { quality } },
    ),

  progress: () => request<Progress>('/progress'),
};

/* --------------------------------------------------------------------------
   Export
   -------------------------------------------------------------------------- */

export interface ExportEnvelope {
  version: number;
  exportedAt: string;
  entries: Array<{
    entryId: string;
    mastery: string;
    intervalDays: number;
    dueAt: string;
    lastReviewedAt: string | null;
    notes: string;
  }>;
  reviews: Array<{
    entryId: string;
    kind: string;
    quality: number;
    prompt: string;
    answer: string | null;
    reviewedAt: string;
  }>;
}

export const exportApi = {
  /** The user's whole study history. */
  download: () => request<ExportEnvelope>('/export'),

  /** Restore from an envelope. */
  restore: (envelope: ExportEnvelope) =>
    request<{ importedEntries: number; importedReviews: number }>('/export', {
      method: 'POST',
      body: envelope,
    }),
};
