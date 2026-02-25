const bootScreen = document.getElementById('bootScreen');
const os = document.getElementById('os');
const desktop = document.getElementById('desktop');
const dock = document.getElementById('dock');
const template = document.getElementById('windowTemplate');
const liveClock = document.getElementById('liveClock');
const liveDate = document.getElementById('liveDate');
const netStatus = document.getElementById('netStatus');

let zIndex = 10;

const appState = {
  notes: localStorage.getItem('ds_notes') || 'Welcome to doomsageOSGod!\nThis is your super futuristic command center.',
  todos: JSON.parse(localStorage.getItem('ds_todos') || '[]'),
  accent: localStorage.getItem('ds_accent') || '#7c5cff',
};

setTimeout(() => {
  bootScreen.classList.add('hidden');
  os.classList.remove('hidden');
}, 1600);

document.documentElement.style.setProperty('--accent', appState.accent);

const apps = [
  { name: 'Terminal', icon: '⌨️', render: terminalApp },
  { name: 'Notes', icon: '📝', render: notesApp },
  { name: 'Todo', icon: '✅', render: todoApp },
  { name: 'Calculator', icon: '🧮', render: calculatorApp },
  { name: 'Whiteboard', icon: '🎨', render: whiteboardApp },
  { name: 'Camera', icon: '📷', render: cameraApp },
  { name: 'Browser', icon: '🌐', render: browserApp },
  { name: 'Weather', icon: '⛅', render: weatherApp },
  { name: 'Clock+Timer', icon: '⏱️', render: timerApp },
  { name: 'Files', icon: '📁', render: filesApp },
  { name: 'System', icon: '🖥️', render: systemApp },
  { name: 'Music Lab', icon: '🎛️', render: musicApp },
  { name: 'Settings', icon: '⚙️', render: settingsApp },
  { name: 'Doomsage', icon: '🚀', render: doomsageApp },
];

apps.forEach((app) => {
  const btn = document.createElement('button');
  btn.className = 'app-btn';
  btn.innerHTML = `<strong>${app.icon}</strong><div>${app.name}</div>`;
  btn.addEventListener('click', () => openApp(app));
  dock.appendChild(btn);
});

function openApp(app) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.style.left = `${Math.random() * 24 + 8}%`;
  node.style.top = `${Math.random() * 18 + 8}%`;
  node.style.zIndex = ++zIndex;

  const title = node.querySelector('.window-title');
  const content = node.querySelector('.window-content');
  title.textContent = `${app.icon} ${app.name}`;
  app.render(content);

  node.addEventListener('mousedown', () => {
    node.style.zIndex = ++zIndex;
  });

  const [minimize, maximize, close] = node.querySelectorAll('.window-controls button');
  minimize.onclick = () => {
    node.dataset.minimized = 'true';
    node.style.display = 'none';
  };
  maximize.onclick = () => node.classList.toggle('maximized');
  close.onclick = () => node.remove();

  makeDraggable(node, node.querySelector('.window-header'));
  makeResizable(node, node.querySelector('.resize-handle'));
  desktop.appendChild(node);
}

function makeDraggable(win, handle) {
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener('mousedown', (e) => {
    if (win.classList.contains('maximized')) return;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = win.offsetLeft;
    startTop = win.offsetTop;

    const onMove = (evt) => {
      win.style.left = `${Math.max(0, startLeft + evt.clientX - startX)}px`;
      win.style.top = `${Math.max(0, startTop + evt.clientY - startY)}px`;
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

function makeResizable(win, handle) {
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.offsetWidth;
    const startH = win.offsetHeight;

    const onMove = (evt) => {
      win.style.width = `${Math.max(320, startW + (evt.clientX - startX))}px`;
      win.style.height = `${Math.max(240, startH + (evt.clientY - startY))}px`;
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  });
}

function terminalApp(el) {
  el.innerHTML = `
    <div class="terminal" id="terminalOutput"></div>
    <input id="terminalInput" placeholder="Type command (help, date, open doomsage, clear...)" />
  `;

  const out = el.querySelector('#terminalOutput');
  const input = el.querySelector('#terminalInput');

  const write = (line) => {
    const div = document.createElement('div');
    div.className = 'line';
    div.textContent = line;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  };

  const commands = {
    help: () => write('Commands: help, date, whoami, apps, clear, open doomsage, online'),
    date: () => write(new Date().toString()),
    whoami: () => write('kunal-dewangan@doomsageOSGod'),
    apps: () => write(apps.map((a) => a.name).join(', ')),
    online: () => write(navigator.onLine ? 'Internet reachable.' : 'Offline right now.'),
    clear: () => {
      out.innerHTML = '';
    },
    'open doomsage': () => {
      window.open('https://doomsage.in', '_blank', 'noopener');
      write('Opening https://doomsage.in');
    },
  };

  write('doomsageOSGod shell v2.0');
  write('Type "help" for commands.');

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    write(`> ${cmd}`);
    if (commands[cmd]) {
      commands[cmd]();
    } else {
      write('Unknown command.');
    }
    input.value = '';
  });
}

function notesApp(el) {
  el.innerHTML = `
    <h3>Smart Notes</h3>
    <textarea id="notesArea" rows="14"></textarea>
    <button class="action" id="saveNotes">Save Notes</button>
  `;

  const notesArea = el.querySelector('#notesArea');
  notesArea.value = appState.notes;
  el.querySelector('#saveNotes').onclick = () => {
    appState.notes = notesArea.value;
    localStorage.setItem('ds_notes', appState.notes);
  };
}

function todoApp(el) {
  el.innerHTML = `
    <h3>Mission Todo</h3>
    <input id="todoInput" placeholder="Add task" />
    <button class="action" id="todoAdd">Add</button>
    <div id="todoList"></div>
  `;

  const list = el.querySelector('#todoList');
  const render = () => {
    list.innerHTML = appState.todos
      .map(
        (t, i) => `
      <div class="todo-item">
        <span>${t}</span>
        <button data-i="${i}" class="action" style="padding:0.2rem 0.6rem">Done</button>
      </div>
    `,
      )
      .join('');

    list.querySelectorAll('button').forEach((btn) => {
      btn.onclick = () => {
        appState.todos.splice(Number(btn.dataset.i), 1);
        localStorage.setItem('ds_todos', JSON.stringify(appState.todos));
        render();
      };
    });
  };

  el.querySelector('#todoAdd').onclick = () => {
    const field = el.querySelector('#todoInput');
    if (!field.value.trim()) return;
    appState.todos.push(field.value.trim());
    localStorage.setItem('ds_todos', JSON.stringify(appState.todos));
    field.value = '';
    render();
  };

  render();
}

function calculatorApp(el) {
  el.innerHTML = `
    <h3>Calculator</h3>
    <input id="calcExpr" placeholder="Example: (45 + 5) / 2" />
    <button class="action" id="calcBtn">Calculate</button>
    <p id="calcRes">Result: -</p>
  `;

  el.querySelector('#calcBtn').onclick = () => {
    const expr = el.querySelector('#calcExpr').value;
    const val = safeEval(expr);
    el.querySelector('#calcRes').textContent = Number.isFinite(val)
      ? `Result: ${val}`
      : 'Result: Invalid expression';
  };
}

function safeEval(expr) {
  if (!/^[\d\s+\-*/().%]+$/.test(expr)) return NaN;
  return Function(`"use strict"; return (${expr})`)();
}

function whiteboardApp(el) {
  el.innerHTML = `
    <h3>Whiteboard</h3>
    <div class="panel">
      <input type="color" id="wbColor" value="#7c5cff" />
      <button class="action" id="wbClear">Clear</button>
      <canvas id="wb" width="900" height="420"></canvas>
    </div>
  `;

  const canvas = el.querySelector('#wb');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  let drawing = false;

  const pos = (ev) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - r.left) / r.width) * canvas.width,
      y: ((ev.clientY - r.top) / r.height) * canvas.height,
    };
  };

  canvas.addEventListener('pointerdown', (ev) => {
    drawing = true;
    const p = pos(ev);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener('pointermove', (ev) => {
    if (!drawing) return;
    const p = pos(ev);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  canvas.addEventListener('pointerup', () => {
    drawing = false;
  });

  el.querySelector('#wbColor').addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value;
  });

  el.querySelector('#wbClear').onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

function cameraApp(el) {
  el.innerHTML = `
    <h3>Camera Studio</h3>
    <p>Uses real camera stream when permission is granted.</p>
    <button class="action" id="startCam">Start Camera</button>
    <button class="action" id="stopCam">Stop</button>
    <div class="video-wrap" style="margin-top:0.8rem">
      <video id="camVideo" autoplay playsinline></video>
    </div>
  `;

  let stream;
  const video = el.querySelector('#camVideo');

  el.querySelector('#startCam').onclick = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      el.insertAdjacentHTML('beforeend', '<p>Camera API is not supported in this browser.</p>');
      return;
    }
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
  };

  el.querySelector('#stopCam').onclick = () => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
  };
}

function browserApp(el) {
  el.innerHTML = `
    <h3>Mini Browser</h3>
    <input id="urlField" value="https://example.com" />
    <button class="action" id="openUrl">Open in New Tab</button>
    <iframe src="https://example.com" title="mini browser"></iframe>
  `;

  const frame = el.querySelector('iframe');
  const field = el.querySelector('#urlField');

  el.querySelector('#openUrl').onclick = () => {
    let url = field.value.trim();
    if (!url.startsWith('http')) url = `https://${url}`;
    frame.src = url;
    window.open(url, '_blank', 'noopener');
  };
}

function weatherApp(el) {
  el.innerHTML = `
    <h3>Live Weather</h3>
    <input id="cityField" placeholder="City name (e.g. Delhi)" value="Delhi" />
    <button class="action" id="fetchWeather">Fetch</button>
    <div id="weatherResult" class="panel" style="margin-top:0.8rem">No data yet.</div>
  `;

  const out = el.querySelector('#weatherResult');

  el.querySelector('#fetchWeather').onclick = async () => {
    const city = el.querySelector('#cityField').value.trim();
    if (!city) return;
    out.textContent = 'Loading...';

    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];
    if (!place) {
      out.textContent = 'City not found.';
      return;
    }

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    out.innerHTML = `
      <strong>${place.name}, ${place.country || ''}</strong>
      <p>Temperature: ${current.temperature_2m}°C</p>
      <p>Wind: ${current.wind_speed_10m} km/h</p>
      <p>Weather code: ${current.weather_code}</p>
    `;
  };
}

function timerApp(el) {
  el.innerHTML = `
    <h3>Clock + Stopwatch</h3>
    <div class="grid-2">
      <div class="panel"><p>Now</p><div class="kpi" id="timerNow"></div></div>
      <div class="panel"><p>Stopwatch</p><div class="kpi" id="stopWatch">00:00.0</div></div>
    </div>
    <div style="margin-top:0.8rem">
      <button class="action" id="swStart">Start</button>
      <button class="action" id="swStop">Stop</button>
      <button class="action" id="swReset">Reset</button>
    </div>
  `;

  const nowNode = el.querySelector('#timerNow');
  const watch = el.querySelector('#stopWatch');

  const nowInt = setInterval(() => {
    nowNode.textContent = new Date().toLocaleTimeString();
  }, 500);

  let start = 0;
  let spent = 0;
  let ticking;

  const draw = () => {
    const t = spent + (start ? Date.now() - start : 0);
    const secs = t / 1000;
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(Math.floor(secs % 60)).padStart(2, '0');
    watch.textContent = `${mm}:${ss}.${Math.floor((secs % 1) * 10)}`;
  };

  el.querySelector('#swStart').onclick = () => {
    if (start) return;
    start = Date.now();
    ticking = setInterval(draw, 100);
  };

  el.querySelector('#swStop').onclick = () => {
    if (!start) return;
    spent += Date.now() - start;
    start = 0;
    clearInterval(ticking);
  };

  el.querySelector('#swReset').onclick = () => {
    spent = 0;
    start = 0;
    clearInterval(ticking);
    draw();
  };

  draw();

  const cleanup = () => clearInterval(nowInt);
  el.closest('.window').querySelector('.close').addEventListener('click', cleanup, { once: true });
}

function filesApp(el) {
  el.innerHTML = `
    <h3>Local File Inspector</h3>
    <input id="filePick" type="file" multiple />
    <ul id="fileList" class="file-list"></ul>
  `;

  const list = el.querySelector('#fileList');
  el.querySelector('#filePick').addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []);
    list.innerHTML = files
      .map((file) => `<li>📄 ${file.name} — ${(file.size / 1024).toFixed(1)} KB — ${file.type || 'unknown'}</li>`)
      .join('');
  });
}

function systemApp(el) {
  el.innerHTML = `
    <h3>System Dashboard (real device/browser info)</h3>
    <div id="sysGrid" class="grid-3"></div>
    <button class="action" id="refreshSys">Refresh</button>
  `;

  const grid = el.querySelector('#sysGrid');

  const render = async () => {
    const bits = [
      ['Online', navigator.onLine ? 'Yes' : 'No'],
      ['Platform', navigator.platform || 'N/A'],
      ['Language', navigator.language || 'N/A'],
      ['CPU Cores', navigator.hardwareConcurrency || 'N/A'],
      ['Device Memory (GB)', navigator.deviceMemory || 'N/A'],
      ['Screen', `${window.screen.width}x${window.screen.height}`],
      ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
    ];

    if (navigator.connection) {
      bits.push(['Network Type', navigator.connection.effectiveType || 'N/A']);
      bits.push(['Downlink', `${navigator.connection.downlink || 'N/A'} Mbps`]);
    }

    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      bits.push(['Storage Used', `${Math.round((estimate.usage || 0) / (1024 * 1024))} MB`]);
      bits.push(['Storage Quota', `${Math.round((estimate.quota || 0) / (1024 * 1024))} MB`]);
    }

    if (navigator.getBattery) {
      const battery = await navigator.getBattery();
      bits.push(['Battery', `${Math.round(battery.level * 100)}%${battery.charging ? ' (charging)' : ''}`]);
    }

    grid.innerHTML = bits
      .map(([k, v]) => `<div class="panel"><p>${k}</p><div class="kpi" style="font-size:1.05rem">${v}</div></div>`)
      .join('');
  };

  el.querySelector('#refreshSys').onclick = render;
  render();
}

function musicApp(el) {
  el.innerHTML = `
    <h3>Music Lab</h3>
    <p>Create synthesized tones in browser.</p>
    <label>Frequency (Hz)<input type="range" id="freq" min="120" max="980" value="440" /></label>
    <button class="action" id="startTone">Start Tone</button>
    <button class="action" id="stopTone">Stop Tone</button>
    <div class="panel" id="musicInfo" style="margin-top:0.8rem">440Hz</div>
  `;

  let ctx;
  let osc;
  const freq = el.querySelector('#freq');
  const info = el.querySelector('#musicInfo');

  freq.oninput = () => {
    info.textContent = `${freq.value}Hz`;
    if (osc) osc.frequency.value = Number(freq.value);
  };

  el.querySelector('#startTone').onclick = () => {
    if (osc) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    osc.type = 'sawtooth';
    osc.frequency.value = Number(freq.value);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  };

  el.querySelector('#stopTone').onclick = () => {
    if (!osc) return;
    osc.stop();
    osc.disconnect();
    osc = null;
  };
}

function settingsApp(el) {
  el.innerHTML = `
    <h3>System Settings</h3>
    <label>Accent color
      <input type="color" id="accentPicker" value="${appState.accent}" />
    </label>
    <button class="action" id="applyTheme">Apply Theme</button>
  `;

  el.querySelector('#applyTheme').onclick = () => {
    const color = el.querySelector('#accentPicker').value;
    appState.accent = color;
    localStorage.setItem('ds_accent', color);
    document.documentElement.style.setProperty('--accent', color);
  };
}

function doomsageApp(el) {
  el.innerHTML = `
    <h3>Doomsage Launcher</h3>
    <p>Directly open the official website.</p>
    <button class="action" id="goDoomsage">Open doomsage.in</button>
    <p id="doomStatus">Ready.</p>
  `;

  el.querySelector('#goDoomsage').onclick = () => {
    window.open('https://doomsage.in', '_blank', 'noopener');
    el.querySelector('#doomStatus').textContent = 'Opened https://doomsage.in in a new tab.';
  };
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
