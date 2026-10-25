/**
 * The authenticated user attached to a request.
 *
 * `id` is a number because `serial()` yields a number. A string here would
 * desync every downstream query that compares it against `users.id`.
 */
export interface AuthPayload {
  id: number;
  email: string;
}
