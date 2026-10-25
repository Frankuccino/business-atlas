import express from 'express';
import cookieParser from 'cookie-parser';
import { entriesRouter } from './routes/entries';
import { authRouter } from './auth/routes';

const app = express();

app.use(express.json());
// cookieParser must run before any route that reads req.cookies, so it is
// registered ahead of the routers rather than inside them.
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api', entriesRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`api listening on :${port}`);
});
