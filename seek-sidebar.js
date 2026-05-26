/* ──────────────────────────────────────────────────────────────
 * Whatfix Seek — Shared Sidebar
 *
 * Renders the dark sidebar (brand · workspace · top nav ·
 * scrollable My Tasks zone · Insights · footer) and the
 * cmd-K search modal. Used by every Phase HTML file so the
 * task list stays consistent.
 *
 * Usage in each page:
 *   <aside id="sidebar" class="sidebar shrink-0 flex flex-col"
 *          data-collapsed="false"></aside>
 *   <script src="seek-sidebar.js"></script>
 *   <script>renderSidebar({ active: "new-task" });</script>
 * ────────────────────────────────────────────────────────────── */

const SIDEBAR_DATA = {
  workspace: { name: "Acme Inc.", ent: "ENT-2841", mark: "A" },
  user:      { name: "Sandeep Sundaram", role: "Acme Inc.", initials: "SS" },

  liveTasks: [
    { id: "t1", title: "Update Salesforce opportunity stages", state: "running",      app: "Salesforce" },
    { id: "t2", title: "Triage today's Zendesk tickets",       state: "running",      app: "Zendesk"    },
    { id: "t3", title: "Reconcile Stripe payouts",             state: "paused",       app: "Stripe"     },
  ],

  recentTasks: [
    { id: "r1",  title: "Export pipeline report",             state: "completed", time: "2h ago"    },
    { id: "r2",  title: "Add 3 new users to Okta",            state: "completed", time: "Yesterday" },
    { id: "r3",  title: "Send Q3 renewal reminders",          state: "completed", time: "Yesterday" },
    { id: "r4",  title: "Update opportunity stages — Q2",     state: "completed", time: "2d ago"    },
    { id: "r5",  title: "Refund overcharged customer",        state: "failed",    time: "2d ago"    },
    { id: "r6",  title: "Onboard Maya Chen — Engineering",    state: "completed", time: "3d ago"    },
    { id: "r7",  title: "Provision Okta access · finance",    state: "completed", time: "3d ago"    },
    { id: "r8",  title: "Pull MRR breakdown from Stripe",     state: "stopped",   time: "5d ago"    },
    { id: "r9",  title: "Account health score recalc",        state: "completed", time: "1w ago"    },
    { id: "r10", title: "Triage VIP Zendesk queue",           state: "completed", time: "1w ago"    },
  ],

  recentSearches: [
    "opportunity stage salesforce",
    "zendesk triage",
    "stripe reconcile",
    "okta access",
  ],
};

/* ─── Inject CSS once ──────────────────────────────────────── */
function ensureSidebarStyles() {
  if (document.getElementById("seek-sidebar-styles")) return;
  const s = document.createElement("style");
  s.id = "seek-sidebar-styles";
  s.textContent = `
    /* Top + bottom nav groups */
    .nav-list-top    { padding: 6px 8px 4px; }
    .nav-list-bottom { padding: 4px 8px 8px; border-top: 1px solid var(--color-side-divider); }

    /* Scrollable tasks zone */
    .tasks-zone {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 4px 8px 8px;
    }
    .tasks-zone::-webkit-scrollbar { width: 6px; }
    .tasks-zone::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.08); border-radius: 999px;
    }
    .tasks-zone::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.16);
    }

    /* My tasks — collapsible parent group (matches .nav-item visual scale) */
    .tasks-group { display: flex; flex-direction: column; }
    .tasks-group-head {
      display: flex; align-items: center; gap: 12px;
      width: 100%;
      height: 40px;
      padding: 0 12px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--r-md);
      color: var(--color-side-text);
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      text-align: left;
    }
    .tasks-group-head:hover { background: var(--color-side-hover); color: #FFFFFF; }
    .tasks-group-chev {
      width: 18px; height: 18px;
      color: inherit;
      transition: transform 160ms ease-out;
      flex-shrink: 0;
    }
    .tasks-group[data-open="false"] .tasks-group-chev { transform: rotate(-90deg); }
    .tasks-group-label { flex: 1; }
    .tasks-group-body {
      display: block;
      overflow: hidden;
    }
    .tasks-group[data-open="false"] .tasks-group-body { display: none; }

    /* Sub-section labels (Live / Recent) inside My tasks */
    .tasks-section-head {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px 4px 28px;
      user-select: none;
    }
    .tasks-section-label {
      font-size: 10px; font-weight: 700;
      color: var(--color-side-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .tasks-count {
      font-size: 10px; font-weight: 700;
      color: var(--color-side-text);
      background: rgba(255,255,255,0.08);
      padding: 1px 7px;
      border-radius: 999px;
      line-height: 14px;
    }

    .tasks-list { display: flex; flex-direction: column; gap: 1px; }
    .tasks-empty {
      font-size: 12px; color: var(--color-side-muted);
      padding: 6px 12px 8px;
      font-style: italic;
    }

    .task-row {
      display: flex; align-items: center; gap: 10px;
      height: 30px;
      padding: 0 10px;
      border-radius: 6px;
      color: var(--color-side-text);
      font-size: 13px;
      font-weight: 400;
      cursor: pointer;
      user-select: none;
    }
    .task-row:hover { background: var(--color-side-hover); color: #FFFFFF; }

    .task-row-live    { padding-left: 28px; }
    .task-row-recent  { padding-left: 28px; gap: 6px; color: rgba(236, 236, 243, 0.88); font-weight: 400; }
    .task-row-recent:hover { color: #FFFFFF; }

    /* Recent-task status icon — monochrome, shape carries the meaning */
    .task-status-icon {
      width: 12px; height: 12px;
      flex-shrink: 0;
      color: rgba(236, 236, 243, 0.62);
      stroke-width: 2;
    }
    .task-row-recent:hover .task-status-icon { color: rgba(255, 255, 255, 0.90); }

    .task-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--color-side-muted);
      position: relative;
    }
    .task-row[data-state="running"] .task-dot {
      background: #4DA8F0;
    }
    .task-row[data-state="running"] .task-dot::after {
      content: "";
      position: absolute; inset: 0;
      border-radius: 50%;
      background: #4DA8F0;
      animation: side-pulse 1.8s ease-out infinite;
    }
    @keyframes side-pulse {
      0%   { opacity: 0.55; transform: scale(1); }
      100% { opacity: 0;    transform: scale(2.6); }
    }
    .task-row[data-state="paused"] .task-dot { background: #F2C046; }
    .task-row[data-state="needs-input"] .task-dot { background: var(--color-fire-400); }

    .task-title {
      flex: 1; min-width: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Kbd hint inside nav items */
    .nav-item .kbd-hint {
      margin-left: auto;
      font-size: 10px;
      color: var(--color-side-muted);
      font-weight: 500;
      letter-spacing: 0.04em;
      opacity: 0;
      transition: opacity 120ms;
    }
    .nav-item:hover .kbd-hint { opacity: 1; }

    /* Search trigger: render like a nav-item even though it's a <button> */
    .search-trigger {
      width: 100%;
      background: transparent;
      border: 1px solid transparent;
      text-align: left;
      font-family: inherit;
    }

    /* Hide tasks zone + kbd hints when collapsed; keep Insights icon */
    aside.sidebar[data-collapsed="true"] .tasks-zone,
    aside.sidebar[data-collapsed="true"] .nav-item .kbd-hint {
      display: none;
    }
    aside.sidebar[data-collapsed="true"] .nav-list-bottom {
      border-top: none;
    }
    /* In collapsed state, push Insights down so it sits above footer */
    aside.sidebar[data-collapsed="true"] .nav-list-bottom { margin-top: auto; }

    /* ─── Search modal ──────────────────────────────────────── */
    .search-modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(31, 31, 50, 0.40);
      backdrop-filter: blur(2px);
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 96px;
      z-index: 300;
      opacity: 0; pointer-events: none;
      transition: opacity 180ms ease-out;
    }
    .search-modal-backdrop.open { opacity: 1; pointer-events: auto; }

    .search-modal {
      background: var(--color-surface);
      border-radius: 8px;
      box-shadow: 0 24px 64px rgba(31,31,50,0.24), 0 4px 12px rgba(31,31,50,0.08);
      width: 640px;
      max-width: calc(100vw - 48px);
      max-height: 60vh;
      display: flex; flex-direction: column;
      overflow: hidden;
      transform: translateY(-8px);
      transition: transform 180ms ease-out;
    }
    .search-modal-backdrop.open .search-modal { transform: translateY(0); }

    .search-modal-input-wrap {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--color-divider);
    }
    .search-modal-icon { color: var(--color-ink-500); flex-shrink: 0; }
    .search-modal-input-wrap input {
      flex: 1;
      border: none; outline: none;
      font-family: inherit;
      font-size: 15px;
      color: var(--color-ink-900);
      background: transparent;
    }
    .search-modal-input-wrap input::placeholder { color: var(--color-ink-500); }
    .search-esc {
      font-size: 10px;
      color: var(--color-ink-500);
      border: 1px solid var(--color-divider);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .search-modal-body { flex: 1; overflow-y: auto; padding: 6px; }

    .search-section-label {
      font-size: 10px; font-weight: 700;
      color: var(--color-ink-500);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 8px 12px 4px;
    }
    .search-result-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: var(--color-ink-900);
    }
    .search-result-row:hover { background: var(--color-surface-2); }
    .search-result-text {
      flex: 1; min-width: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .search-result-icon          { color: var(--color-ink-500); flex-shrink: 0; }
    .search-result-icon.done     { color: #1E9B6A; }
    .search-result-icon.failed   { color: #C7372F; }
    .search-result-icon.stopped  { color: var(--color-ink-500); }
    .search-result-icon.paused   { color: #946800; }
    .search-result-icon.live     { color: #0975D7; }
    .search-result-meta {
      margin-left: auto;
      font-size: 11px;
      color: var(--color-ink-500);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }
    .search-empty {
      padding: 28px 12px;
      text-align: center;
      font-size: 13px;
      color: var(--color-ink-500);
    }
  `;
  document.head.appendChild(s);
}

function renderSidebar({ active = "" } = {}) {
  ensureSidebarStyles();
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const navItem = (id, href, icon, label, kbd) => `
    <a class="nav-item" data-id="${id}" ${active === id ? 'data-active="true"' : ''}
       href="${href}" style="text-decoration: none;">
      <i data-lucide="${icon}" class="icon"></i>
      <span class="label">${label}</span>
      ${kbd ? `<span class="kbd-hint">${kbd}</span>` : ""}
    </a>
  `;

  const liveRow = (t) => `
    <a class="task-row task-row-live" data-state="${t.state}"
       href="Seek-Desktop-Phase-1-Working.html?taskId=${t.id}&task=${encodeURIComponent(t.title)}"
       title="${t.title}" style="text-decoration: none;">
      <span class="task-dot"></span>
      <span class="task-title">${t.title}</span>
    </a>
  `;

  const recentStatusIcon = (state) => {
    if (state === "failed")  return "x";
    if (state === "stopped") return "ban";
    if (state === "paused")  return "pause";
    return "check";
  };
  const recentStatusLabel = (state) => {
    if (state === "failed")  return "Failed";
    if (state === "stopped") return "Stopped";
    if (state === "paused")  return "Paused";
    return "Completed";
  };
  const recentRow = (t) => `
    <a class="task-row task-row-recent" data-state="${t.state}"
       href="Seek-Desktop-Phase-1-Working.html?taskId=${t.id}&task=${encodeURIComponent(t.title)}&state=${t.state}"
       title="${t.title} · ${recentStatusLabel(t.state)}" style="text-decoration: none;">
      <i data-lucide="${recentStatusIcon(t.state)}" class="task-status-icon w-[12px] h-[12px]"></i>
      <span class="task-title">${t.title}</span>
    </a>
  `;

  sidebar.innerHTML = `
    <div class="brand-row">
      <div class="wf-mark">W</div>
      <span class="brand-text">Whatfix Seek</span>
    </div>

    <div class="switcher" title="Switch workspace">
      <div class="ent-mark">${SIDEBAR_DATA.workspace.mark}</div>
      <div class="switcher-text">
        <span class="name">${SIDEBAR_DATA.workspace.name}</span>
        <span class="ent">${SIDEBAR_DATA.workspace.ent}</span>
      </div>
      <i data-lucide="chevrons-up-down" class="switcher-caret w-[14px] h-[14px]"></i>
    </div>

    <nav class="nav-list-top">
      ${navItem("new-task", "Seek-Desktop-Phase-1.html", "plus-circle", "New task", "⌘N")}
      <button class="nav-item search-trigger" id="search-trigger">
        <i data-lucide="search" class="icon"></i>
        <span class="label">Search tasks</span>
        <span class="kbd-hint">⌘K</span>
      </button>
    </nav>

    <div class="tasks-zone">
      <div class="tasks-group" id="tasks-group" data-open="true">
        <button class="tasks-group-head" id="tasks-group-toggle" aria-expanded="true">
          <i data-lucide="chevron-down" class="tasks-group-chev"></i>
          <span class="tasks-group-label">My tasks</span>
          <span class="tasks-count">${SIDEBAR_DATA.liveTasks.length}</span>
        </button>
        <div class="tasks-group-body">
          <div class="tasks-section-head">
            <span class="tasks-section-label">Live</span>
          </div>
          <div class="tasks-list">
            ${SIDEBAR_DATA.liveTasks.length
              ? SIDEBAR_DATA.liveTasks.map(liveRow).join("")
              : '<div class="tasks-empty">No live tasks</div>'}
          </div>

          <div class="tasks-section-head" style="margin-top: 10px;">
            <span class="tasks-section-label">Recent</span>
          </div>
          <div class="tasks-list">
            ${SIDEBAR_DATA.recentTasks.map(recentRow).join("")}
          </div>
        </div>
      </div>
    </div>

    <nav class="nav-list-bottom">
      ${navItem("scheduled",      "Seek-Desktop-Phase-8.html", "calendar-clock", "Scheduled")}
      ${navItem("prompt-library", "Seek-Desktop-Phase-6.html", "library-big",    "Prompt library")}
      ${navItem("insights",       "Seek-Desktop-Phase-3.html", "bar-chart-3",    "Insights")}
    </nav>

    <div class="sidebar-footer">
      <div class="avatar-row" title="Account">
        <div class="avatar">${SIDEBAR_DATA.user.initials}</div>
        <div class="avatar-meta">
          <span class="name">${SIDEBAR_DATA.user.name}</span>
          <span class="role">${SIDEBAR_DATA.user.role}</span>
        </div>
        <i data-lucide="more-horizontal" class="avatar-more w-[16px] h-[16px]"
           style="color: var(--color-side-muted)"></i>
      </div>
    </div>
  `;

  wireSidebar();
  ensureSearchModal();
  if (window.lucide) lucide.createIcons();
}

function wireSidebar() {
  const sidebar = document.getElementById("sidebar");

  function setCollapsed(collapsed) {
    sidebar.dataset.collapsed = collapsed ? "true" : "false";
    try { localStorage.setItem("seek.sidebarCollapsed", String(collapsed)); } catch (e) {}
  }

  const toggleTop = document.getElementById("sidebar-toggle-top");
  toggleTop?.addEventListener("click", () => setCollapsed(sidebar.dataset.collapsed !== "true"));

  try {
    if (localStorage.getItem("seek.sidebarCollapsed") === "true") setCollapsed(true);
  } catch (e) {}

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
      e.preventDefault();
      setCollapsed(sidebar.dataset.collapsed !== "true");
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      openSearchModal();
    }
  });

  document.getElementById("search-trigger")?.addEventListener("click", openSearchModal);

  // My tasks group toggle (persisted)
  const group  = document.getElementById("tasks-group");
  const toggle = document.getElementById("tasks-group-toggle");
  try {
    const stored = localStorage.getItem("seek.myTasksOpen");
    if (stored === "false") {
      group.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
    }
  } catch (e) {}
  toggle?.addEventListener("click", () => {
    const open = group.dataset.open === "true";
    group.dataset.open = open ? "false" : "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    try { localStorage.setItem("seek.myTasksOpen", String(!open)); } catch (e) {}
  });
}

/* ─── Search modal ─────────────────────────────────────────── */
function ensureSearchModal() {
  if (document.getElementById("search-modal-backdrop")) return;
  const m = document.createElement("div");
  m.id = "search-modal-backdrop";
  m.className = "search-modal-backdrop";
  m.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true">
      <div class="search-modal-input-wrap">
        <i data-lucide="search" class="w-[16px] h-[16px] search-modal-icon"></i>
        <input id="search-modal-input" placeholder="Search tasks by name, app, or words inside…" autocomplete="off" />
        <span class="search-esc">esc</span>
      </div>
      <div class="search-modal-body" id="search-modal-body"></div>
    </div>
  `;
  document.body.appendChild(m);

  const input = m.querySelector("#search-modal-input");
  const body  = m.querySelector("#search-modal-body");

  function searchResultIcon(state) {
    if (state === "completed") return { icon: "check", cls: "done"   };
    if (state === "failed")    return { icon: "x",     cls: "failed" };
    if (state === "stopped")   return { icon: "square",cls: "stopped"};
    if (state === "paused")    return { icon: "pause", cls: "paused" };
    if (state === "running")   return { icon: "activity", cls: "live"};
    return { icon: "circle", cls: "" };
  }

  function renderResults() {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      const recentSearches = SIDEBAR_DATA.recentSearches.map((s) => `
        <div class="search-result-row" data-search="${s}">
          <i data-lucide="clock" class="w-[14px] h-[14px] search-result-icon"></i>
          <span class="search-result-text">${s}</span>
        </div>
      `).join("");
      const recentTasks = SIDEBAR_DATA.recentTasks.slice(0, 5).map((t) => {
        const ic = searchResultIcon(t.state);
        return `
          <a class="search-result-row" href="Seek-Desktop-Phase-1-Working.html?taskId=${t.id}&task=${encodeURIComponent(t.title)}&state=${t.state}" style="text-decoration: none; color: inherit;">
            <i data-lucide="${ic.icon}" class="w-[14px] h-[14px] search-result-icon ${ic.cls}"></i>
            <span class="search-result-text">${t.title}</span>
            <span class="search-result-meta">${t.time}</span>
          </a>
        `;
      }).join("");
      body.innerHTML = `
        <div class="search-section-label">Recent searches</div>
        ${recentSearches}
        <div class="search-section-label" style="margin-top: 8px;">Recent tasks</div>
        ${recentTasks}
      `;
    } else {
      const all = [
        ...SIDEBAR_DATA.liveTasks.map((t)   => ({ ...t, kind: "live"   })),
        ...SIDEBAR_DATA.recentTasks.map((t) => ({ ...t, kind: "recent" })),
      ];
      const matches = all.filter((t) =>
        t.title.toLowerCase().includes(q) || (t.app || "").toLowerCase().includes(q)
      );
      if (!matches.length) {
        body.innerHTML = `<div class="search-empty">No tasks matching "<strong>${q}</strong>"</div>`;
      } else {
        body.innerHTML = matches.map((t) => {
          const ic = searchResultIcon(t.state);
          const meta = t.kind === "live" ? "Running" : (t.time || "");
          const stateParam = t.kind === "recent" ? `&state=${t.state}` : "";
          return `
            <a class="search-result-row" href="Seek-Desktop-Phase-1-Working.html?taskId=${t.id}&task=${encodeURIComponent(t.title)}${stateParam}" style="text-decoration: none; color: inherit;">
              <i data-lucide="${ic.icon}" class="w-[14px] h-[14px] search-result-icon ${ic.cls}"></i>
              <span class="search-result-text">${t.title}</span>
              <span class="search-result-meta">${meta}</span>
            </a>
          `;
        }).join("");
      }
    }
    if (window.lucide) lucide.createIcons();

    body.querySelectorAll("[data-search]").forEach((r) => {
      r.addEventListener("click", () => {
        input.value = r.dataset.search;
        renderResults();
        input.focus();
      });
    });
  }

  input.addEventListener("input", renderResults);
  m.addEventListener("click", (e) => { if (e.target === m) closeSearchModal(); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && m.classList.contains("open")) closeSearchModal();
  });

  renderResults();
}

function openSearchModal() {
  ensureSearchModal();
  const m = document.getElementById("search-modal-backdrop");
  m.classList.add("open");
  const input = m.querySelector("#search-modal-input");
  input.value = "";
  // Re-render to show recent searches
  input.dispatchEvent(new Event("input"));
  setTimeout(() => input.focus(), 50);
}

function closeSearchModal() {
  const m = document.getElementById("search-modal-backdrop");
  m?.classList.remove("open");
}
