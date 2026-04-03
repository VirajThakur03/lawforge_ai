/* global COUNTRIES, SITUATION_TEMPLATES, LegalMatcher */

// ─── State ─────────────────────────────────────────────────────────────────
let selectedCountry = null;
let selectedTemplate = null;
let currentResponse = null;
let history = JSON.parse(localStorage.getItem('lf_history') || '[]');
let isDark = localStorage.getItem('lf_theme') !== 'light';

// ─── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  renderCountries('');
  renderTemplates();
  renderHistory();
  bindEvents();
});

// ─── Theme ─────────────────────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('btn-theme');
  if (btn) btn.innerHTML = isDark ? '<span>☀️</span> Light Mode' : '<span>🌙</span> Dark Mode';
}
function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('lf_theme', isDark ? 'dark' : 'light');
  applyTheme();
}

// ─── Country Selector ────────────────────────────────────────────────────
function renderCountries(filter) {
  const list = document.getElementById('country-list');
  list.innerHTML = '';
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) || c.code.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach(c => {
    const div = document.createElement('div');
    div.className = 'country-option' + (selectedCountry?.code === c.code ? ' selected' : '');
    div.innerHTML = `<span class="country-flag">${c.flag}</span><span>${c.name}</span><span class="country-system">${c.system}</span>`;
    div.addEventListener('click', () => selectCountry(c));
    list.appendChild(div);
  });
}
function selectCountry(c) {
  selectedCountry = c;
  const btn = document.getElementById('country-select-btn');
  btn.innerHTML = `<span class="country-flag">${c.flag}</span><span>${c.name}</span><span class="select-arrow" id="select-arrow">▼</span>`;
  closeCountryDropdown();
  renderCountries('');
}
function openCountryDropdown() {
  document.getElementById('country-dropdown').classList.add('open');
  const arrow = document.getElementById('select-arrow');
  if (arrow) arrow.classList.add('open');
  document.getElementById('country-search-input').focus();
}
function closeCountryDropdown() {
  document.getElementById('country-dropdown').classList.remove('open');
  const arrow = document.getElementById('select-arrow');
  if (arrow) arrow.classList.remove('open');
}
function toggleCountryDropdown() {
  const dd = document.getElementById('country-dropdown');
  if (dd.classList.contains('open')) closeCountryDropdown();
  else openCountryDropdown();
}

// ─── Templates ────────────────────────────────────────────────────────────
function renderTemplates() {
  const grid = document.getElementById('templates-grid');
  grid.innerHTML = '';
  SITUATION_TEMPLATES.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'template-card';
    div.id = `template-${i}`;
    div.innerHTML = `<span class="template-icon">${t.icon}</span><div><div class="template-label">${t.label}</div><div class="template-desc">${t.desc}</div></div>`;
    div.addEventListener('click', () => selectTemplate(t, i));
    grid.appendChild(div);
  });
}
function selectTemplate(t, i) {
  selectedTemplate = t;
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  document.getElementById(`template-${i}`).classList.add('active');
  const ta = document.getElementById('situation-input');
  if (!ta.value) ta.placeholder = `e.g. ${t.desc}`;
  ta.focus();
}

// ─── History ──────────────────────────────────────────────────────────────
function renderHistory() {
  const list = document.getElementById('history-list');
  if (!history.length) {
    list.innerHTML = `<div class="history-empty"><div class="empty-icon">📂</div><div>No queries yet</div></div>`;
    return;
  }
  list.innerHTML = '';
  [...history].reverse().forEach((h, i) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<span class="history-flag">${h.flag}</span><div class="history-info"><div class="history-country">${h.country}</div><div class="history-snippet">${h.snippet}</div></div>`;
    div.addEventListener('click', () => loadHistory(history.length - 1 - i));
    list.appendChild(div);
  });
}
function addHistory(country, flag, snippet, response) {
  history.push({ country, flag, snippet, response, time: Date.now() });
  if (history.length > 20) history.shift();
  localStorage.setItem('lf_history', JSON.stringify(history));
  renderHistory();
}
function loadHistory(idx) {
  const h = history[idx];
  if (!h) return;
  currentResponse = h.response;
  renderResponse(h.response);
  showState('response');
  if (window.innerWidth < 768) closeMobileSidebar();
}
function clearHistory() {
  if (!confirm('Clear all history?')) return;
  history = [];
  localStorage.removeItem('lf_history');
  renderHistory();
}

// ─── Core Analyze (OFFLINE) ───────────────────────────────────────────────
function analyze() {
  if (!selectedCountry) { alert('Please select a country.'); return; }
  const situation = document.getElementById('situation-input').value.trim();
  if (situation.length < 10) { alert('Please describe your situation in more detail (at least 10 characters).'); return; }

  showState('loading');

  // Simulate progressive loading steps for UX
  animateLoadingSteps(() => {
    try {
      const result = LegalMatcher.query(selectedCountry.code, selectedCountry.name, situation);
      currentResponse = result;
      addHistory(selectedCountry.name, selectedCountry.flag, situation.slice(0, 60), result);
      renderResponse(result);
      showState('response');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      showError('Error analyzing situation: ' + e.message);
    }
  });
}

// ─── Loading Steps ────────────────────────────────────────────────────────
function animateLoadingSteps(callback) {
  const steps = document.querySelectorAll('.step-item');
  steps.forEach(s => { s.className = 'step-item'; });
  let i = 0;
  const delays = [300, 500, 400, 400, 400];
  function advance() {
    if (i > 0) steps[i - 1].className = 'step-item done';
    if (i < steps.length) {
      steps[i].className = 'step-item active';
      i++;
      setTimeout(advance, delays[i - 1] || 350);
    } else {
      // Done animating — run callback
      setTimeout(callback, 200);
    }
  }
  advance();
}

// ─── Render Response ──────────────────────────────────────────────────────
function renderResponse(data) {
  const sec = data.sections || {};
  document.getElementById('res-country').textContent = `${selectedCountry?.flag || ''} ${data.country}`;
  document.getElementById('res-situation').textContent = data.situation || '';

  const sevBadge = document.getElementById('res-severity');
  sevBadge.textContent = (data.severity || 'MEDIUM') + ' Severity';
  sevBadge.className = `severity-badge severity-${data.severity || 'MEDIUM'}`;

  const warn = document.getElementById('res-urgent');
  if (data.urgentWarning) {
    warn.textContent = '⚠️ ' + data.urgentWarning;
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }

  // Show detected category
  const meta = data._meta;
  if (meta) {
    document.getElementById('res-category').textContent = `Category: ${meta.category} · Offline Engine`;
  }

  const sectionDefs = [
    { icon: '📋', title: 'Situation Summary', key: 'situationSummary' },
    { icon: '⚖️', title: 'Applicable Laws', key: 'applicableLaws' },
    { icon: '🔴', title: 'Penalties', key: 'penalties' },
    { icon: '🛡️', title: 'Your Rights', key: 'yourRights' },
    { icon: '✅', title: 'What To Do — Step by Step', key: 'whatToDo' },
    { icon: '🧠', title: 'Legal Defense', key: 'legalDefense' },
    { icon: '💡', title: 'How to Reduce Penalty', key: 'reducePenalty' },
    { icon: '🌐', title: 'Official Resources', key: 'officialResources' },
  ];

  const grid = document.getElementById('sections-grid');
  grid.innerHTML = '';
  sectionDefs.forEach((def, idx) => {
    const content = formatSectionContent(sec[def.key] || 'Information not available.');
    const card = document.createElement('div');
    card.className = 'section-card';
    card.style.animationDelay = `${idx * 0.055}s`;
    card.innerHTML = `
      <div class="section-head ${idx === 0 ? 'open' : ''}" onclick="toggleSection(this)">
        <div class="section-num">${idx + 1}</div>
        <span class="section-icon">${def.icon}</span>
        <span class="section-title">${def.title}</span>
        <span class="section-chevron">▼</span>
      </div>
      <div class="section-body ${idx === 0 ? 'open' : ''}">${content}</div>`;
    grid.appendChild(card);
  });

  // Disclaimer card
  const dCard = document.createElement('div');
  dCard.className = 'section-card disclaimer-card';
  dCard.style.animationDelay = `${sectionDefs.length * 0.055}s`;
  dCard.innerHTML = `
    <div class="section-head open" onclick="toggleSection(this)">
      <div class="section-num">⚠</div>
      <span class="section-icon">📢</span>
      <span class="section-title">Legal Disclaimer</span>
      <span class="section-chevron">▼</span>
    </div>
    <div class="section-body open"><p>${data.disclaimer || ''}</p></div>`;
  grid.appendChild(dCard);

  renderJsonPanel(data);
}

function formatSectionContent(text) {
  if (!text) return '<p>Information not available.</p>';
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const t = line.trim();
    if (/^\d+\.\s/.test(t)) return `<li>${t.replace(/^\d+\.\s/, '')}</li>`;
    if (/^[•\-]\s/.test(t)) return `<li>${t.replace(/^[•\-]\s/, '')}</li>`;
    return `<p>${t}</p>`;
  }).join('\n')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
}

function renderJsonPanel(data) {
  const json = { country: data.country, situation: data.situation, severity: data.severity, laws: data.laws, penalties: data.penalties, defenses: data.defenses };
  const pretty = JSON.stringify(json, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-str">"$1"</span>');
  document.getElementById('json-body').innerHTML = pretty;
}

// ─── Section Toggle ───────────────────────────────────────────────────────
function toggleSection(head) {
  const body = head.nextElementSibling;
  const isOpen = head.classList.contains('open');
  head.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

// ─── Copy / Actions ───────────────────────────────────────────────────────
function copyResponse() {
  if (!currentResponse) return;
  const text = Object.entries(currentResponse.sections || {})
    .map(([k, v]) => `=== ${k.toUpperCase()} ===\n${v}`).join('\n\n');
  navigator.clipboard.writeText(text).then(() => flashBtn('btn-copy', '✅ Copied!', '📋 Copy Report'));
}
function copyJson() {
  if (!currentResponse) return;
  const json = { country: currentResponse.country, situation: currentResponse.situation, severity: currentResponse.severity, laws: currentResponse.laws, penalties: currentResponse.penalties, defenses: currentResponse.defenses };
  navigator.clipboard.writeText(JSON.stringify(json, null, 2)).then(() => flashBtn('btn-copy-json', '✅ Copied!', '📦 Copy JSON'));
}
function flashBtn(id, msg, original) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.add('copied');
  btn.innerHTML = msg;
  setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = original; }, 2200);
}
function newQuery() {
  showState('idle');
  document.getElementById('situation-input').value = '';
  document.getElementById('situation-input').placeholder = 'Describe your legal situation…';
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  selectedTemplate = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── State Machine ────────────────────────────────────────────────────────
function showState(state) {
  document.getElementById('loading-state').style.display = state === 'loading' ? 'block' : 'none';
  document.getElementById('response-state').style.display = state === 'response' ? 'block' : 'none';
  document.getElementById('error-state').style.display = state === 'error' ? 'block' : 'none';
  document.getElementById('query-section').style.display = (state === 'idle') ? 'block' : 'none';
}
function showError(msg) {
  showState('error');
  document.getElementById('error-msg').textContent = msg;
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────
function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('sidebar-overlay').classList.add('visible');
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

function updateCharCount() {
  const ta = document.getElementById('situation-input');
  document.getElementById('char-count').textContent = `${ta.value.length} / 1000`;
}

// ─── Events ───────────────────────────────────────────────────────────────
function bindEvents() {
  document.getElementById('country-select-btn').addEventListener('click', toggleCountryDropdown);
  document.getElementById('country-search-input').addEventListener('input', e => renderCountries(e.target.value));
  document.addEventListener('click', e => { if (!e.target.closest('.country-select-wrapper')) closeCountryDropdown(); });
  document.getElementById('situation-input').addEventListener('input', updateCharCount);
  document.getElementById('btn-analyze').addEventListener('click', analyze);
  document.getElementById('btn-analyze-2').addEventListener('click', () => { showState('idle'); setTimeout(analyze, 50); });
  document.getElementById('btn-copy').addEventListener('click', copyResponse);
  document.getElementById('btn-copy-json').addEventListener('click', copyJson);
  document.getElementById('btn-new-query').addEventListener('click', newQuery);
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-clear-history').addEventListener('click', clearHistory);
  document.getElementById('menubar-btn').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyze();
    if (e.key === 'Escape') closeCountryDropdown();
  });
}
