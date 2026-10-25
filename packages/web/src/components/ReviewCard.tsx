import { useEffect, useState } from 'react';
import type { Entry } from '../content';

/**
 * The review card.
 *
 * The interaction is deliberately two-stage: the answer is hidden until the user
 * asks for it, and only then can they grade themselves. Grading before seeing
 * the answer turns the exercise into a reading comprehension check — you would
 * be testing whether you recognised the text, not whether you could produce it.
 *
 * The five buttons map onto the ladder's rungs. "Again" and "Hard" are failures;
 * "Good" and "Easy" are passes; "Mastered" is the top rung. The labels are
 * words rather than numbers because the user is grading recall, not entering a
 * score.
 */

const RATINGS = [
  { quality: 0, label: 'Again', hint: 'I did not know it', rung: 'again' },
  { quality: 2, label: 'Hard', hint: 'I knew it, barely', rung: 'hard' },
  { quality: 3, label: 'Good', hint: 'I recalled it', rung: 'good' },
  { quality: 4, label: 'Easy', hint: 'It came quickly', rung: 'easy' },
  { quality: 5, label: 'Mastered', hint: 'I can teach it', rung: 'mastered' },
] as const;

interface ReviewCardProps {
  entry: Entry;
  onReview: (quality: number) => void;
  /** True while the review request is in flight. Disables the buttons. */
  pending?: boolean;
}

export function ReviewCard({ entry, onReview, pending }: ReviewCardProps) {
  // Keyed by entry id so the reveal resets when the queue advances. Without
  // this the answer to the previous item stays on screen over the next one,
  // which both leaks the answer and makes the grading buttons live before the
  // user has seen the new prompt.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [entry.id]);

  return (
    <div className="review-card">
      <div className="review-head">
        <span className="review-kind">{entry.type}</span>
        <span className={`badge d${entry.difficulty}`}>Layer {entry.layer}</span>
      </div>

      <h3 className="review-title">{entry.title}</h3>

      <p className="review-prompt">{entry.one_line_definition}</p>

      {revealed ? (
        <div className="review-answer">
          <div className="review-answer-label">Answer</div>
          <p>{entry.why_it_matters}</p>
          {/* `formula` exists only on the term variant, so it is narrowed
              rather than cast. */}
          {entry.type === 'term' && entry.formula ? (
            <div className="formula">{entry.formula}</div>
          ) : null}
        </div>
      ) : (
        <button className="btn btn-outline" onClick={() => setRevealed(true)}>
          Show answer
        </button>
      )}

      <div className="review-actions">
        {RATINGS.map((r) => (
          <button
            key={r.quality}
            className={`btn btn-rate btn-${r.rung}`}
            disabled={!revealed || pending}
            onClick={() => onReview(r.quality)}
          >
            <span className="rate-label">{r.label}</span>
            <span className="rate-hint">{r.hint}</span>
          </button>
        ))}
      </div>

      {!revealed ? (
        <p className="review-note">Reveal the answer before grading yourself.</p>
      ) : null}
    </div>
  );
}
