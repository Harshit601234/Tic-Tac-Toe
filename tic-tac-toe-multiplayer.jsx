import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ─── CONFIG ────────────────────────────────────────────────────────────────
// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

let supabase = null;
function getSupabase(url, key) {
  if (!supabase) supabase = createClient(url, key);
  return supabase;
}

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line: [a,b,c] };
  }
  if (board.every(Boolean)) return { winner: "draw", line: [] };
  return null;
}

function generateId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateName() {
  const adj = ["Swift","Bold","Neon","Void","Iron","Dark","Star","Grim","Wild","Icy"];
  const noun = ["Fox","Hawk","Wolf","Bear","Ace","Rex","Duke","Claw","Fang","Blaze"];
  return `${adj[Math.floor(Math.random()*10)]}${noun[Math.floor(Math.random()*10)]}`;
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface2: #1a1a28;
    --border: #2a2a40;
    --accent: #00ff88;
    --accent2: #ff3366;
    --text: #e8e8f0;
    --muted: #6b6b8a;
    --x-color: #ff3366;
    --o-color: #00ccff;
    --win-glow: #00ff88;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'Space Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    background-image: 
      radial-gradient(ellipse at 20% 20%, rgba(0,255,136,0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(255,51,102,0.04) 0%, transparent 50%);
  }

  /* ── SETUP SCREEN ── */
  .setup-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .setup-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 3rem;
    width: 100%;
    max-width: 480px;
    position: relative;
    overflow: hidden;
  }

  .setup-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
  }

  .logo {
    font-family: var(--font-display);
    font-size: 4rem;
    letter-spacing: 0.05em;
    line-height: 1;
    margin-bottom: 0.25rem;
    background: linear-gradient(135deg, var(--accent) 0%, #00ccff 50%, var(--accent2) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-sub {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }

  .field-label {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .field-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  input.field {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  input.field:focus { border-color: var(--accent); }

  .btn {
    font-family: var(--font-body);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    border-radius: 2px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--accent);
    color: #000;
    font-weight: 700;
  }
  .btn-primary:hover { background: #00e07a; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  .btn-danger {
    background: transparent;
    color: var(--accent2);
    border: 1px solid var(--accent2);
  }
  .btn-danger:hover { background: rgba(255,51,102,0.1); }

  .btn-sm {
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--muted);
    font-size: 1rem;
    padding: 0.25rem;
    transition: color 0.15s;
    line-height: 1;
  }
  .btn-icon:hover { color: var(--accent2); }

  .divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
    color: var(--muted);
    font-size: 0.7rem;
    letter-spacing: 0.15em;
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .error-msg {
    background: rgba(255,51,102,0.1);
    border: 1px solid rgba(255,51,102,0.3);
    border-radius: 2px;
    color: var(--accent2);
    font-size: 0.75rem;
    padding: 0.6rem 0.8rem;
    margin-top: -1rem;
    margin-bottom: 1rem;
  }

  /* ── LOBBY ── */
  .lobby {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 860px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .lobby-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .lobby-title {
    font-family: var(--font-display);
    font-size: 2.5rem;
    letter-spacing: 0.05em;
    color: var(--accent);
  }

  .player-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.5rem 1rem;
  }

  .player-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .create-room-bar {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  /* ── TABS ── */
  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .tab {
    font-family: var(--font-body);
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--muted);
    cursor: pointer;
    padding: 0.75rem 1.25rem;
    margin-bottom: -1px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tab:hover { color: var(--text); }

  .tab.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
  }

  .tab-badge {
    background: var(--surface2);
    border-radius: 10px;
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    min-width: 1.2rem;
    text-align: center;
  }

  .tab.active .tab-badge {
    background: rgba(0,255,136,0.15);
    color: var(--accent);
  }

  /* ── ROOM LIST ── */
  .rooms-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .room-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
    overflow: hidden;
  }

  .room-card:hover { border-color: rgba(0,255,136,0.3); }

  .room-card.ready::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--accent);
  }

  .room-card.inactive::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--muted);
  }

  .room-id {
    font-family: var(--font-display);
    font-size: 1.5rem;
    letter-spacing: 0.1em;
    color: var(--accent);
    min-width: 4rem;
  }

  .room-name {
    font-size: 0.85rem;
    font-weight: 700;
    flex: 1;
  }

  .room-meta {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.05em;
    margin-top: 0.2rem;
  }

  .room-status {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 0.25rem 0.6rem;
    border-radius: 2px;
    border: 1px solid;
  }

  .status-ready {
    color: var(--accent);
    border-color: rgba(0,255,136,0.4);
    background: rgba(0,255,136,0.05);
  }

  .status-inactive {
    color: var(--muted);
    border-color: var(--border);
  }

  .status-playing {
    color: var(--o-color);
    border-color: rgba(0,204,255,0.4);
    background: rgba(0,204,255,0.05);
  }

  .room-actions { display: flex; gap: 0.5rem; align-items: center; }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--muted);
    font-size: 0.8rem;
    letter-spacing: 0.1em;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  /* ── GAME ROOM ── */
  .game-room {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
  }

  .game-header {
    width: 100%;
    max-width: 520px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .room-code {
    font-family: var(--font-display);
    font-size: 1.8rem;
    letter-spacing: 0.1em;
    color: var(--muted);
  }

  .room-code span { color: var(--accent); }

  .players-display {
    width: 100%;
    max-width: 520px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 1rem 1.25rem;
  }

  .player-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-width: 100px;
  }

  .player-symbol {
    font-family: var(--font-display);
    font-size: 2.5rem;
    line-height: 1;
  }

  .x-symbol { color: var(--x-color); }
  .o-symbol { color: var(--o-color); }

  .player-name {
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    color: var(--text);
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player-name.you { color: var(--accent); }
  .player-name.waiting { color: var(--muted); font-style: italic; }

  .vs-divider {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--border);
    letter-spacing: 0.1em;
  }

  /* ── BOARD ── */
  .board-wrapper {
    position: relative;
    margin-bottom: 1.5rem;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: var(--border);
    padding: 6px;
    border-radius: 4px;
    width: min(80vw, 360px);
    height: min(80vw, 360px);
  }

  .cell {
    background: var(--surface);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: clamp(3rem, 12vw, 5rem);
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    position: relative;
    overflow: hidden;
    user-select: none;
  }

  .cell:hover:not(.filled) { background: var(--surface2); }
  .cell.filled { cursor: default; }
  .cell.win-cell { background: rgba(0,255,136,0.08); }

  .cell-x {
    color: var(--x-color);
    text-shadow: 0 0 20px rgba(255,51,102,0.5);
  }

  .cell-o {
    color: var(--o-color);
    text-shadow: 0 0 20px rgba(0,204,255,0.5);
  }

  @keyframes pop {
    0% { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  .cell-value { animation: pop 0.2s ease-out forwards; display: block; }

  /* ── STATUS BAR ── */
  .status-bar {
    width: 100%;
    max-width: 520px;
    text-align: center;
    padding: 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    margin-bottom: 1rem;
  }

  .status-text {
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .status-your-turn { color: var(--accent); }
  .status-wait { color: var(--muted); }
  .status-win { color: var(--accent); }
  .status-lose { color: var(--accent2); }
  .status-draw { color: var(--o-color); }
  .status-waiting-player { color: var(--muted); }

  .game-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ── WAITING ── */
  .waiting-room {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .waiting-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: spin 3s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .waiting-title {
    font-family: var(--font-display);
    font-size: 2.5rem;
    letter-spacing: 0.05em;
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .room-code-display {
    font-family: var(--font-display);
    font-size: 4rem;
    letter-spacing: 0.3em;
    background: linear-gradient(135deg, var(--accent), var(--o-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 1rem 0;
  }

  .copy-hint {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    cursor: pointer;
    transition: color 0.2s;
  }
  .copy-hint:hover { color: var(--accent); }

  /* ── TOASTS ── */
  .toast-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 999;
  }

  .toast {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.6rem 1rem;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    animation: slideIn 0.3s ease-out;
    max-width: 280px;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* ── CONFIG ── */
  .config-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .config-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 2.5rem;
    width: 100%;
    max-width: 540px;
    position: relative;
  }

  .config-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent2), var(--accent));
  }

  .config-title {
    font-family: var(--font-display);
    font-size: 2rem;
    letter-spacing: 0.05em;
    color: var(--accent);
    margin-bottom: 0.25rem;
  }

  .config-sub {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
  }

  .config-field { margin-bottom: 1.25rem; }

  .sql-block {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 1rem;
    font-size: 0.72rem;
    line-height: 1.6;
    color: #a8ff78;
    white-space: pre;
    overflow-x: auto;
    font-family: var(--font-body);
  }

  .step {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: flex-start;
  }

  .step-num {
    font-family: var(--font-display);
    font-size: 1.5rem;
    color: var(--accent);
    line-height: 1;
    min-width: 1.5rem;
  }

  .step-text {
    font-size: 0.78rem;
    color: var(--text);
    line-height: 1.5;
    letter-spacing: 0.02em;
  }

  .step-text strong { color: var(--accent); }

  .scrollable { max-height: 80vh; overflow-y: auto; padding-right: 0.5rem; }

  hr.divider-full {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1.5rem 0;
  }
`;

// ─── TOAST ────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return { toasts, add };
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  );
}

// ─── CONFIG SCREEN ─────────────────────────────────────────────────────────
function ConfigScreen({ onSave }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  return (
    <div className="config-screen">
      <div className="config-card">
        <div className="config-title">SUPABASE SETUP</div>
        <div className="config-sub">FOLLOW THESE STEPS TO CONFIGURE YOUR PROJECT</div>

        <div className="scrollable">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-text">
              Go to <strong>supabase.com</strong> → New Project. Copy your <strong>Project URL</strong> and <strong>anon public key</strong> from <strong>Settings → API</strong>.
            </div>
          </div>

          <div className="step">
            <div className="step-num">2</div>
            <div className="step-text">
              In the <strong>SQL Editor</strong>, run this SQL to create the rooms table:
            </div>
          </div>

          <div className="sql-block">{`create table public.rooms (
  id text primary key,
  name text not null,
  host_id text not null,
  host_name text not null,
  guest_id text,
  guest_name text,
  board text[] default array_fill(null::text, array[9]),
  current_turn text default 'X',
  winner text,
  status text default 'inactive',
  created_at timestamptz default now()
);`}</div>

          <div className="step" style={{marginTop:"1rem"}}>
            <div className="step-num">3</div>
            <div className="step-text">
              Enable <strong>Row Level Security</strong> but add a policy to allow all operations (for demo):
            </div>
          </div>

          <div className="sql-block">{`alter table public.rooms enable row level security;

create policy "Allow all" on public.rooms
  for all using (true) with check (true);`}</div>

          <div className="step" style={{marginTop:"1rem"}}>
            <div className="step-num">4</div>
            <div className="step-text">
              Enable <strong>Realtime</strong> on the table: go to <strong>Database → Replication</strong>, toggle <strong>rooms</strong> table ON under "Source". Also set <strong>REPLICA IDENTITY</strong>:
            </div>
          </div>

          <div className="sql-block">{`alter table public.rooms replica identity full;`}</div>

          <div className="step" style={{marginTop:"1rem"}}>
            <div className="step-num">5</div>
            <div className="step-text">
              Paste your credentials below and click <strong>CONNECT</strong>.
            </div>
          </div>

          <div className="config-field">
            <div className="field-label">Supabase Project URL</div>
            <input className="field" style={{width:"100%"}} placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/>
          </div>
          <div className="config-field">
            <div className="field-label">Anon Public Key</div>
            <input className="field" style={{width:"100%"}} placeholder="eyJhbGci..." value={key} onChange={e=>setKey(e.target.value)}/>
          </div>
          <button className="btn btn-primary" style={{width:"100%"}} disabled={!url||!key} onClick={()=>onSave(url.trim(), key.trim())}>
            CONNECT TO SUPABASE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SETUP SCREEN ──────────────────────────────────────────────────────────
function SetupScreen({ onJoin, onConfigure }) {
  const [name, setName] = useState(generateName());
  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="logo">X ✕ O</div>
        <div className="logo-sub">MULTIPLAYER · REALTIME · SUPABASE</div>

        <div className="field-label">Your Name</div>
        <div className="field-row">
          <input className="field" value={name} onChange={e=>setName(e.target.value)} maxLength={16} placeholder="Enter name…"/>
          <button className="btn btn-secondary" onClick={()=>setName(generateName())}>⟳</button>
        </div>

        <button className="btn btn-primary" style={{width:"100%"}} onClick={()=>onJoin(name.trim()||"Player")} disabled={!name.trim()}>
          ENTER LOBBY
        </button>

        <div className="divider">CONFIG</div>
        <button className="btn btn-secondary" style={{width:"100%", fontSize:"0.7rem"}} onClick={onConfigure}>
          ⚙ SUPABASE SETTINGS & SETUP GUIDE
        </button>
      </div>
    </div>
  );
}

// ─── LOBBY ────────────────────────────────────────────────────────────────
function Lobby({ db, player, onJoinRoom, toast }) {
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState("all");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let sub;
    async function init() {
      const { data } = await db.from("rooms").select("*").order("created_at", { ascending: false });
      setRooms(data || []);

      sub = db.channel("rooms-lobby")
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, payload => {
          setRooms(prev => {
            if (payload.eventType === "INSERT") return [payload.new, ...prev];
            if (payload.eventType === "DELETE") return prev.filter(r => r.id !== payload.old.id);
            if (payload.eventType === "UPDATE") return prev.map(r => r.id === payload.new.id ? payload.new : r);
            return prev;
          });
        })
        .subscribe();
    }
    init();
    return () => { sub && db.removeChannel(sub); };
  }, [db]);

  async function createRoom() {
    setCreating(true);
    const id = generateId();
    const room = {
      id, name: newName.trim() || `${player.name}'s Room`,
      host_id: player.id, host_name: player.name,
      guest_id: null, guest_name: null,
      board: Array(9).fill(null),
      current_turn: "X", winner: null, status: "inactive"
    };
    const { error } = await db.from("rooms").insert(room);
    if (error) { toast.add("❌ Failed to create room"); setCreating(false); return; }
    setNewName("");
    setCreating(false);
    onJoinRoom(id, "host");
  }

  async function joinRoom(room) {
    if (room.guest_id) { toast.add("Room is full"); return; }
    const { error } = await db.from("rooms").update({
      guest_id: player.id, guest_name: player.name, status: "playing"
    }).eq("id", room.id);
    if (error) { toast.add("❌ Failed to join"); return; }
    onJoinRoom(room.id, "guest");
  }

  async function deleteRoom(room) {
    await db.from("rooms").delete().eq("id", room.id);
    toast.add("🗑 Room deleted");
  }

  const filtered = {
    all: rooms,
    ready: rooms.filter(r => r.status === "inactive" && !r.guest_id),
    inactive: rooms.filter(r => !r.host_id || r.status === "inactive" && r.guest_id === null && r.host_id !== player.id),
  };

  // re-define: "ready" = host is waiting (no guest), "inactive" = in-game or finished
  const readyRooms = rooms.filter(r => !r.guest_id);
  const inactiveRooms = rooms.filter(r => r.winner || r.status === "inactive" && r.guest_id);

  const displayRooms = tab === "all" ? rooms : tab === "ready" ? readyRooms : inactiveRooms;

  function statusLabel(r) {
    if (r.winner) return <span className="room-status status-inactive">FINISHED</span>;
    if (!r.guest_id) return <span className="room-status status-ready">WAITING</span>;
    return <span className="room-status status-playing">IN GAME</span>;
  }

  return (
    <div className="lobby">
      <div className="lobby-header">
        <div className="lobby-title">LOBBY</div>
        <div className="player-badge">
          <div className="player-dot"/>
          <span style={{fontSize:"0.8rem"}}>{player.name}</span>
        </div>
      </div>

      <div className="create-room-bar">
        <input className="field" style={{flex:1}} placeholder="Room name (optional)…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createRoom()}/>
        <button className="btn btn-primary" onClick={createRoom} disabled={creating}>
          {creating ? "…" : "+ CREATE ROOM"}
        </button>
      </div>

      <div className="tabs">
        {[
          { key:"all", label:"All Rooms", count: rooms.length },
          { key:"ready", label:"Ready to Play", count: readyRooms.length },
          { key:"inactive", label:"Inactive", count: inactiveRooms.length },
        ].map(t => (
          <button key={t.key} className={`tab ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
            {t.label} <span className="tab-badge">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="rooms-list">
        {displayRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◻</div>
            <div>NO ROOMS HERE</div>
            <div style={{marginTop:"0.5rem", opacity:0.5}}>Create one to get started</div>
          </div>
        ) : displayRooms.map(room => (
          <div key={room.id} className={`room-card ${!room.guest_id && !room.winner ? "ready" : "inactive"}`}>
            <div className="room-id">{room.id}</div>
            <div style={{flex:1}}>
              <div className="room-name">{room.name}</div>
              <div className="room-meta">
                Host: {room.host_name} {room.guest_name ? `· vs ${room.guest_name}` : "· waiting for opponent"}
              </div>
            </div>
            {statusLabel(room)}
            <div className="room-actions">
              {room.host_id === player.id ? (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={()=>onJoinRoom(room.id,"host")}>OPEN</button>
                  <button className="btn-icon" title="Delete room" onClick={()=>deleteRoom(room)}>🗑</button>
                </>
              ) : !room.guest_id && !room.winner ? (
                <button className="btn btn-primary btn-sm" onClick={()=>joinRoom(room)}>JOIN</button>
              ) : room.guest_id === player.id ? (
                <button className="btn btn-secondary btn-sm" onClick={()=>onJoinRoom(room.id,"guest")}>REJOIN</button>
              ) : (
                <span style={{fontSize:"0.7rem",color:"var(--muted)"}}>FULL</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GAME ROOM ─────────────────────────────────────────────────────────────
function GameRoom({ db, roomId, player, role, onLeave, toast }) {
  const [room, setRoom] = useState(null);
  const subRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { data } = await db.from("rooms").select("*").eq("id", roomId).single();
      setRoom(data);

      subRef.current = db.channel(`room-${roomId}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
          payload => setRoom(payload.new))
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
          () => { toast.add("Room was deleted"); onLeave(); })
        .subscribe();
    }
    init();
    return () => { subRef.current && db.removeChannel(subRef.current); };
  }, [db, roomId]);

  async function makeMove(idx) {
    if (!room) return;
    const mySymbol = role === "host" ? "X" : "O";
    if (room.current_turn !== mySymbol) return;
    if (room.board[idx]) return;
    if (room.winner) return;
    if (!room.guest_id) return; // need both players

    const newBoard = [...room.board];
    newBoard[idx] = mySymbol;
    const result = checkWinner(newBoard);
    const updates = {
      board: newBoard,
      current_turn: mySymbol === "X" ? "O" : "X",
      winner: result ? result.winner : null,
    };
    await db.from("rooms").update(updates).eq("id", roomId);
  }

  async function resetGame() {
    await db.from("rooms").update({
      board: Array(9).fill(null),
      current_turn: "X",
      winner: null,
    }).eq("id", roomId);
  }

  if (!room) return (
    <div className="waiting-room">
      <div className="waiting-icon">⟳</div>
      <div style={{color:"var(--muted)",fontSize:"0.8rem",letterSpacing:"0.2em"}}>LOADING ROOM…</div>
    </div>
  );

  const mySymbol = role === "host" ? "X" : "O";
  const result = room.board.every(c=>c!==null)||room.winner ? checkWinner(room.board) : null;
  const winLine = result?.line || [];
  const isMyTurn = !room.winner && room.guest_id && room.current_turn === mySymbol;

  let statusClass = "status-wait", statusMsg = "";
  if (!room.guest_id) { statusClass = "status-waiting-player"; statusMsg = "WAITING FOR OPPONENT…"; }
  else if (room.winner === "draw") { statusClass = "status-draw"; statusMsg = "IT'S A DRAW"; }
  else if (room.winner === mySymbol) { statusClass = "status-win"; statusMsg = "YOU WIN! 🏆"; }
  else if (room.winner && room.winner !== mySymbol) { statusClass = "status-lose"; statusMsg = "YOU LOSE"; }
  else if (isMyTurn) { statusClass = "status-your-turn"; statusMsg = "YOUR TURN"; }
  else { statusClass = "status-wait"; statusMsg = `${room.current_turn === "X" ? room.host_name : room.guest_name||"Opponent"}'s TURN`; }

  return (
    <div className="game-room">
      <div className="game-header" style={{maxWidth:"520px",width:"100%"}}>
        <div className="room-code">ROOM <span>{room.id}</span></div>
        <button className="btn btn-secondary btn-sm" onClick={onLeave}>← LOBBY</button>
      </div>

      {!room.guest_id && (
        <div style={{maxWidth:"520px",width:"100%",marginBottom:"1rem",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"2px",padding:"1rem 1.25rem",textAlign:"center"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",color:"var(--muted)",marginBottom:"0.5rem"}}>SHARE THIS ROOM CODE</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"3rem",letterSpacing:"0.3em",background:"linear-gradient(135deg,var(--accent),var(--o-color))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{room.id}</div>
          <div style={{fontSize:"0.65rem",color:"var(--muted)",letterSpacing:"0.15em",cursor:"pointer"}} onClick={()=>{navigator.clipboard.writeText(room.id);toast.add("📋 Copied!")}}>CLICK TO COPY</div>
        </div>
      )}

      <div className="players-display" style={{maxWidth:"520px",width:"100%"}}>
        <div className="player-slot">
          <div className="player-symbol x-symbol">X</div>
          <div className={`player-name ${role==="host"?"you":""}`}>{room.host_name} {role==="host"?"(you)":""}</div>
        </div>
        <div className="vs-divider">VS</div>
        <div className="player-slot">
          <div className="player-symbol o-symbol">O</div>
          <div className={`player-name ${room.guest_id ? (role==="guest"?"you":"") : "waiting"}`}>
            {room.guest_name || "Waiting…"} {role==="guest"?"(you)":""}
          </div>
        </div>
      </div>

      <div className="board-wrapper">
        <div className="board">
          {(room.board||Array(9).fill(null)).map((cell, i) => (
            <div
              key={i}
              className={`cell ${cell?"filled":""} ${winLine.includes(i)?"win-cell":""}`}
              onClick={()=>makeMove(i)}
            >
              {cell && <span className={`cell-value ${cell==="X"?"cell-x":"cell-o"}`}>{cell}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="status-bar" style={{maxWidth:"520px",width:"100%"}}>
        <div className={`status-text ${statusClass}`}>{statusMsg}</div>
      </div>

      <div className="game-buttons">
        {room.winner && role==="host" && (
          <button className="btn btn-primary" onClick={resetGame}>PLAY AGAIN</button>
        )}
        {role==="host" && (
          <button className="btn btn-danger" onClick={async()=>{await db.from("rooms").delete().eq("id",roomId);onLeave();}}>
            DELETE ROOM
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("config"); // config | setup | lobby | game
  const [db, setDb] = useState(null);
  const [player, setPlayer] = useState(null);
  const [gameInfo, setGameInfo] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const url = localStorage.getItem("sb_url");
    const key = localStorage.getItem("sb_key");
    if (url && key) {
      setDb(getSupabase(url, key));
      setScreen("setup");
    }
  }, []);

  function handleSaveConfig(url, key) {
    localStorage.setItem("sb_url", url);
    localStorage.setItem("sb_key", key);
    setDb(createClient(url, key));
    toast.add("✅ Connected to Supabase!");
    setScreen("setup");
  }

  function handleEnterLobby(name) {
    setPlayer({ id: generateId(), name });
    setScreen("lobby");
  }

  function handleJoinRoom(roomId, role) {
    setGameInfo({ roomId, role });
    setScreen("game");
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {screen === "config" && <ConfigScreen onSave={handleSaveConfig}/>}
        {screen === "setup" && (
          <SetupScreen
            onJoin={handleEnterLobby}
            onConfigure={()=>setScreen("config")}
          />
        )}
        {screen === "lobby" && db && player && (
          <Lobby db={db} player={player} onJoinRoom={handleJoinRoom} toast={toast}/>
        )}
        {screen === "game" && db && player && gameInfo && (
          <GameRoom
            db={db}
            roomId={gameInfo.roomId}
            player={player}
            role={gameInfo.role}
            onLeave={()=>setScreen("lobby")}
            toast={toast}
          />
        )}
        <ToastContainer toasts={toast.toasts}/>
      </div>
    </>
  );
}
