const els = {
  inputMode: document.getElementById('inputMode'),
  prompt: document.getElementById('prompt'),
  complexity: document.getElementById('complexity'),
  complexityLabel: document.getElementById('complexityLabel'),
  classify: document.getElementById('classify'),
  generate: document.getElementById('generate'),
  explain: document.getElementById('explain'),
  announce: document.getElementById('announce'),
  exportSvg: document.getElementById('exportSvg'),
  exportPng: document.getElementById('exportPng'),
  exportJson: document.getElementById('exportJson'),
  explanation: document.getElementById('explanation'),
  svg: document.getElementById('svgCanvas'),
  canvas: document.getElementById('plotCanvas'),
  meta: document.getElementById('meta'),
  historyList: document.getElementById('historyList'),
  newWorkspace: document.getElementById('newWorkspace'),
  toggleContrast: document.getElementById('toggleContrast'),
  networkStatus: document.getElementById('networkStatus'),
  voiceControls: document.getElementById('voiceControls'),
  fileControls: document.getElementById('fileControls'),
  sketchControls: document.getElementById('sketchControls'),
  startVoice: document.getElementById('startVoice'),
  stopVoice: document.getElementById('stopVoice'),
  fileInput: document.getElementById('fileInput'),
  sketchPad: document.getElementById('sketchPad'),
  clearSketch: document.getElementById('clearSketch')
};

const complexityLabels = { 1: 'ELI5', 2: 'Middle School', 3: 'High School', 4: 'Undergraduate', 5: 'PhD' };
const storeKey = 'nexus-free-workspace-v2';

const state = {
  classification: null,
  codeFormat: 'mermaid',
  renderType: 'flowchart',
  generatedCode: '',
  history: JSON.parse(localStorage.getItem(storeKey) || '[]'),
  csvPoints: null
};

function setModePanels() {
  const mode = els.inputMode.value;
  els.voiceControls.hidden = mode !== 'voice';
  els.fileControls.hidden = mode !== 'file';
  els.sketchControls.hidden = mode !== 'sketch';
}

function updateComplexity() {
  els.complexityLabel.textContent = complexityLabels[els.complexity.value];
}

function detectDomain(prompt) {
  const text = prompt.toLowerCase();
  if (/(resistor|voltage|current|ohm|circuit|kirchhoff)/.test(text)) return ['circuit', 'dc_circuits', 'circuitjs'];
  if (/(integral|derivative|quadratic|function|graph|equation|matrix|algebra)/.test(text)) return ['math', 'algebra', 'plotly'];
  if (/(photosynthesis|dna|cell|protein|respiration|genetics)/.test(text)) return ['biology', 'cell_biology', 'mermaid'];
  if (/(force|velocity|acceleration|projectile|newton|momentum)/.test(text)) return ['physics', 'mechanics', 'reactflow'];
  if (/(molecule|smiles|benzene|reaction|chemical|atom)/.test(text)) return ['chemistry', 'organic_chemistry', 'smiles'];
  return ['logic', 'algorithms', 'mermaid'];
}

function classifyPrompt() {
  const prompt = els.prompt.value.trim();
  if (!prompt) return showError('Please enter a prompt.');

  const [domain, subDomain, visualizationType] = detectDomain(prompt);
  const confidence = 0.72;
  state.classification = {
    domain,
    sub_domain: subDomain,
    confidence,
    visualization_type: visualizationType,
    complexity_detected: ['elementary', 'middle_school', 'high_school', 'undergraduate', 'research'][Math.min(4, Math.max(0, Number(els.complexity.value) - 1))],
    requires_simulation: domain === 'circuit' || domain === 'physics',
    requires_3d: domain === 'chemistry' && /3d/.test(prompt.toLowerCase()),
    key_entities: prompt.split(/\W+/).filter(Boolean).slice(0, 6),
    suggested_enhancements: ['add unit labels', 'show intermediate steps', 'enable annotation layer']
  };

  renderMeta();
  els.explanation.textContent = `Classified as ${domain}/${subDomain} with ${Math.round(confidence * 100)}% confidence using local router.`;
}

function renderMeta() {
  const c = state.classification;
  if (!c) return;
  const tags = [
    `domain: ${c.domain}`,
    `sub-domain: ${c.sub_domain}`,
    `viz: ${c.visualization_type}`,
    `complexity: ${c.complexity_detected}`,
    c.requires_simulation ? 'simulation: yes' : 'simulation: no'
  ];
  els.meta.innerHTML = tags.map((t) => `<span class="tag">${t}</span>`).join('');
}

function showError(msg) {
  els.explanation.innerHTML = `<span class="error">${msg}</span>`;
}

function resetCanvases(plot) {
  els.svg.innerHTML = '';
  els.svg.hidden = plot;
  els.canvas.hidden = !plot;
}

function renderFlowchartFromText(input) {
  resetCanvases(false);
  const segments = input
    .replace(/draw a process flow:?/i, '')
    .split(/->|→/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    return showError('Flowchart needs at least two steps separated by ->');
  }

  const gap = 1000 / (segments.length + 1);
  const content = [];
  content.push('<defs><marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" /></marker></defs>');

  for (let i = 0; i < segments.length; i += 1) {
    const x = gap * (i + 1);
    const y = 270;
    content.push(`<rect x="${x - 90}" y="${y - 35}" width="180" height="70" rx="12" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>`);
    content.push(`<text x="${x}" y="${y + 5}" text-anchor="middle" fill="#e2e8f0" font-size="18">${segments[i]}</text>`);
    if (i < segments.length - 1) {
      const nx = gap * (i + 2);
      content.push(`<line x1="${x + 90}" y1="${y}" x2="${nx - 90}" y2="${y}" stroke="#8b5cf6" stroke-width="3" marker-end="url(#arrow)"/>`);
    }
  }

  els.svg.innerHTML = content.join('');
  state.generatedCode = JSON.stringify({ type: 'flowchart', steps: segments }, null, 2);
  state.codeFormat = 'mermaid_like';
  state.renderType = 'flowchart';
}

function parseQuadratic(text) {
  const cleaned = text.replace(/\s+/g, '');
  const match = cleaned.match(/^([+-]?\d*)x\^2([+-]\d*)x([+-]\d+)=0$/i);
  if (!match) return null;
  const a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
  const b = Number(match[2]);
  const c = Number(match[3]);
  return { a, b, c };
}

function renderEquationOrGraph(input) {
  const quad = parseQuadratic(input);
  if (quad) {
    resetCanvases(false);
    const d = quad.b ** 2 - 4 * quad.a * quad.c;
    const roots = d < 0 ? 'complex roots' : `${((-quad.b + Math.sqrt(d)) / (2 * quad.a)).toFixed(3)}, ${((-quad.b - Math.sqrt(d)) / (2 * quad.a)).toFixed(3)}`;
    els.svg.innerHTML = `
      <rect x="120" y="80" width="760" height="390" rx="16" fill="#0f172a" stroke="#22d3ee"/>
      <text x="500" y="160" text-anchor="middle" fill="#e2e8f0" font-size="40">${input}</text>
      <text x="500" y="250" text-anchor="middle" fill="#94a3b8" font-size="28">D = b² - 4ac = ${d}</text>
      <text x="500" y="320" text-anchor="middle" fill="#94a3b8" font-size="24">Roots: ${roots}</text>
      <text x="500" y="390" text-anchor="middle" fill="#22d3ee" font-size="22">Deterministic local solver</text>
    `;
    state.generatedCode = JSON.stringify({ type: 'equation', ...quad, discriminant: d, roots }, null, 2);
    state.codeFormat = 'latex_like';
    state.renderType = 'equation';
    return;
  }

  resetCanvases(true);
  const ctx = els.canvas.getContext('2d');
  const points = state.csvPoints || null;

  ctx.fillStyle = '#060b1a';
  ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
  ctx.strokeStyle = '#334155';
  for (let x = 0; x <= 1000; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 560);
    ctx.stroke();
  }
  for (let y = 0; y <= 560; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
  }

  if (points && points.length > 1) {
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach(([x, y], idx) => {
      const px = 60 + x * 80;
      const py = 500 - y * 40;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    state.generatedCode = JSON.stringify({ type: 'datavis', points }, null, 2);
    state.codeFormat = 'plotly_like';
    state.renderType = 'datavis';
  } else {
    const parsed = input.replace(/\s+/g, '').toLowerCase().match(/^y=([+-]?\d*\.?\d*)x([+-]\d+(?:\.\d+)?)?$/);
    const m = !parsed ? 1 : parsed[1] === '' || parsed[1] === '+' ? 1 : parsed[1] === '-' ? -1 : Number(parsed[1]);
    const b = !parsed || !parsed[2] ? 0 : Number(parsed[2]);

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= 1000; px += 1) {
      const x = (px - 500) / 50;
      const y = m * x + b;
      const py = 280 - y * 50;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    state.generatedCode = JSON.stringify({ type: 'math_graph', function: input || 'y=x', m, b }, null, 2);
    state.codeFormat = 'plotly_like';
    state.renderType = 'graph';
  }
}

function renderCircuit(input) {
  resetCanvases(false);
  const match = input.replace(/\s+/g, '').match(/V=([\d.]+),R=([\d.]+)/i);
  const V = match ? Number(match[1]) : 9;
  const R = match ? Number(match[2]) : 220;
  const I = V / R;
  const P = V * I;

  els.svg.innerHTML = `
    <rect x="90" y="70" width="820" height="420" rx="16" fill="#0f172a" stroke="#22d3ee" />
    <line x1="170" y1="260" x2="260" y2="260" stroke="#e2e8f0" stroke-width="4" />
    <line x1="260" y1="230" x2="260" y2="290" stroke="#e2e8f0" stroke-width="4" />
    <line x1="280" y1="215" x2="280" y2="305" stroke="#e2e8f0" stroke-width="8" />
    <line x1="280" y1="260" x2="420" y2="260" stroke="#e2e8f0" stroke-width="4" />
    <rect x="420" y="228" width="220" height="64" fill="#1e293b" stroke="#8b5cf6" stroke-width="3" />
    <text x="530" y="266" text-anchor="middle" fill="#e2e8f0" font-size="20">R = ${R} Ω</text>
    <line x1="640" y1="260" x2="770" y2="260" stroke="#e2e8f0" stroke-width="4" />
    <line x1="170" y1="260" x2="170" y2="380" stroke="#e2e8f0" stroke-width="4" />
    <line x1="170" y1="380" x2="770" y2="380" stroke="#e2e8f0" stroke-width="4" />
    <line x1="770" y1="260" x2="770" y2="380" stroke="#e2e8f0" stroke-width="4" />
    <text x="270" y="185" fill="#22d3ee" font-size="22">V = ${V}V</text>
    <text x="530" y="430" text-anchor="middle" fill="#94a3b8" font-size="22">I = ${I.toFixed(3)}A, P = ${P.toFixed(3)}W</text>
  `;

  state.generatedCode = JSON.stringify({
    type: 'circuit',
    analysis: {
      total_resistance: R,
      total_current: I,
      power: P,
      equations: ['V = I R', 'P = V I']
    }
  }, null, 2);
  state.codeFormat = 'circuitjs_like';
  state.renderType = 'circuit';
}

function renderBiology(input) {
  resetCanvases(false);
  const steps = ['Light Capture', 'ATP/NADPH', 'Calvin Cycle', 'Glucose Output'];
  els.svg.innerHTML = `
    <defs><marker id="arrowB" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee"/></marker></defs>
    <rect x="60" y="60" width="880" height="440" rx="14" fill="#0f172a" stroke="#4ade80"/>
    ${steps
      .map((s, i) => `<rect x="${120 + i * 200}" y="230" width="170" height="80" rx="12" fill="#132337" stroke="#22d3ee"/><text x="${205 + i * 200}" y="278" text-anchor="middle" fill="#e2e8f0" font-size="18">${s}</text>`)
      .join('')}
    <line x1="290" y1="270" x2="320" y2="270" stroke="#22d3ee" stroke-width="3" marker-end="url(#arrowB)"/>
    <line x1="490" y1="270" x2="520" y2="270" stroke="#22d3ee" stroke-width="3" marker-end="url(#arrowB)"/>
    <line x1="690" y1="270" x2="720" y2="270" stroke="#22d3ee" stroke-width="3" marker-end="url(#arrowB)"/>
    <text x="500" y="130" text-anchor="middle" fill="#94a3b8" font-size="24">${input}</text>
  `;

  state.generatedCode = JSON.stringify({ type: 'bio_process', title: input, steps }, null, 2);
  state.codeFormat = 'mermaid_like';
  state.renderType = 'biology';
}

function generateVisualization() {
  const prompt = els.prompt.value.trim();
  if (!prompt) return showError('Prompt is empty.');
  if (!state.classification) classifyPrompt();

  const domain = state.classification?.domain;
  if (domain === 'circuit') renderCircuit(prompt);
  else if (domain === 'math') renderEquationOrGraph(prompt);
  else if (domain === 'biology') renderBiology(prompt);
  else renderFlowchartFromText(prompt);

  saveSnapshot();
}

function explainOutput() {
  if (!state.classification) return showError('Run classification first.');
  const detailLevel = complexityLabels[els.complexity.value];
  const domain = state.classification.domain;
  const lines = [
    `Complexity mode: ${detailLevel}.`,
    `Domain routed by local orchestrator: ${domain}.`,
    `Renderer format: ${state.codeFormat}.`,
    'All outputs are generated deterministically in-browser, with no paid API calls.'
  ];
  if (domain === 'circuit') lines.push('Circuit uses Ohm-law baseline analysis with current and power calculation.');
  if (domain === 'math') lines.push('Math mode supports quadratic solving, function graphing, and CSV plotting fallback.');
  if (domain === 'biology') lines.push('Biology mode produces process-style staged diagrams for cycle visualization.');
  els.explanation.textContent = lines.join(' ');
}

function audioDescribe() {
  const text = `Diagram type ${state.renderType}. ${els.explanation.textContent || 'No explanation available.'}`;
  if (!('speechSynthesis' in window)) return showError('Speech synthesis unavailable in this browser.');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function exportSVG() {
  if (els.svg.hidden) return showError('SVG export is available when SVG renderer is active.');
  const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560">${els.svg.innerHTML}</svg>`], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `nexus-${state.renderType}.svg`);
}

function exportPNG() {
  const temp = document.createElement('canvas');
  temp.width = 1000;
  temp.height = 560;
  const ctx = temp.getContext('2d');

  if (!els.canvas.hidden) {
    ctx.drawImage(els.canvas, 0, 0);
    temp.toBlob((blob) => blob && downloadBlob(blob, `nexus-${state.renderType}.png`), 'image/png');
    return;
  }

  const img = new Image();
  const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 560">${els.svg.innerHTML}</svg>`;
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    temp.toBlob((pngBlob) => pngBlob && downloadBlob(pngBlob, `nexus-${state.renderType}.png`), 'image/png');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function exportJSON() {
  const output = {
    classification: state.classification,
    codeFormat: state.codeFormat,
    generatedCode: safeParse(state.generatedCode),
    prompt: els.prompt.value,
    complexity: complexityLabels[els.complexity.value],
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `nexus-${state.renderType}.json`);
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveSnapshot() {
  const snapshot = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    prompt: els.prompt.value,
    classification: state.classification,
    renderType: state.renderType,
    codeFormat: state.codeFormat,
    generatedCode: state.generatedCode
  };
  state.history.unshift(snapshot);
  state.history = state.history.slice(0, 20);
  localStorage.setItem(storeKey, JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  if (!state.history.length) {
    els.historyList.innerHTML = '<li class="hint">No saved versions yet.</li>';
    return;
  }
  els.historyList.innerHTML = state.history
    .map(
      (item) => `<li><button data-id="${item.id}"><strong>${item.renderType}</strong> · ${new Date(item.createdAt).toLocaleString()}<br/><span class="hint">${item.prompt.slice(0, 56)}</span></button></li>`
    )
    .join('');
}

function loadSnapshot(id) {
  const snap = state.history.find((h) => h.id === id);
  if (!snap) return;
  els.prompt.value = snap.prompt;
  state.classification = snap.classification;
  state.renderType = snap.renderType;
  state.codeFormat = snap.codeFormat;
  state.generatedCode = snap.generatedCode;
  renderMeta();
  generateVisualization();
}

function resetWorkspace() {
  els.prompt.value = 'Draw a process flow: Capture -> Classify -> Render -> Verify -> Export';
  state.classification = null;
  state.generatedCode = '';
  state.csvPoints = null;
  els.meta.innerHTML = '';
  els.explanation.textContent = 'Fresh workspace ready.';
  resetCanvases(false);
  els.svg.innerHTML = '';
}

function setupHistoryClicks() {
  els.historyList.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-id]');
    if (!btn) return;
    loadSnapshot(btn.dataset.id);
  });
}

function setupNetworkStatus() {
  const update = () => {
    els.networkStatus.textContent = navigator.onLine ? 'Network: online (offline cache active).' : 'Network: offline mode active.';
  };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

function setupVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    els.startVoice.disabled = true;
    els.stopVoice.disabled = true;
    return;
  }
  const recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    els.prompt.value = transcript;
  };

  els.startVoice.addEventListener('click', () => recognition.start());
  els.stopVoice.addEventListener('click', () => recognition.stop());
}

function setupFileInput() {
  els.fileInput.addEventListener('change', async () => {
    const file = els.fileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    const points = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((n) => Number(n.trim())))
      .filter((arr) => arr.length >= 2 && Number.isFinite(arr[0]) && Number.isFinite(arr[1]))
      .map(([x, y]) => [x, y]);

    if (!points.length) {
      showError('CSV must contain x,y pairs per line.');
      return;
    }
    state.csvPoints = points;
    els.prompt.value = 'CSV data graph';
    state.classification = { ...state.classification, domain: 'math', sub_domain: 'statistics', visualization_type: 'plotly' };
    renderMeta();
    generateVisualization();
  });
}

function setupSketch() {
  const canvas = els.sketchPad;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  let drawing = false;

  const pos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
  };

  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  window.addEventListener('pointerup', () => {
    drawing = false;
  });

  els.clearSketch.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

function bindEvents() {
  els.inputMode.addEventListener('change', setModePanels);
  els.complexity.addEventListener('input', updateComplexity);
  els.classify.addEventListener('click', classifyPrompt);
  els.generate.addEventListener('click', generateVisualization);
  els.explain.addEventListener('click', explainOutput);
  els.announce.addEventListener('click', audioDescribe);
  els.exportSvg.addEventListener('click', exportSVG);
  els.exportPng.addEventListener('click', exportPNG);
  els.exportJson.addEventListener('click', exportJSON);
  els.newWorkspace.addEventListener('click', resetWorkspace);
  els.toggleContrast.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

bindEvents();
setModePanels();
updateComplexity();
renderHistory();
setupHistoryClicks();
setupNetworkStatus();
setupVoice();
setupFileInput();
setupSketch();
classifyPrompt();
generateVisualization();
