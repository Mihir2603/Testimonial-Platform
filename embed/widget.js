(function () {
  'use strict';

  var script = document.currentScript;
  var apiUrl = script.getAttribute('data-api') || 'http://localhost:3001';
  var accent = script.getAttribute('data-accent') || '#6366f1';
  var layout = script.getAttribute('data-layout') || 'grid';
  var containerId = script.getAttribute('data-container') || 'praisewall-widget';

  var container = document.getElementById(containerId);
  if (!container) {
    console.error('[PraiseWall] Container #' + containerId + ' not found.');
    return;
  }

  var styles = document.createElement('style');
  styles.textContent = [
    '#' + containerId + ' { font-family: "DM Sans", system-ui, sans-serif; color: #1c1917; }',
    '#' + containerId + ' .pw-loading, #' + containerId + ' .pw-empty, #' + containerId + ' .pw-error { text-align: center; padding: 2rem; color: #78716c; }',
    '#' + containerId + ' .pw-error { color: #dc2626; }',
    '#' + containerId + ' .pw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }',
    '#' + containerId + ' .pw-list { display: flex; flex-direction: column; gap: 1rem; }',
    '#' + containerId + ' .pw-card { background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }',
    '#' + containerId + ' .pw-stars { color: #f59e0b; letter-spacing: 1px; margin-bottom: 0.5rem; }',
    '#' + containerId + ' .pw-text { margin: 0 0 0.75rem; line-height: 1.6; font-size: 0.95rem; }',
    '#' + containerId + ' .pw-author { font-weight: 600; font-size: 0.875rem; }',
    '#' + containerId + ' .pw-company { color: #78716c; font-size: 0.8rem; }',
    '#' + containerId + ' .pw-photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-bottom: 0.5rem; }',
    '#' + containerId + ' .pw-badge { display: inline-block; background: ' + accent + '15; color: ' + accent + '; font-size: 0.7rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 999px; margin-bottom: 0.75rem; }',
  ].join('\n');
  document.head.appendChild(styles);

  container.innerHTML = '<div class="pw-loading">Loading testimonials…</div>';

  fetch(apiUrl + '/api/testimonials/approved')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    })
    .then(function (items) {
      if (!items.length) {
        container.innerHTML = '<div class="pw-empty">No testimonials yet.</div>';
        return;
      }

      var wrapper = document.createElement('div');
      wrapper.className = layout === 'list' ? 'pw-list' : 'pw-grid';

      items.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'pw-card';

        var stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        var html = '<div class="pw-badge">Verified review</div>';
        if (item.photoUrl) {
          html += '<img class="pw-photo" src="' + apiUrl + item.photoUrl + '" alt="' + escapeHtml(item.name) + '" />';
        }
        html += '<div class="pw-stars">' + stars + '</div>';
        html += '<p class="pw-text">"' + escapeHtml(item.text) + '"</p>';
        html += '<div class="pw-author">' + escapeHtml(item.name) + '</div>';
        if (item.company) {
          html += '<div class="pw-company">' + escapeHtml(item.company) + '</div>';
        }
        card.innerHTML = html;
        wrapper.appendChild(card);
      });

      container.innerHTML = '';
      container.appendChild(wrapper);
    })
    .catch(function () {
      container.innerHTML = '<div class="pw-error">Could not load testimonials.</div>';
    });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
