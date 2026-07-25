/**
 * End-to-end API smoke test for the P0 core loop.
 * Run with: npm run test:flow (server must be running)
 */

const API = process.env.API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function main() {
  console.log('Testing PraiseWall core flow...\n');

  const health = await request('/api/health');
  if (!health.res.ok) throw new Error('Server not reachable. Start it with: npm run dev');
  console.log('✓ Health check passed');

  const submit = await request('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      company: 'Acme Corp',
      text: 'Amazing service! The team was helpful and delivered exactly what we needed.',
      rating: 5,
    }),
  });
  if (!submit.res.ok) throw new Error(`Submit failed: ${submit.data.error}`);
  const id = submit.data.id;
  console.log(`✓ Submitted testimonial #${id} (sentiment: ${submit.data.sentiment})`);

  const pending = await request('/api/testimonials?status=pending');
  const found = pending.data.data?.find((t) => t.id === id);
  if (!found) throw new Error('Submission not found in pending list');
  console.log('✓ Visible in dashboard (pending)');

  const approve = await request(`/api/testimonials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });
  if (!approve.res.ok) throw new Error('Approve failed');
  console.log('✓ Approved');

  const wall = await request('/api/testimonials/approved');
  const onWall = wall.data.find((t) => t.id === id);
  if (!onWall) throw new Error('Approved testimonial not on wall');
  console.log('✓ Visible on public wall');

  const junk = await request('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Spammer',
      email: 'spam@example.com',
      text: 'test',
      rating: 1,
    }),
  });
  if (junk.res.status !== 422) throw new Error('Junk filter did not reject spam');
  console.log('✓ Junk submission rejected');

  console.log('\nAll tests passed!');
}

main().catch((err) => {
  console.error('\n✗', err.message);
  process.exit(1);
});
