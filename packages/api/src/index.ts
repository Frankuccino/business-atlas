import express from 'express';
import { entriesRouter } from './routes/entries';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', entriesRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`api listening on :${port}`);
});
