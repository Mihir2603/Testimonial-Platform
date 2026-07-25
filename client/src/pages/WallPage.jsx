import { useCallback, useEffect, useState } from 'react';
import { fetchApprovedTestimonials } from '../api';
import { EmptyState, ErrorState, LoadingState, TestimonialCard } from '../components/Shared';

const PAGE_SIZE = 6;

export default function WallPage() {
  const [all, setAll] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchApprovedTestimonials();
      setAll(data);
      setVisible(PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = all.slice(0, visible);
  const hasMore = visible < all.length;

  return (
    <div className="page wall-page">
      <div className="wall-hero">
        <h1>What our customers say</h1>
        <p>Real stories from real people who love working with us.</p>
      </div>

      {loading && <LoadingState message="Loading testimonials…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && all.length === 0 && (
        <EmptyState title="No testimonials yet" message="Approved reviews will appear here. Check back soon!" />
      )}

      {!loading && !error && shown.length > 0 && (
        <>
          <div className="wall-grid">
            {shown.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
          {hasMore && (
            <div className="load-more-wrap">
              <button type="button" className="btn btn-secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
