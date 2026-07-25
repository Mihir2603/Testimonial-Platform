export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function assetUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

export async function submitTestimonial(formData) {
  const res = await fetch(`${API_BASE}/api/testimonials`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Submission failed');
  return data;
}

export async function fetchTestimonials({ status, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  const res = await fetch(`${API_BASE}/api/testimonials?${params}`);
  if (!res.ok) throw new Error('Failed to load testimonials');
  return res.json();
}

export async function updateTestimonialStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/testimonials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function fetchApprovedTestimonials() {
  const res = await fetch(`${API_BASE}/api/testimonials/approved`);
  if (!res.ok) throw new Error('Failed to load testimonials');
  return res.json();
}
