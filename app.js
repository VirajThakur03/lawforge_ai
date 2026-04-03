/* global COUNTRIES, SITUATION_TEMPLATES */

// ─── State ────────────────────────────────────────────────────────────────────
let selectedCountry = null;
let selectedTemplate = null;
let currentResponse = null;
let history = JSON.parse(localStorage.getItem('lf_history') || '[]');
let apiKey = localStorage.getItem('lf_api_key') || '';
let isDark = localStorage.getItem('lf_theme') !== 'light';

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are LAWFORGE AI — an advanced Global Legal Intelligence System.
Your role is to provide accurate, country-specific legal information, penalties, rights, and lawful defense options based on real-life user situations.

RULES:
1. NEVER provide illegal advice (no bribery, lying, escaping law enforcement)
2. ONLY provide lawful defenses
3. If serious case (arrest, DUI, criminal offense): explicitly say "Contact a licensed lawyer immediately"
4. If unsure: clearly state uncertainty and recommend official verification
5. Laws must be accurate as of current year (2025-2026)
6. If exact section not confirmed: say "Exact section may vary"
7. Never hallucinate legal sections

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text) in exactly this structure:
{
  "country": "Country Name",
  "situation": "Brief situation summary",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "urgentWarning": "string or null — urgent message if arrest/criminal charge",
  "sections": {
    "situationSummary": "Plain English summary of the situation and legal context",
    "applicableLaws": "List of applicable laws with section numbers, explanation and last updated approx. Format each law clearly.",
    "penalties": "Detailed penalties — fines, jail time, other consequences. Include structured grid info where possible.",
    "yourRights": "What the person can legally do and say. Miranda rights, right to counsel, etc.",
    "whatToDo": "Numbered step-by-step action plan",
    "legalDefense": "Valid legal defenses, evidence needed, process to contest. Say N/A if not applicable.",
    "reducePenalty": "Legal ways only to reduce the penalty or get leniency",
    "officialResources": "Government websites, legal aid, official contacts relevant to the country"
  },
  "disclaimer": "This information is for educational purposes only and does not constitute legal advice. Laws vary by jurisdiction and change frequently. Always consult a qualified lawyer for your specific situation.",
  "laws": ["array of law names"],
  "penalties": ["array of penalty summaries"],
  "defenses": ["array of valid defenses"]
}`;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  renderCountries('');
  renderTemplates();
  renderHistory();
  bindEvents();
  if (!apiKey) showApiModal();
});

// ─── Theme ────────────────────────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('btn-theme');
  if (btn) btn.innerHTML = isDark
    ? '<span>☀️</span> Light Mode'
    : '<span>🌙</span> Dark Mode';
}
function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('lf_theme', isDark ? 'dark' : 'light');
  applyTheme();
}

// ─── API Key Modal ────────────────────────────────────────────────────────────
function showApiModal() {
  document.getElementById('api-modal').classList.remove('hidden');
}
function hideApiModal() {
  document.getElementById('api-modal').classList.add('hidden');
}
function saveApiKey() {
  const val = document.getElementById('api-key-input').value.trim();
  if (!val) return alert('Please enter your Gemini API key.');
  apiKey = val;
  localStorage.setItem('lf_api_key', apiKey);
  hideApiModal();
}

// ─── Country Selector ─────────────────────────────────────────────────────────
function renderCountries(filter) {
  const list = document.getElementById('country-list');
  list.innerHTML = '';
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.code.toLowerCase().includes(filter.toLowerCase())
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
  document.getElementById('select-arrow').classList.add('open');
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

// ─── Templates ────────────────────────────────────────────────────────────────
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
  const textarea = document.getElementById('situation-input');
  textarea.focus();
  if (!textarea.value) textarea.placeholder = `e.g. ${t.desc}`;
}

// ─── History ──────────────────────────────────────────────────────────────────
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

// ─── Core Analyze ─────────────────────────────────────────────────────────────
async function analyze() {
  if (!apiKey) { showApiModal(); return; }
  if (!selectedCountry) { alert('Please select a country.'); return; }
  const situation = document.getElementById('situation-input').value.trim();
  if (situation.length < 10) { alert('Please describe your situation in more detail (at least 10 characters).'); return; }

  showState('loading');
  animateLoadingSteps();

  const prompt = `Country: ${selectedCountry.name} (${selectedCountry.system})
Legal System: ${selectedCountry.system}
User situation: ${situation}

Analyze this legal situation according to the laws of ${selectedCountry.name} and provide your structured JSON response.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
        })
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    raw = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const parsed = JSON.parse(raw);
    currentResponse = parsed;
    addHistory(selectedCountry.name, selectedCountry.flag, situation.slice(0, 60), parsed);
    renderResponse(parsed);
    showState('response');
  } catch (e) {
    showError(e.message);
  }
}

// ─── Loading Steps ────────────────────────────────────────────────────────────
function animateLoadingSteps() {
  const steps = document.querySelectorAll('.step-item');
  steps.forEach(s => { s.className = 'step-item'; });
  let i = 0;
  const advance = () => {
    if (i > 0) steps[i - 1].className = 'step-item done';
    if (i < steps.length) { steps[i].className = 'step-item active'; i++; setTimeout(advance, 900); }
  };
  advance();
}

// ─── Render Response ──────────────────────────────────────────────────────────
function renderResponse(data) {
  const sec = data.sections || {};
  document.getElementById('res-country').textContent = `${selectedCountry?.flag || ''} ${data.country}`;
  document.getElementById('res-situation').textContent = data.situation || '';

  const sevBadge = document.getElementById('res-severity');
  sevBadge.textContent = data.severity || 'UNKNOWN';
  sevBadge.className = `severity-badge severity-${data.severity || 'LOW'}`;

  const warn = document.getElementById('res-urgent');
  if (data.urgentWarning) {
    warn.textContent = '⚠️ ' + data.urgentWarning;
    warn.style.display = 'block';
  } else {
    warn.style.display = 'none';
  }

  const sectionDefs = [
    { id: 's1', icon: '📋', title: 'Situation Summary', key: 'situationSummary' },
    { id: 's2', icon: '⚖️', title: 'Applicable Laws', key: 'applicableLaws' },
    { id: 's3', icon: '🔴', title: 'Penalties', key: 'penalties' },
    { id: 's4', icon: '🛡️', title: 'Your Rights', key: 'yourRights' },
    { id: 's5', icon: '✅', title: 'What To Do — Step by Step', key: 'whatToDo' },
    { id: 's6', icon: '🧠', title: 'Legal Defense', key: 'legalDefense' },
    { id: 's7', icon: '💡', title: 'How to Reduce Penalty', key: 'reducePenalty' },
    { id: 's8', icon: '🌐', title: 'Official Resources', key: 'officialResources' },
  ];

  const grid = document.getElementById('sections-grid');
  grid.innerHTML = '';
  sectionDefs.forEach((def, idx) => {
    const content = formatSectionContent(sec[def.key] || 'Information not available.');
    const card = document.createElement('div');
    card.className = 'section-card';
    card.style.animationDelay = `${idx * 0.06}s`;
    card.innerHTML = `
      <div class="section-head" onclick="toggleSection(this)">
        <div class="section-num">${idx + 1}</div>
        <span class="section-icon">${def.icon}</span>
        <span class="section-title">${def.title}</span>
        <span class="section-chevron">▼</span>
      </div>
      <div class="section-body ${idx === 0 ? 'open' : ''}">${content}</div>
    `;
    if (idx === 0) card.querySelector('.section-head').classList.add('open');
    grid.appendChild(card);
  });

  // Disclaimer card
  const disclaimerContent = `<p>${data.disclaimer || 'This information is for educational purposes only. Consult a licensed lawyer for your specific situation.'}</p>`;
  const dCard = document.createElement('div');
  dCard.className = 'section-card disclaimer-card';
  dCard.style.animationDelay = `${sectionDefs.length * 0.06}s`;
  dCard.innerHTML = `
    <div class="section-head open" onclick="toggleSection(this)">
      <div class="section-num">⚠</div>
      <span class="section-icon">📢</span>
      <span class="section-title">Legal Disclaimer</span>
      <span class="section-chevron">▼</span>
    </div>
    <div class="section-body open">${disclaimerContent}</div>
  `;
  grid.appendChild(dCard);

  // JSON Panel
  renderJsonPanel(data);
}

function formatSectionContent(text) {
  if (!text) return '<p>Information not available.</p>';
  // Convert numbered lists
  text = text.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  // Convert bullet points
  text = text.replace(/^[•\-\*]\s+(.+)$/gm, '<li>$1</li>');
  // Wrap consecutive li items
  text = text.replace(/(<li>.*?<\/li>\n?)+/gs, m => `<ul>${m}</ul>`);
  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Em *text*
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Section headers (ALL CAPS or Title:)
  text = text.replace(/^([A-Z][A-Z\s]{3,}):?\s*$/gm, '<h4>$1</h4>');
  text = text.replace(/^([A-Z][a-zA-Z\s]{3,40}):\s*$/gm, '<h4>$1</h4>');
  // Wrap paragraphs
  const lines = text.split('\n').filter(l => l.trim());
  const parts = [];
  for (const line of lines) {
    if (line.startsWith('<') ) { parts.push(line); }
    else { parts.push(`<p>${line}</p>`); }
  }
  return parts.join('\n');
}

function renderJsonPanel(data) {
  const json = {
    country: data.country,
    situation: data.situation,
    severity: data.severity,
    laws: data.laws || [],
    penalties: data.penalties || [],
    defenses: data.defenses || []
  };
  const pretty = JSON.stringify(json, null, 2);
  const highlighted = pretty
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-str">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="json-num">$1</span>');
  document.getElementById('json-body').innerHTML = highlighted;
}

// ─── Section Toggle ───────────────────────────────────────────────────────────
function toggleSection(head) {
  const body = head.nextElementSibling;
  const isOpen = head.classList.contains('open');
  head.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

// ─── Copy / Share ─────────────────────────────────────────────────────────────
function copyResponse() {
  if (!currentResponse) return;
  const text = Object.entries(currentResponse.sections || {})
    .map(([k, v]) => `=== ${k.toUpperCase()} ===\n${v}`)
    .join('\n\n');
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy');
    btn.classList.add('copied');
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '📋 Copy Report'; }, 2200);
  });
}

function copyJson() {
  if (!currentResponse) return;
  const json = { country: currentResponse.country, situation: currentResponse.situation, severity: currentResponse.severity, laws: currentResponse.laws, penalties: currentResponse.penalties, defenses: currentResponse.defenses };
  navigator.clipboard.writeText(JSON.stringify(json, null, 2)).then(() => {
    const btn = document.getElementById('btn-copy-json');
    btn.classList.add('copied');
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '📦 Copy JSON'; }, 2200);
  });
}

function newQuery() {
  showState('idle');
  document.getElementById('situation-input').value = '';
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  selectedTemplate = null;
  if (window.innerWidth < 768) closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── State Machine ────────────────────────────────────────────────────────────
function showState(state) {
  document.getElementById('loading-state').style.display = state === 'loading' ? 'block' : 'none';
  document.getElementById('response-state').style.display = state === 'response' ? 'block' : 'none';
  document.getElementById('error-state').style.display = state === 'error' ? 'block' : 'none';
  document.getElementById('query-section').style.display = state === 'idle' ? 'block' : state === 'loading' ? 'none' : 'none';
}
function showError(msg) {
  showState('error');
  document.getElementById('error-msg').textContent = msg;
}

// ─── Mobile Sidebar ───────────────────────────────────────────────────────────
function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('sidebar-overlay').classList.add('visible');
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

// ─── Char Counter ─────────────────────────────────────────────────────────────
function updateCharCount() {
  const ta = document.getElementById('situation-input');
  document.getElementById('char-count').textContent = `${ta.value.length} / 1000`;
}

// ─── Event Bindings ───────────────────────────────────────────────────────────
function bindEvents() {
  // API key
  document.getElementById('btn-save-key').addEventListener('click', saveApiKey);
  document.getElementById('api-key-input').addEventListener('keydown', e => { if (e.key === 'Enter') saveApiKey(); });

  // Country
  document.getElementById('country-select-btn').addEventListener('click', toggleCountryDropdown);
  document.getElementById('country-search-input').addEventListener('input', e => renderCountries(e.target.value));
  document.addEventListener('click', e => {
    if (!e.target.closest('.country-select-wrapper')) closeCountryDropdown();
  });

  // Situation
  document.getElementById('situation-input').addEventListener('input', updateCharCount);

  // Analyze
  document.getElementById('btn-analyze').addEventListener('click', analyze);
  document.getElementById('btn-analyze-2').addEventListener('click', () => { showState('idle'); setTimeout(analyze, 100); });

  // Actions
  document.getElementById('btn-copy').addEventListener('click', copyResponse);
  document.getElementById('btn-copy-json').addEventListener('click', copyJson);
  document.getElementById('btn-new-query').addEventListener('click', newQuery);

  // Sidebar
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-clear-history').addEventListener('click', clearHistory);
  document.getElementById('btn-settings').addEventListener('click', showApiModal);
  document.getElementById('menubar-btn').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') analyze();
    if (e.key === 'Escape') { closeCountryDropdown(); hideApiModal(); }
  });
}
