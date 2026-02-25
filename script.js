const bootScreen = document.getElementById('bootScreen');
const os = document.getElementById('os');
const desktop = document.getElementById('desktop');
const dock = document.getElementById('dock');
const template = document.getElementById('windowTemplate');

let zIndex = 10;
const appState = {
  notes: localStorage.getItem('ds_notes') || 'Welcome to doomsageOSGod!\nBuild. Create. Dominate.',
  todos: JSON.parse(localStorage.getItem('ds_todos') || '[]'),
  accent: localStorage.getItem('ds_accent') || '#7c5cff',
};

setTimeout(() => {
  bootScreen.classList.add('hidden');
  os.classList.remove('hidden');
}, 1600);

const apps = [
  { name: 'Terminal', icon: '⌨️', render: terminalApp },
  { name: 'Notes', icon: '📝', render: notesApp },
  { name: 'Calculator', icon: '🧮', render: calculatorApp },
  { name: 'Todo', icon: '✅', render: todoApp },
  { name: 'Files', icon: '📁', render: filesApp },
  { name: 'Settings', icon: '⚙️', render: settingsApp },
  { name: 'Music', icon: '🎵', render: musicApp },
  { name: 'Dashboard', icon: '📊', render: dashboardApp }
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
  minimize.onclick = () => (node.style.display = 'none');
  maximize.onclick = () => node.classList.toggle('maximized');
  close.onclick = () => node.remove();

  makeDraggable(node, node.querySelector('.window-header'));
  desktop.appendChild(node);
}

function makeDraggable(win, handle) {
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
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

function terminalApp(el) {
  el.innerHTML = `
    <div class="terminal" id="terminalOutput"></div>
    <input id="terminalInput" placeholder="Type command (help, date, whoami, clear)" />
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

  write('doomsageOSGod shell v1.0');
  write('Type "help" for commands.');

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim().toLowerCase();
    write(`> ${cmd}`);

    if (cmd === 'help') write('Available: help, date, whoami, apps, clear');
    else if (cmd === 'date') write(new Date().toString());
    else if (cmd === 'whoami') write('kunal-dewangan@doomsageOSGod');
    else if (cmd === 'apps') write(apps.map(a => a.name).join(', '));
    else if (cmd === 'clear') out.innerHTML = '';
    else write('Unknown command.');

    input.value = '';
  });
}

function notesApp(el) {
  el.innerHTML = `
    <h3>Smart Notes</h3>
    <textarea id="notesArea" rows="13">${appState.notes}</textarea>
    <button class="action" id="saveNotes">Save Notes</button>
  `;
  el.querySelector('#saveNotes').onclick = () => {
    appState.notes = el.querySelector('#notesArea').value;
    localStorage.setItem('ds_notes', appState.notes);
    alert('Notes saved!');
  };
}

function calculatorApp(el) {
  el.innerHTML = `
    <h3>Quick Calculator</h3>
    <input id="calcExpr" placeholder="Example: (12+3)*2/5" />
    <button class="action" id="calcBtn">Calculate</button>
    <p id="calcRes">Result: -</p>
  `;
  el.querySelector('#calcBtn').onclick = () => {
    const expr = el.querySelector('#calcExpr').value;
    try {
      const val = Function(`"use strict"; return (${expr})`)();
      el.querySelector('#calcRes').textContent = `Result: ${val}`;
    } catch {
      el.querySelector('#calcRes').textContent = 'Result: Invalid expression';
    }
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
    list.innerHTML = appState.todos.map((t, i) => `
      <div class="todo-item">
        <span>${t}</span>
        <button data-i="${i}" class="action" style="padding:0.2rem 0.6rem">Done</button>
      </div>
    `).join('');

    list.querySelectorAll('button').forEach(btn => {
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

function filesApp(el) {
  const fakeFiles = [
    'README-doomsage.txt',
    'vision-board.png',
    'projects/ai-assistant.md',
    'music/synthwave.mp3',
    'secret-plan.encrypted'
  ];
  el.innerHTML = `
    <h3>File Explorer</h3>
    <ul class="file-list">${fakeFiles.map(f => `<li>📄 ${f}</li>`).join('')}</ul>
  `;
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

function musicApp(el) {
  el.innerHTML = `
    <h3>Lo-fi Generator</h3>
    <p>Generate ambient vibes with visual pulse.</p>
    <button class="action" id="pulseBtn">Start Pulse</button>
    <div id="pulse" class="panel" style="height:80px; margin-top:1rem; transition:transform 0.2s"></div>
  `;
  const pulse = el.querySelector('#pulse');
  let timer = null;
  el.querySelector('#pulseBtn').onclick = (e) => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      e.target.textContent = 'Start Pulse';
      pulse.style.transform = 'scaleX(1)';
      return;
    }
    e.target.textContent = 'Stop Pulse';
    timer = setInterval(() => {
      pulse.style.transform = `scaleX(${(Math.random() * 1.2 + 0.5).toFixed(2)})`;
      pulse.style.background = `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;
    }, 220);
  };
}

function dashboardApp(el) {
  const now = new Date();
  el.innerHTML = `
    <h3>Power Dashboard</h3>
    <div class="grid-2">
      <div class="panel"><strong>CPU (sim)</strong><p>${(Math.random() * 70 + 20).toFixed(1)}%</p></div>
      <div class="panel"><strong>RAM (sim)</strong><p>${(Math.random() * 60 + 25).toFixed(1)}%</p></div>
      <div class="panel"><strong>Uptime</strong><p>${Math.floor(performance.now() / 1000)} sec</p></div>
      <div class="panel"><strong>Today</strong><p>${now.toDateString()}</p></div>
    </div>
  `;
}

setInterval(() => {
  const d = new Date();
  liveClock.textContent = d.toLocaleTimeString();
  liveDate.textContent = d.toLocaleDateString();
}, 1000);

document.documentElement.style.setProperty('--accent', appState.accent);
