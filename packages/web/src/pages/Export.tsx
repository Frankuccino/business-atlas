import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportApi, type ExportEnvelope } from '../api/client';
import { useAuthGate } from '../api/useAuthGate';

/**
 * Import and export.
 *
 * Export downloads the user's study history as JSON. Import restores it.
 *
 * Import is destructive on conflict by design: it is a restore, and a restore
 * that silently keeps the newer row loses data. The page says so before the
 * button is pressed, because the user is about to overwrite their history.
 */

export function ExportPage() {
  const { phase: authPhase, check: checkAuth } = useAuthGate();
  const [envelope, setEnvelope] = useState<ExportEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const authenticated = await checkAuth();
      if (!authenticated || cancelled) return;

      try {
        const data = await exportApi.download();
        if (!cancelled) setEnvelope(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load your data');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkAuth]);

  const download = () => {
    if (!envelope) return;

    // A blob URL rather than a data: URL. A data URL of any size is a single
    // string in memory and is awkward for a large export; a blob streams.
    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `business-atlas-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    // Revoke after the click is dispatched, not before — revoking immediately
    // can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const restore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setPending(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExportEnvelope;
      const r = await exportApi.restore(parsed);
      setResult(`Restored ${r.importedEntries} entries and ${r.importedReviews} reviews.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'That file is not a valid Business Atlas export.',
      );
    } finally {
      setPending(false);
      // Reset the input so the same file can be chosen again.
      event.target.value = '';
    }
  };

  if (authPhase === 'anonymous') {
    return (
      <div>
        <h1>Import and export</h1>
        <p className="muted">Log in to move your study history.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Import and export</h1>
      <p className="muted">
        Your study history is yours. Export it as JSON, or restore from a previous export.
      </p>

      {error ? <p className="warn">{error}</p> : null}
      {result ? <p className="good">{result}</p> : null}

      <section>
        <h2>Export</h2>
        {envelope ? (
          <>
            <p>
              {envelope.entries.length} entries · {envelope.reviews.length} reviews · exported{' '}
              {new Date(envelope.exportedAt).toLocaleString()}
            </p>
            <button className="btn" onClick={download}>
              Download JSON
            </button>
          </>
        ) : (
          <p className="muted">Loading…</p>
        )}
      </section>

      <section>
        <h2>Import</h2>
        <p className="muted">
          Restoring overwrites your current entries where the export has a row for them. Reviews are
          appended, so importing the same file twice will duplicate the review log.
        </p>
        <label className="btn">
          {pending ? 'Restoring…' : 'Choose a file'}
          <input type="file" accept="application/json,.json" onChange={(e) => void restore(e)} hidden />
        </label>
      </section>

      <p>
        <Link to="/progress">Back to progress</Link>
      </p>
    </div>
  );
}
