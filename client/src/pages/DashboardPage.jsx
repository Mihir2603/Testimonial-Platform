import { useCallback, useEffect, useState } from 'react';
import { assetUrl, fetchTestimonials, updateTestimonialStatus } from '../api';
import { EmptyState, ErrorState, LoadingState, StarRating } from '../components/Shared';

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function DashboardPage() {
  const [tab, setTab] = useState('pending');
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchTestimonials({ status: tab || undefined, page, limit: 10 });
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id, status) {
    setActionId(id);
    try {
      await updateTestimonialStatus(id, status);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h1>Moderation Dashboard</h1>
        <p>Review incoming testimonials before they appear on your wall.</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => { setTab(t.key); setPage(1); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <LoadingState message="Loading submissions…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState title="No submissions" message="Nothing here yet — share your submit link with customers." />
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="dashboard-list">
            {data.map((item) => (
              <div key={item.id} className="dashboard-item">
                <div className="dashboard-item-main">
                  {item.photoUrl && <img src={assetUrl(item.photoUrl)} alt="" className="dashboard-photo" />}
                  <div>
                    <div className="dashboard-meta">
                      <strong>{item.name}</strong>
                      <span>{item.email}</span>
                      {item.company && <span>{item.company}</span>}
                      <span className={`status-badge status-${item.status}`}>{item.status}</span>
                      {item.sentiment && (
                        <span className={`sentiment-badge sentiment-${item.sentiment}`}>
                          {item.sentiment}
                        </span>
                      )}
                    </div>
                    {item.sentimentSummary && (
                      <p className="sentiment-summary">AI: {item.sentimentSummary}</p>
                    )}
                    <StarRating rating={item.rating} size="sm" />
                    <p className="dashboard-text">"{item.text}"</p>
                    <time className="dashboard-time">{new Date(item.createdAt).toLocaleString()}</time>
                  </div>
                </div>
                {item.status === 'pending' && (
                  <div className="dashboard-actions">
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={actionId === item.id}
                      onClick={() => handleAction(item.id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={actionId === item.id}
                      onClick={() => handleAction(item.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>Page {page} of {pagination.totalPages}</span>
              <button type="button" className="btn btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
