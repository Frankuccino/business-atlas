import express from 'express';
import cookieParser from 'cookie-parser';
import { entriesRouter } from './routes/entries';
import { authRouter } from './auth/routes';
import { sessionRouter } from './routes/session';
import { progressRouter } from './routes/progress';
import { playbooksRouter } from './routes/playbooks';
import { exportRouter } from './routes/export';

const app = express();

app.use(express.json());
// cookieParser must run before any route that reads req.cookies, so it is
// registered ahead of the routers rather than inside them.
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
// Specific routers first. The entries router has a `GET /:id` catch-all, so if
// it is mounted before these it swallows `/api/session` and `/api/progress` and
// answers them with its own 404. Mount order is load-bearing here.
app.use('/api/session', sessionRouter);
app.use('/api/progress', progressRouter);
app.use('/api/playbooks', playbooksRouter);
app.use('/api/export', exportRouter);
app.use('/api', entriesRouter);

/**
 * 404 for unmatched routes.
 *
 * Registered after the routers so it only catches paths no router claimed.
 * Without it an unknown path falls through to Express's default handler, which
 * returns an HTML body — wrong for a JSON API.
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

/**
 * Central error handler.
 *
 * Async route handlers do not forward rejections to Express automatically, so
 * an unhandled throw becomes a hung request rather than a 500. This catches it.
 *
 * The stack is logged for the operator and kept out of the response: the
 * message is useful, the stack is not something to send to a client.
 */
app.use(((err: unknown, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
}) as express.ErrorRequestHandler);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`api listening on :${port}`);
});
