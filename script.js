const bootScreen = document.getElementById('bootScreen');
const os = document.getElementById('os');
const desktop = document.getElementById('desktop');
const appGrid = document.getElementById('appGrid');
const windowTabs = document.getElementById('windowTabs');
const template = document.getElementById('windowTemplate');
const liveClock = document.getElementById('liveClock');
const liveDate = document.getElementById('liveDate');
const netStatus = document.getElementById('netStatus');

let zIndex = 10;
let winId = 0;
const windows = new Map();

const appState = {
  notes: localStorage.getItem('ds_notes') || 'Welcome to doomsageOSGod!\nDoomsageOS by kunal dewangan',
  todos: JSON.parse(localStorage.getItem('ds_todos') || '[]'),
  accent: localStorage.getItem('ds_accent') || '#7c5cff',
};

document.documentElement.style.setProperty('--accent', appState.accent);

setTimeout(() => {
  bootScreen.classList.add('hidden');
  os.classList.remove('hidden');
}, 1300);

const apps = [
  { name: 'Terminal', icon: '⌨️', render: terminalApp },
  { name: 'Messenger', icon: '💬', render: messengerApp },
  { name: 'Notes', icon: '📝', render: notesApp },
  { name: 'Todo', icon: '✅', render: todoApp },
  { name: 'Calculator', icon: '🧮', render: calculatorApp },
  { name: 'Whiteboard Pro', icon: '🎨', render: whiteboardApp },
  { name: 'Music Player', icon: '🎵', render: musicPlayerApp },
  { name: 'Camera', icon: '📷', render: cameraApp },
  { name: 'Browser', icon: '🌐', render: browserApp },
  { name: 'Weather', icon: '⛅', render: weatherApp },
  { name: 'Clock+Timer', icon: '⏱️', render: timerApp },
  { name: 'Files', icon: '📁', render: filesApp },
  { name: 'System', icon: '🖥️', render: systemApp },
  { name: 'Settings', icon: '⚙️', render: settingsApp },
  { name: 'Doomsage', icon: '🚀', render: doomsageApp },
];

apps.forEach((app) => {
  const btn = document.createElement('button');
  btn.className = 'launcher-btn';
  btn.innerHTML = `<span>${app.icon}</span><span>${app.name}</span>`;
  btn.onclick = () => openApp(app);
  appGrid.appendChild(btn);
});

function openApp(app) {
  const node = template.content.firstElementChild.cloneNode(true);
  const id = `win-${++winId}`;
  node.dataset.id = id;
  node.style.left = `${Math.random() * 26 + 6}%`;
  node.style.top = `${Math.random() * 16 + 8}%`;
  node.style.zIndex = ++zIndex;

  const title = node.querySelector('.window-title');
  const content = node.querySelector('.window-content');
  title.textContent = `${app.icon} ${app.name}`;
  app.render(content, node);

  const tab = document.createElement('button');
  tab.className = 'window-tab';
  tab.textContent = `${app.icon} ${app.name}`;
  tab.draggable = true;
  tab.dataset.id = id;

  tab.onclick = () => restoreAndFocus(id);
  tab.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', id));
  tab.addEventListener('dragover', (e) => e.preventDefault());
  tab.addEventListener('drop', (e) => {
    e.preventDefault();
    const fromId = e.dataTransfer.getData('text/plain');
    if (!fromId || fromId === id) return;
    const from = [...windowTabs.children].find((x) => x.dataset.id === fromId);
    if (from) windowTabs.insertBefore(from, tab);
  });

  windows.set(id, { id, node, tab, app });
  windowTabs.appendChild(tab);

  node.addEventListener('mousedown', () => focusWindow(id));
  const [minimize, maximize, close] = node.querySelectorAll('.window-controls button');

  minimize.onclick = () => {
    node.style.display = 'none';
    tab.classList.remove('active');
  };
  maximize.onclick = () => node.classList.toggle('maximized');
  close.onclick = () => {
    node.remove();
    tab.remove();
    windows.delete(id);
  };

  makeDraggable(node, node.querySelector('.window-header'));
  makeResizable(node, node.querySelector('.resize-handle'));
  desktop.appendChild(node);
  focusWindow(id);
}

function focusWindow(id) {
  const item = windows.get(id);
  if (!item) return;
  item.node.style.display = 'flex';
  item.node.style.zIndex = ++zIndex;
  [...windowTabs.children].forEach((t) => t.classList.toggle('active', t.dataset.id === id));
}

function restoreAndFocus(id) {
  const item = windows.get(id);
  if (!item) return;
  item.node.style.display = 'flex';
  focusWindow(id);
}

function makeDraggable(win, handle) {
  let sx = 0; let sy = 0; let sl = 0; let st = 0;
  handle.addEventListener('mousedown', (e) => {
    if (win.classList.contains('maximized')) return;
    sx = e.clientX;
    sy = e.clientY;
    sl = win.offsetLeft;
    st = win.offsetTop;

    const move = (ev) => {
      win.style.left = `${Math.max(0, sl + ev.clientX - sx)}px`;
      win.style.top = `${Math.max(0, st + ev.clientY - sy)}px`;
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  });
}

function makeResizable(win, handle) {
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const sw = win.offsetWidth;
    const sh = win.offsetHeight;

    const move = (ev) => {
      win.style.width = `${Math.max(350, sw + ev.clientX - sx)}px`;
      win.style.height = `${Math.max(260, sh + ev.clientY - sy)}px`;
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  });
}

function terminalApp(el) {
  el.innerHTML = `
    <div class="terminal" id="terminalOut"></div>
    <input id="terminalIn" placeholder="help, apps, date, open doomsage, clear" />
  `;
  const out = el.querySelector('#terminalOut');
  const input = el.querySelector('#terminalIn');
  const write = (txt) => {
    const d = document.createElement('div');
    d.textContent = txt;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  write('doomsageOSGod terminal ready.');

  const cmds = {
    help: () => write('help, apps, date, whoami, online, open doomsage, clear'),
    apps: () => write(apps.map((a) => a.name).join(', ')),
    date: () => write(new Date().toString()),
    whoami: () => write('kunal-dewangan@doomsageOSGod'),
    online: () => write(navigator.onLine ? 'online' : 'offline'),
    clear: () => (out.innerHTML = ''),
    'open doomsage': () => {
      window.open('https://doomsage.in', '_blank', 'noopener');
      write('Opening doomsage.in');
    },
  };

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    write(`> ${cmd}`);
    cmds[cmd] ? cmds[cmd]() : write('Unknown command');
    input.value = '';
  });
}

function notesApp(el) {
  el.innerHTML = '<h3>Smart Notes</h3><textarea id="notesArea" rows="14"></textarea><button id="saveNotes" class="action">Save</button>';
  const area = el.querySelector('#notesArea');
  area.value = appState.notes;
  el.querySelector('#saveNotes').onclick = () => {
    appState.notes = area.value;
    localStorage.setItem('ds_notes', appState.notes);
  };
}

function todoApp(el) {
  el.innerHTML = '<h3>Todo</h3><input id="todoInput" placeholder="Add task"/><button class="action" id="todoAdd">Add</button><div id="todoList"></div>';
  const list = el.querySelector('#todoList');
  const render = () => {
    list.innerHTML = appState.todos.map((t, i) => `<div class="todo-item"><span>${t}</span><button class="action" data-i="${i}">Done</button></div>`).join('');
    list.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        appState.todos.splice(Number(b.dataset.i), 1);
        localStorage.setItem('ds_todos', JSON.stringify(appState.todos));
        render();
      };
    });
  };
  el.querySelector('#todoAdd').onclick = () => {
    const f = el.querySelector('#todoInput');
    if (!f.value.trim()) return;
    appState.todos.push(f.value.trim());
    localStorage.setItem('ds_todos', JSON.stringify(appState.todos));
    f.value = '';
    render();
  };
  render();
}

function calculatorApp(el) {
  el.innerHTML = '<h3>Calculator</h3><input id="expr" placeholder="(12+3)*4"/><button class="action" id="calc">Calculate</button><p id="res">Result: -</p>';
  el.querySelector('#calc').onclick = () => {
    const ex = el.querySelector('#expr').value;
    if (!/^[\d\s+\-*/().%]+$/.test(ex)) return (el.querySelector('#res').textContent = 'Result: Invalid');
    try {
      const v = Function(`"use strict"; return (${ex})`)();
      el.querySelector('#res').textContent = `Result: ${v}`;
    } catch {
      el.querySelector('#res').textContent = 'Result: Invalid';
    }
  };
}

function whiteboardApp(el) {
  el.innerHTML = `
    <h3>Whiteboard Pro (Pen, Eraser, Select, Background, Undo/Redo)</h3>
    <div class="wb-toolbar">
      <select id="wbTool">
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
        <option value="select">Select/Move</option>
      </select>
      <input id="wbSize" type="range" min="1" max="36" value="4" />
      <input id="wbBg" type="color" value="#ffffff" />
      <button class="action" id="wbUndo">Undo</button>
      <button class="action" id="wbRedo">Redo</button>
      <button class="action" id="wbClear">Clear</button>
    </div>
    <div class="wb-palette" id="wbPalette"></div>
    <canvas id="whiteboardCanvas" width="1300" height="700"></canvas>
  `;

  const canvas = el.querySelector('#whiteboardCanvas');
  const ctx = canvas.getContext('2d');
  const toolField = el.querySelector('#wbTool');
  const sizeField = el.querySelector('#wbSize');
  const bgField = el.querySelector('#wbBg');
  const palette = el.querySelector('#wbPalette');

  const colors = ['#000000', '#ff2d55', '#ff9500', '#ffcc00', '#34c759', '#00c7ff', '#007aff', '#af52de', '#ffffff'];
  let currentColor = '#000000';
  let bgColor = '#ffffff';

  colors.forEach((c) => {
    const d = document.createElement('button');
    d.className = 'color-dot';
    d.style.background = c;
    d.onclick = () => { currentColor = c; };
    palette.appendChild(d);
  });

  const strokes = [];
  const redo = [];
  let drawing = false;
  let currentStroke = null;
  let selectedIndex = -1;
  let dragStart = null;

  const toPoint = (ev) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * canvas.width, y: ((ev.clientY - r.top) / r.height) * canvas.height };
  };

  const strokeBounds = (s) => {
    const xs = s.points.map((p) => p.x);
    const ys = s.points.map((p) => p.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  };

  const drawStroke = (s) => {
    if (!s.points.length) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i += 1) ctx.lineTo(s.points[i].x, s.points[i].y);
    ctx.stroke();
  };

  const render = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((s, idx) => {
      drawStroke(s);
      if (idx === selectedIndex) {
        const b = strokeBounds(s);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(b.minX - 8, b.minY - 8, b.maxX - b.minX + 16, b.maxY - b.minY + 16);
        ctx.setLineDash([]);
      }
    });
  };

  canvas.addEventListener('pointerdown', (ev) => {
    const p = toPoint(ev);
    const tool = toolField.value;
    if (tool === 'select') {
      selectedIndex = -1;
      for (let i = strokes.length - 1; i >= 0; i -= 1) {
        const b = strokeBounds(strokes[i]);
        if (p.x >= b.minX - 10 && p.x <= b.maxX + 10 && p.y >= b.minY - 10 && p.y <= b.maxY + 10) {
          selectedIndex = i;
          dragStart = p;
          break;
        }
      }
      render();
      return;
    }

    drawing = true;
    currentStroke = { tool, color: currentColor, size: Number(sizeField.value), points: [p] };
    strokes.push(currentStroke);
    redo.length = 0;
    render();
  });

  canvas.addEventListener('pointermove', (ev) => {
    const p = toPoint(ev);

    if (toolField.value === 'select' && selectedIndex >= 0 && dragStart) {
      const dx = p.x - dragStart.x;
      const dy = p.y - dragStart.y;
      strokes[selectedIndex].points.forEach((pt) => {
        pt.x += dx;
        pt.y += dy;
      });
      dragStart = p;
      render();
      return;
    }

    if (!drawing || !currentStroke) return;
    currentStroke.points.push(p);
    render();
  });

  const stop = () => { drawing = false; currentStroke = null; dragStart = null; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointerleave', stop);

  bgField.oninput = () => {
    bgColor = bgField.value;
    render();
  };

  el.querySelector('#wbUndo').onclick = () => {
    if (!strokes.length) return;
    redo.push(strokes.pop());
    selectedIndex = -1;
    render();
  };

  el.querySelector('#wbRedo').onclick = () => {
    if (!redo.length) return;
    strokes.push(redo.pop());
    render();
  };

  el.querySelector('#wbClear').onclick = () => {
    strokes.length = 0;
    redo.length = 0;
    selectedIndex = -1;
    render();
  };

  render();
}

function musicPlayerApp(el) {
  el.innerHTML = `
    <h3>Real Music Player</h3>
    <p>Play local audio files or paste direct audio URL.</p>
    <input type="file" id="musicFiles" accept="audio/*" multiple />
    <input id="musicUrl" placeholder="https://example.com/song.mp3" />
    <button class="action" id="addUrl">Add URL</button>
    <ul id="playlist" class="playlist"></ul>
    <audio id="audioPlayer" controls></audio>
  `;

  const list = el.querySelector('#playlist');
  const player = el.querySelector('#audioPlayer');
  const tracks = [];

  const renderList = () => {
    list.innerHTML = tracks.map((t, i) => `<li><button class="action" data-i="${i}">Play</button> ${t.name}</li>`).join('');
    list.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        const t = tracks[Number(b.dataset.i)];
        player.src = t.src;
        player.play();
      };
    });
  };

  el.querySelector('#musicFiles').addEventListener('change', (ev) => {
    const files = Array.from(ev.target.files || []);
    files.forEach((f) => tracks.push({ name: f.name, src: URL.createObjectURL(f) }));
    renderList();
  });

  el.querySelector('#addUrl').onclick = () => {
    const url = el.querySelector('#musicUrl').value.trim();
    if (!url) return;
    tracks.push({ name: url, src: url });
    renderList();
  };
}

function cameraApp(el) {
  el.innerHTML = '<h3>Camera</h3><button class="action" id="camStart">Start</button> <button class="action" id="camStop">Stop</button><video id="camVideo" autoplay playsinline style="width:100%;margin-top:.8rem;border-radius:12px;background:black"></video>';
  let stream;
  const video = el.querySelector('#camVideo');
  el.querySelector('#camStart').onclick = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
  };
  el.querySelector('#camStop').onclick = () => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  };
}

function browserApp(el) {
  el.innerHTML = `
    <h3>Mini Browser</h3>
    <div class="mini-browser">
      <div class="mini-browser-toolbar">
        <button class="action" id="bBack">←</button>
        <button class="action" id="bForward">→</button>
        <button class="action" id="bReload">⟳</button>
        <input id="u" value="https://example.com" />
        <button class="action" id="openU">Go</button>
      </div>
      <p id="uStatus" class="mini-browser-status"></p>
      <iframe id="miniFrame" title="Mini Browser" referrerpolicy="no-referrer" loading="eager"></iframe>
    </div>
  `;

  const input = el.querySelector('#u');
  const status = el.querySelector('#uStatus');
  const frame = el.querySelector('#miniFrame');
  let history = [];
  let idx = -1;

  const normalizeUrl = (raw) => {
    let u = String(raw || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    return u;
  };

  const renderNavState = () => {
    el.querySelector('#bBack').disabled = idx <= 0;
    el.querySelector('#bForward').disabled = idx >= history.length - 1;
  };

  const showBlockedHint = (url) => {
    status.textContent = `If this page does not load, the site may block iframe embedding (X-Frame-Options/CSP): ${url}`;
  };

  const openUrl = (rawUrl, push = true) => {
    const u = normalizeUrl(rawUrl);
    if (!u) {
      status.textContent = 'Please enter a valid URL.';
      return;
    }
    if (push) {
      history = history.slice(0, idx + 1);
      history.push(u);
      idx = history.length - 1;
    }
    frame.src = u;
    input.value = u;
    status.textContent = `Loading: ${u}`;
    renderNavState();
    setTimeout(() => showBlockedHint(u), 2500);
  };

  el.querySelector('#openU').onclick = () => openUrl(input.value, true);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') openUrl(input.value, true);
  });

  el.querySelector('#bBack').onclick = () => {
    if (idx <= 0) return;
    idx -= 1;
    openUrl(history[idx], false);
  };

  el.querySelector('#bForward').onclick = () => {
    if (idx >= history.length - 1) return;
    idx += 1;
    openUrl(history[idx], false);
  };

  el.querySelector('#bReload').onclick = () => {
    if (idx < 0) return;
    openUrl(history[idx], false);
  };

  frame.addEventListener('load', () => {
    status.textContent = `Showing: ${input.value}`;
  });

  openUrl(input.value, true);
}

function weatherApp(el) {
  el.innerHTML = '<h3>Live Weather</h3><input id="city" value="Delhi" /><button class="action" id="getW">Fetch</button><div id="w" class="panel">No data.</div>';
  const out = el.querySelector('#w');
  el.querySelector('#getW').onclick = async () => {
    const city = el.querySelector('#city').value.trim();
    if (!city) return;
    out.textContent = 'Loading...';
    try {
      const g = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`).then((r) => r.json());
      const p = g.results?.[0];
      if (!p) return (out.textContent = 'City not found.');
      const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,wind_speed_10m,weather_code`).then((r) => r.json());
      out.innerHTML = `<strong>${p.name}</strong><p>Temp: ${w.current.temperature_2m}°C</p><p>Wind: ${w.current.wind_speed_10m} km/h</p><p>Code: ${w.current.weather_code}</p>`;
    } catch {
      out.textContent = 'Failed to fetch weather.';
    }
  };
}

function timerApp(el) {
  el.innerHTML = '<h3>Clock + Stopwatch</h3><div class="grid-2"><div class="panel"><p>Now</p><h2 id="now"></h2></div><div class="panel"><p>Stopwatch</p><h2 id="sw">00:00.0</h2></div></div><button class="action" id="st">Start</button> <button class="action" id="sp">Stop</button> <button class="action" id="rs">Reset</button>';
  const now = el.querySelector('#now');
  const sw = el.querySelector('#sw');
  let base = 0; let start = 0; let int;

  const nowInt = setInterval(() => (now.textContent = new Date().toLocaleTimeString()), 500);
  now.textContent = new Date().toLocaleTimeString();

  const draw = () => {
    const t = base + (start ? Date.now() - start : 0);
    const s = t / 1000;
    sw.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}.${Math.floor((s % 1) * 10)}`;
  };

  el.querySelector('#st').onclick = () => { if (!start) { start = Date.now(); int = setInterval(draw, 100); } };
  el.querySelector('#sp').onclick = () => { if (start) { base += Date.now() - start; start = 0; clearInterval(int); } };
  el.querySelector('#rs').onclick = () => { base = 0; start = 0; clearInterval(int); draw(); };

  const cleanup = () => clearInterval(nowInt);
  el.closest('.window').querySelector('.close').addEventListener('click', cleanup, { once: true });
}

function filesApp(el) {
  el.innerHTML = '<h3>File Inspector</h3><input type="file" id="f" multiple /><ul id="l"></ul>';
  const list = el.querySelector('#l');
  el.querySelector('#f').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    list.innerHTML = files.map((f) => `<li>${f.name} — ${(f.size / 1024).toFixed(1)} KB — ${f.type || 'unknown'}</li>`).join('');
  });
}

function systemApp(el) {
  el.innerHTML = '<h3>System Dashboard</h3><div id="sys" class="grid-3"></div><button class="action" id="rf">Refresh</button>';
  const sys = el.querySelector('#sys');
  const render = async () => {
    const items = [
      ['Online', navigator.onLine ? 'Yes' : 'No'],
      ['Platform', navigator.platform || 'N/A'],
      ['Language', navigator.language || 'N/A'],
      ['CPU Cores', navigator.hardwareConcurrency || 'N/A'],
      ['Memory (GB)', navigator.deviceMemory || 'N/A'],
      ['Screen', `${screen.width}x${screen.height}`],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
    ];
    if (navigator.storage?.estimate) {
      const s = await navigator.storage.estimate();
      items.push(['Storage Used', `${Math.round((s.usage || 0) / (1024 * 1024))} MB`]);
      items.push(['Storage Quota', `${Math.round((s.quota || 0) / (1024 * 1024))} MB`]);
    }
    sys.innerHTML = items.map(([k, v]) => `<div class="panel"><p>${k}</p><strong>${v}</strong></div>`).join('');
  };
  el.querySelector('#rf').onclick = render;
  render();
}

function settingsApp(el) {
  el.innerHTML = `<h3>Settings</h3><label>Accent color<input id="acc" type="color" value="${appState.accent}"/></label><button class="action" id="ap">Apply</button>`;
  el.querySelector('#ap').onclick = () => {
    const c = el.querySelector('#acc').value;
    appState.accent = c;
    localStorage.setItem('ds_accent', c);
    document.documentElement.style.setProperty('--accent', c);
  };
}

function doomsageApp(el) {
  el.innerHTML = '<h3>Doomsage</h3><p>Open official doomsage website.</p><button class="action" id="doom">Open doomsage.in</button>';
  el.querySelector('#doom').onclick = () => window.open('https://doomsage.in', '_blank', 'noopener');
}

// Messenger App (Google login + unique ID + friends + chat)
const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

const messengerRuntime = {
  initialized: false,
  ready: false,
  auth: null,
  db: null,
  currentUser: null,
};

function isFirestoreSetupError(err) {
  const msg = String(err?.message || '').toLowerCase();
  const code = String(err?.code || '').toLowerCase();
  return (
    code.includes('permission-denied') ||
    code.includes('failed-precondition') ||
    msg.includes('cloud firestore api has not been used') ||
    msg.includes('firestore has not been enabled') ||
    msg.includes('database') && msg.includes('not found')
  );
}

function setMessengerStatus(statusEl, message, details = '') {
  statusEl.innerHTML = `
    <strong>${message}</strong>
    ${details ? `<p>${details}</p>` : ''}
  `;
}

async function initMessengerBackend() {
  if (messengerRuntime.initialized) return messengerRuntime.ready;
  messengerRuntime.initialized = true;

  const configured = Object.values(FIREBASE_CONFIG).every((v) => String(v || '').trim());
  if (!configured || typeof firebase === 'undefined') {
    messengerRuntime.ready = false;
    return false;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  messengerRuntime.auth = firebase.auth();
  messengerRuntime.db = firebase.firestore();
  await messengerRuntime.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  messengerRuntime.ready = true;
  return true;
}

function messengerApp(el, win) {
  el.innerHTML = `
    <h3>Messenger (Google Login + Unique ID + Friends + Chat)</h3>
    <div id="msgrStatus" class="panel">Initializing...</div>
    <div id="msgrAuth"></div>
    <div id="msgrBody" class="hidden">
      <div class="grid-2" style="margin-top:.6rem">
        <div class="panel">
          <h4>My Identity</h4>
          <p id="myGoogle"></p>
          <p><strong>My Unique ID:</strong> <span id="myUniqueId">-</span></p>
        </div>
        <div class="panel">
          <h4>Add Friend</h4>
          <input id="friendIdInput" placeholder="Enter friend's unique ID" />
          <button id="sendFriendReq" class="action">Send Request</button>
          <p id="reqMsg"></p>
        </div>
      </div>

      <div class="grid-2" style="margin-top:.8rem">
        <div class="panel">
          <h4>Incoming Requests</h4>
          <div id="incomingRequests">No requests.</div>
        </div>
        <div class="panel">
          <h4>Friends</h4>
          <div id="friendsList">No friends yet.</div>
        </div>
      </div>

      <div class="panel" style="margin-top:.8rem">
        <h4>Chat</h4>
        <p>Talking to: <strong id="chatWith">None selected</strong></p>
        <div id="chatMessages" class="terminal" style="height:240px"></div>
        <input id="chatInput" placeholder="Type message" />
        <button id="sendChat" class="action">Send</button>
      </div>
    </div>
  `;

  const status = el.querySelector('#msgrStatus');
  const authWrap = el.querySelector('#msgrAuth');
  const body = el.querySelector('#msgrBody');

  const unsub = [];
  let selectedFriend = null;

  const cleanup = () => {
    unsub.forEach((f) => f());
  };
  win.querySelector('.close').addEventListener('click', cleanup, { once: true });

  initMessengerBackend().then(async (ready) => {
    if (!ready) {
      status.innerHTML = `
        <strong>Messenger backend is not configured yet.</strong>
        <p>To enable real Google-login messaging, fill <code>FIREBASE_CONFIG</code> in <code>script.js</code> with your Firebase project values and enable:</p>
        <ul>
          <li>Authentication → Google provider</li>
          <li>Cloud Firestore</li>
        </ul>
      `;
      authWrap.innerHTML = '';
      return;
    }

    status.textContent = 'Connected to Firebase backend.';

    unsub.push(messengerRuntime.auth.onAuthStateChanged(async (user) => {
      messengerRuntime.currentUser = user;
      if (!user) {
        body.classList.add('hidden');
        authWrap.innerHTML = '<button id="msLogin" class="action">Login with Google</button>';
        authWrap.querySelector('#msLogin').onclick = async () => {
          const provider = new firebase.auth.GoogleAuthProvider();
          await messengerRuntime.auth.signInWithPopup(provider);
        };
        return;
      }

      authWrap.innerHTML = '<button id="msLogout" class="action">Logout</button>';
      authWrap.querySelector('#msLogout').onclick = () => messengerRuntime.auth.signOut();

      body.classList.remove('hidden');
      try {
        await ensureUserProfile(user);
        await renderSelfIdentity(el, user);
        watchIncomingRequests(el, user, unsub, rerenderAll);
        watchFriends(el, user, unsub, rerenderAll);
        rerenderAll();
      } catch (err) {
        console.error('Messenger profile init error:', err);
        if (isFirestoreSetupError(err)) {
          setMessengerStatus(
            status,
            'Firestore is not ready yet for Messenger.',
            'Open Firebase → Firestore Database → Create database, then refresh this page. Also keep Google Auth enabled and add your domain in Authorized domains.'
          );
        } else {
          setMessengerStatus(status, 'Messenger failed to load user profile.', err.message || 'Unknown error');
        }
      }
    }));
  }).catch((err) => {
    status.textContent = `Messenger init failed: ${err.message}`;
  });

  async function rerenderAll() {
    const user = messengerRuntime.currentUser;
    if (!user) return;
    await renderSelfIdentity(el, user);
    setupActions(el, user, () => selectedFriend, (v) => { selectedFriend = v; }, unsub);
  }
}

async function ensureUserProfile(user) {
  const db = messengerRuntime.db;
  const userRef = db.collection('users').doc(user.uid);
  const snap = await userRef.get();
  if (snap.exists) {
    const profile = snap.data() || {};
    if (!profile.doomsageId) {
      const uniqueId = `doom-${user.uid.slice(0, 8)}`;
      await userRef.set({ doomsageId: uniqueId }, { merge: true });
      return { ...profile, doomsageId: uniqueId };
    }
    return profile;
  }

  const uniqueId = `doom-${user.uid.slice(0, 8)}`;
  const profile = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || 'User',
    doomsageId: uniqueId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  await userRef.set(profile);
  return profile;
}

async function renderSelfIdentity(el, user) {
  const snap = await messengerRuntime.db.collection('users').doc(user.uid).get();
  const profile = snap.data() || {};
  const uniqueId = profile.doomsageId || `doom-${user.uid.slice(0, 8)}`;

  if (!profile.doomsageId) {
    await messengerRuntime.db.collection('users').doc(user.uid).set({ doomsageId: uniqueId }, { merge: true });
  }

  el.querySelector('#myGoogle').textContent = `Google: ${user.email}`;
  el.querySelector('#myUniqueId').textContent = uniqueId;
}

function watchIncomingRequests(el, user, unsub, rerenderAll) {
  const reqEl = el.querySelector('#incomingRequests');
  const q = messengerRuntime.db.collection('friend_requests')
    .where('toUid', '==', user.uid)
    .where('status', '==', 'pending');

  const un = q.onSnapshot(async (snap) => {
    if (snap.empty) {
      reqEl.textContent = 'No requests.';
      return;
    }

    const rows = await Promise.all(snap.docs.map(async (d) => {
      const data = d.data();
      const u = await messengerRuntime.db.collection('users').doc(data.fromUid).get();
      return { id: d.id, data, profile: u.data() };
    }));

    reqEl.innerHTML = rows.map((r) => `
      <div class="todo-item">
        <span>${r.profile?.doomsageId || r.data.fromUid}</span>
        <span>
          <button class="action" data-a="accept" data-id="${r.id}" data-from="${r.data.fromUid}">Accept</button>
          <button class="action" data-a="reject" data-id="${r.id}">Reject</button>
        </span>
      </div>
    `).join('');

    reqEl.querySelectorAll('button').forEach((btn) => {
      btn.onclick = async () => {
        const action = btn.dataset.a;
        const reqId = btn.dataset.id;
        const reqRef = messengerRuntime.db.collection('friend_requests').doc(reqId);
        if (action === 'reject') {
          await reqRef.update({ status: 'rejected' });
        } else {
          const fromUid = btn.dataset.from;
          await reqRef.update({ status: 'accepted' });
          const pair = [fromUid, user.uid].sort();
          const friendDoc = `${pair[0]}_${pair[1]}`;
          await messengerRuntime.db.collection('friends').doc(friendDoc).set({
            users: pair,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
        rerenderAll();
      };
    });
  });

  unsub.push(un);
}

function watchFriends(el, user, unsub, rerenderAll) {
  const friendsEl = el.querySelector('#friendsList');
  const q = messengerRuntime.db.collection('friends').where('users', 'array-contains', user.uid);

  const un = q.onSnapshot(async (snap) => {
    if (snap.empty) {
      friendsEl.textContent = 'No friends yet.';
      return;
    }

    const entries = await Promise.all(snap.docs.map(async (d) => {
      const pair = d.data().users || [];
      const friendUid = pair.find((u) => u !== user.uid);
      const prof = friendUid ? (await messengerRuntime.db.collection('users').doc(friendUid).get()).data() : null;
      return { friendUid, profile: prof, chatId: [user.uid, friendUid].sort().join('_') };
    }));

    friendsEl.innerHTML = entries.map((e) => `
      <div class="todo-item">
        <span>${e.profile?.doomsageId || e.friendUid}</span>
        <button class="action" data-chat="${e.chatId}" data-id="${e.profile?.doomsageId || e.friendUid}" data-fuid="${e.friendUid}">Chat</button>
      </div>
    `).join('');

    friendsEl.querySelectorAll('button').forEach((btn) => {
      btn.onclick = () => {
        el.dataset.selectedChat = btn.dataset.chat;
        el.dataset.selectedFriendUid = btn.dataset.fuid;
        el.querySelector('#chatWith').textContent = btn.dataset.id;
        rerenderAll();
      };
    });
  });

  unsub.push(un);
}

function setupActions(el, user, getSelectedFriend, setSelectedFriend, unsub) {
  const sendReq = el.querySelector('#sendFriendReq');
  const reqMsg = el.querySelector('#reqMsg');
  const chatArea = el.querySelector('#chatMessages');
  const sendChat = el.querySelector('#sendChat');

  sendReq.onclick = async () => {
    const friendId = el.querySelector('#friendIdInput').value.trim();
    if (!friendId) return;

    const q = await messengerRuntime.db.collection('users').where('doomsageId', '==', friendId).limit(1).get();
    if (q.empty) {
      reqMsg.textContent = 'User ID not found.';
      return;
    }

    const target = q.docs[0].data();
    if (target.uid === user.uid) {
      reqMsg.textContent = 'Cannot add yourself.';
      return;
    }

    await messengerRuntime.db.collection('friend_requests').add({
      fromUid: user.uid,
      toUid: target.uid,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    reqMsg.textContent = 'Friend request sent.';
  };

  const selectedChat = el.dataset.selectedChat;
  const selectedFriendUid = el.dataset.selectedFriendUid;
  setSelectedFriend(selectedFriendUid || null);

  if (!selectedChat || !selectedFriendUid) {
    chatArea.innerHTML = '';
    sendChat.onclick = null;
    return;
  }

  const messageQuery = messengerRuntime.db.collection('chats').doc(selectedChat).collection('messages').orderBy('createdAt', 'asc').limit(200);
  const un = messageQuery.onSnapshot((snap) => {
    chatArea.innerHTML = snap.docs.map((d) => {
      const m = d.data();
      const mine = m.fromUid === user.uid;
      return `<div style="margin:.3rem 0; text-align:${mine ? 'right' : 'left'}"><span style="display:inline-block;padding:.3rem .5rem;border-radius:8px;background:${mine ? 'rgba(124,92,255,.3)' : 'rgba(255,255,255,.14)'}">${escapeHtml(m.text || '')}</span></div>`;
    }).join('');
    chatArea.scrollTop = chatArea.scrollHeight;
  });
  unsub.push(un);

  sendChat.onclick = async () => {
    const input = el.querySelector('#chatInput');
    const text = input.value.trim();
    if (!text) return;
    await messengerRuntime.db.collection('chats').doc(selectedChat).collection('messages').add({
      fromUid: user.uid,
      toUid: getSelectedFriend(),
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    input.value = '';
  };
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function updateClock() {
  const d = new Date();
  liveClock.textContent = d.toLocaleTimeString();
  liveDate.textContent = d.toLocaleDateString();
}

function updateNetwork() {
  netStatus.textContent = navigator.onLine ? '🟢 Online' : '🔴 Offline';
}

setInterval(updateClock, 1000);
updateClock();
updateNetwork();
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
