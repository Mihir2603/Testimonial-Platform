import { assetUrl } from '../api';

export function StarRating({ rating, size = 'md', interactive = false, onChange }) {
  return (
    <div className={`stars stars-${size}${interactive ? ' stars-interactive' : ''}`} role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          className={`star${star <= rating ? ' filled' : ''}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={interactive ? star === rating : undefined}
          onClick={interactive ? () => onChange(star) : undefined}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function TestimonialCard({ testimonial, showStatus = false }) {
  return (
    <article className="testimonial-card">
      {testimonial.photoUrl && (
        <img src={assetUrl(testimonial.photoUrl)} alt={testimonial.name} className="card-photo" />
      )}
      <div className="card-body">
        <StarRating rating={testimonial.rating} />
        <blockquote className="card-text">"{testimonial.text}"</blockquote>
        <footer className="card-footer">
          <strong>{testimonial.name}</strong>
          {testimonial.company && <span className="card-company">{testimonial.company}</span>}
        </footer>
        {showStatus && (
          <span className={`status-badge status-${testimonial.status}`}>{testimonial.status}</span>
        )}
      </div>
    </article>
  );
}

export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="state-message">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="state-message empty">
      <p className="state-title">{title}</p>
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-message error">
      <p className="state-title">Something went wrong</p>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
