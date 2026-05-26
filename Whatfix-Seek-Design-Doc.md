# Whatfix Seek — AI Task Execution Experience (Desktop)

A desktop AI app that executes real work for the user across the browser and the OS. Seek is not a chatbot — it is an operator. The user states intent in natural language; Seek **takes screenshots, reads the UI layer of the target app, and performs the task** by clicking, typing, and validating until the goal is met.

This document adapts the mobile Seek experience (Project Maven 26 — Figma) to a desktop form factor. Brand language, the Mini Seek Bar, and the two-mode model carry over verbatim. Everything else scales up to use the bigger canvas.

---

## 1. Product premise

Most "AI assistants" still hand the work back to the user as text. Whatfix Seek **completes the task** — booking the meeting, filing the expense, pulling the report, updating the CRM. As a native desktop app, Seek picks the right execution surface (its own browser vs. the user's OS) and stays resident across sessions.

**One promise:** _"Tell Seek what you want done. It does it. You watch, or you don't."_

**How Seek works under the hood (relevant for UX):** screenshot → vision/DOM parse of the UI layer → plan next action → execute action → screenshot again → loop until done. The user-facing implication: Seek visibly _pauses to think_ between actions, and our UI has to make that pause feel intentional, not stuck. The Mini Seek Bar's fading "thinking" text (§4) is what carries that weight.

---

## 2. Two execution modes

The single most important product decision: Seek runs in two distinct modes, and the user must always know which one is active.

### 2.1 Work in Browser (non-blocking, parallel)

- Agent operates inside the **user's own browser** (Chrome, Edge — Chromium-based with tab-group support in v1). **Seek does not embed or host its own browser inside the desktop app.** That keeps the user logged into all their sites, on their existing profile, with their existing extensions and bookmarks.
- When the first browser task starts, Seek creates (or focuses) a tab group named **"Seek AI"** in the user's active browser window. The group can hold any number of tabs depending on what the task needs — one task might fan out across several tabs (e.g. "compare 4 SaaS vendor sites"), another might use just one.
- The user keeps using every other tab and tab group in the browser normally. They can keep working, switch tabs, open new windows — the only restricted real estate is the tabs inside the "Seek AI" group.
- Up to 5 concurrent tasks → up to 5 task contexts inside the Seek AI group (each task may itself own multiple tabs).
- Best for: web SaaS workflows (Salesforce, Jira, Gmail, Workday, HubSpot, internal tools), research, scraping, multi-tab orchestration.

**Why the user's browser, not Seek's own:** authentication. Most enterprise SaaS uses SSO, MFA, cookies, and device trust the user already established. Spinning up a clean Chromium would mean re-logging-into everything, fighting MFA on every run, and tripping anomalous-login alarms. Riding the user's profile is the only way Seek works on day one.

**Implementation note (informs Phase 2 scope):** this requires a Seek browser extension (or native-messaging bridge) installed alongside the desktop app. The extension creates the tab group, takes screenshots, reads the DOM, dispatches clicks/keys, and hosts the in-tab Mini Bar. The desktop app talks to the extension over a local socket. **Onboarding must install the extension** — and if it's missing or disabled, Browser mode is gracefully disabled with a clear "Install Seek browser extension" CTA.

### 2.2 Work in Desktop (blocking, exclusive)

- Agent takes control of the **user's actual cursor, keyboard, and screen** to drive native apps (Outlook desktop, Excel, SAP GUI, Tally, legacy Windows apps, anything not on the web).
- The user is **blocked** while it runs — the task is exclusive to the foreground machine.
- **Hard stop rule:** _any_ mouse movement, click, or keypress from the user immediately halts the run. The agent does not race the user.
- Best for: native enterprise apps, anything that can't be done in a browser.

### 2.3 Mode comparison — the table that goes on every onboarding screen

| Dimension | Work in Browser | Work in Desktop |
|---|---|---|
| Execution surface | User's own browser, in a "Seek AI" tab group | Native OS (real cursor + keys) |
| User can keep working | **Yes** | **No — blocked** |
| Concurrency | Up to 5 parallel tasks | 1 task at a time |
| Stops on user input | No | **Yes, instantly** |
| Queue behavior | Tasks fan out | Tasks queue serially |
| Mini Seek Bar controls | Pause + Stop | Stop only (no pause; user can't interact mid-run anyway) |
| Best for | Web apps, research | Native desktop apps |

---

## 3. Brand language — three surfaces, one product

Seek's desktop UI is composed of three surfaces, each with a distinct visual treatment from the Whatfix design system.

| Surface | Theme | When it shows |
|---|---|---|
| **Sidebar (chrome)** | **Dark** `#1F1F32` | Always — primary navigation rail |
| **Top bar + canvas (chrome)** | **Light** (top bar white, canvas off-white `#FCFCFE`) | Always — workspace where the user reads and writes |
| **Mini Seek Bar (in-flight signal)** | **Dark, glassy** — radial gradient pill | Only when a task is running |

The dark/light contrast between sidebar and canvas is intentional and load-bearing: the sidebar is the user's anchor (always there, doesn't compete for attention), the light canvas is where work happens (max readability), and the dark Mini Bar (Phase 2) signals when Seek is operating — distinguishable from both. Three layers, three jobs.

### 3.1 Color tokens

**Dark sidebar tokens** — pulled from the Whatfix Seek dashboard reference:

| Role | Token | Hex |
|---|---|---|
| Sidebar surface | `side/bg` | **`#1F1F32`** (Secondary-1000) |
| Sidebar hover row | `side/hover` | `#2A2940` (~`#1F1F32` lifted) |
| Active nav pill — background | `side/active-bg` | **`#3D3C52`** (Secondary-800) |
| Active nav pill — 1px stroke | `side/active-stroke` | `#525066` (Secondary-700) |
| Active nav text + icon | `side/active-text` | **`#FFF8F5`** (Fire-50 — cream-orange) |
| Inactive nav text | `side/text` | `#ECECF3` (Secondary-200) |
| Muted text on dark | `side/text-muted` | `#8C899F` (Secondary-400) |
| Divider on dark | `side/divider` | `rgba(255,255,255,0.06)` |

**Active nav state is a full pill, not a left-rail accent.** Background `#3D3C52` + 1px stroke `#525066` + text shift to cream `#FFF8F5`. The orange shows up as text color, not as a stripe.

**Top bar + canvas tokens (light)** — chrome layer where work happens:

| Role | Token | Hex |
|---|---|---|
| Brand primary (Whatfix Fire) | `fire/400` | **`#EF5F00`** |
| Brand orange — hover | `fire/300` | `#E45913` |
| Brand orange — pressed | `fire/500` | `#C74900` |
| Brand orange — tint background | `fire/50` | `#FFF8F5` |
| Top bar surface | `chrome/surface` | `#FFFFFF` |
| Canvas surface | `chrome/bg` | **`#FCFCFE`** (off-white, softer than pure white) |
| Subtle alt fill | `chrome/surface-2` | `#F1F3F4` |
| Divider / hairline | `chrome/divider` | `#E8E7EF` (0.5px lines) |
| Text — strong | `chrome/text-strong` | `#1F1F32` |
| Text — strong-alt | `chrome/text-strong-2` | `#3D3C52` |
| Text — body | `chrome/text-mid` | `#525066` / `#6B697B` |
| Text — muted | `chrome/text-muted` | `#8B8D98` / `#8C899F` |
| Text — disabled | `chrome/text-disabled` | `#C4C4C4` |

**Seek in-flight (dark Mini Bar + agent surfaces)** — pulled from the Seek mobile Figma:

| Role | Token | Hex / value |
|---|---|---|
| Seek "in-control" orange — glow, spinner, running pill | `seek/orange-500` | **`#FA8A1F`** |
| Seek orange — secondary / gradient | `seek/orange-400` | `#F58923` |
| Seek orange — tint | `seek/orange-300` | `#FBA450` |
| Seek orange — deep / emphasis | `seek/orange-700` | `#F55800` |
| Mini Bar surface — dark radial | `seek/surface-grad` | radial `rgba(69,69,101,1)` → `rgba(43,43,64,1)` |
| Text on dark — strong | `seek/text-strong-dark` | `#FFFFFF` |
| Text on dark — muted | `seek/text-muted-dark` | `#8C899F` / `#7B7891` |

**Shared semantic colors** (used in both contexts):

| Role | Hex |
|---|---|
| Success | `#106A40` (chrome) / `#62C554` (badge) |
| Critical / error | `#B3141D` (chrome) / `#ED6A5E` (badge) |
| Warning | `#976C07` (chrome) / `#F6BE4F` (badge) |
| Info | `#0975D7` |

**Why two oranges?** `#EF5F00` is the Whatfix Fire brand orange — used on chrome (primary buttons, brand moments, the Whatfix mark, the cream active-nav text token traces back to it). `#FA8A1F` is reserved exclusively for the "Seek is in control" signal — the Mini Bar spinner, the edge-glow, the running-state pulse. The hues are close on purpose (same family) but the lighter `#FA8A1F` against the dark Mini Bar has more visual life — it pulses, it breathes. Using `#EF5F00` everywhere would dilute the "AI is operating" cue. Using `#FA8A1F` on chrome buttons would clash with the Whatfix brand. Keep the roles strict.

**Orange discipline (the rule for every phase):** Seek is a task-execution tool. Orange is reserved for moments that demand the user's focus. If we tint everything in brand orange, nothing is focal. Allowed orange moments:

| Surface | Allowed | Reason |
|---|---|---|
| WF brand mark in the sidebar | ✓ | Identity. |
| **Primary action button** (Send) | ✓ — and only when actionable (textarea non-empty) | This is the "do it" button. |
| Whatfix Flow attach-menu icon | ✓ | Flows are a Whatfix-branded primitive — the orange is the signal "this is Whatfix content." |
| Mini Bar spinner + edge-glow (Phase 2+) | ✓ — uses `#FA8A1F` (the Seek-specific shade) | "Seek is in control." |
| Active nav item text | ✓ — but only as cream `#FFF8F5` which reads almost-white | A subtle warmth on the active row, not an attention-grab. |
| Everything else (example card icons, mode-menu chips, links, avatars, hover states, selected states) | ✗ | Use **info blue `#0975D7`** for ambient accents and links; use neutral `chrome/surface-2 #F1F3F4` for non-critical states. |

If you find yourself reaching for orange on a new surface, ask: _"is the user supposed to focus here right now?"_ If the answer is "not really," it's not orange.

### 3.2 Typography

- **Inter** is the primary type face (system fallback: SF Pro Text on macOS, Segoe UI on Windows).
- Weights used: 400 (Regular), 500 (Medium), 600 (Semi Bold), 700 (Bold).
- Mobile sizes scale up on desktop: page titles 36–48px, section headers 18–20px, body 14px, captions 12px, status microcopy 14/600.
- The "Seek is working / Seek is active…" microcopy is `Inter 14/600` on `seek/text-muted-dark` — keep this exact treatment everywhere it appears.

### 3.3 Shape, depth, motion

- **Pill geometry** for the Mini Seek Bar and agent cards: corner radius ~24px on outer container, 8px on inner controls.
- **Shadows are double-layered and soft** — `0 2.39 4.78 rgba(0,0,0,.12), 0 1.19 4.78 rgba(0,0,0,.16)`. Don't use harsh single-layer drops.
- **Backdrop blur (`backdrop-filter: blur(50px)`)** on the Mini Bar where the OS supports it. Gives the floating-glass quality the mobile app already has.
- **Generous spacing** (12px gutters, 4–8px internal padding) — premium, not cramped.
- **Motion vocabulary:** soft ease-in-out, ~300ms for state transitions, ~1.4s for the orange edge-glow breathe (see §4.2).

### 3.4 Iconography

- Outlined, single-weight, 16–24px. Stroke matches text color. Pause / Stop / Paperclip / Chevron / Globe — all minimal line icons. No filled "iOS-style" glyphs.

### 3.5 Whatfix dashboard chrome — layout (the resting state of the app)

Dark sidebar against a light top bar and off-white canvas — pulled from the Whatfix Seek dashboard reference. The sidebar grounds the app; the canvas is where work happens.

```
┌───────────┬─────────────────────────────────────────────────────────┐
│  [WF] Seek│  [≡] Whatfix Seek ▾          ?  🔔  ⚙  │  [SS] ▾        │ 79px LIGHT top bar
│           ├─────────────────────────────────────────────────────────┤
│  Acme Inc.│                                                          │
│  ENT-2841 │                                                          │
│           │                                                          │
│  + New T. │                                                          │
│  ▶ Multi  │                                                          │
│  ⏱ Queue  │                  Main canvas                             │
│  🕘 Hist. │                  (off-white #FCFCFE)                     │
│  📚 Lib   │                                                          │
│  ⚡ Flows │                                                          │
│  📅 Sch.  │                                                          │
│           │                                                          │
│  ─────    │                                                          │
│  [SS]     │                                                          │
│  ⟨ Coll.  │                                                          │
└───────────┴──────────────────────────────────────────────────────────┘
  DARK         LIGHT
  #1F1F32      #FFFFFF top bar, #FCFCFE canvas
  240px
  (collapses to 64px — icons only)
```

| Region | Spec |
|---|---|
| **Top bar** | Height **79px**, background `chrome/surface` (white `#FFFFFF`), bottom border `0.5px solid chrome/divider` (`#E8E7EF`). Sidebar toggle (`≡`) on the left, product name (Inter 18/700, `chrome/text-strong-2`), product switcher chevron, then spacer, then Help · Notifications · Settings · vertical hairline · Avatar menu. |
| **Sidebar — base** | Width **240px**, background `side/bg` (`#1F1F32`). Three vertical zones: brand row (top) · workspace switcher · nav list · footer (avatar + collapse). |
| **Sidebar — brand row** | WF orange logomark + "Whatfix Seek" + sub-label, separated from the rest by a 1px `side/divider` line. |
| **Sidebar — workspace switcher** | A row showing the current ENT (workspace mark + name + `ENT-####` sub-label + chevron). Click → workspace picker. Hovers to `side/hover` (`#2A2940`). |
| **Sidebar — nav items** | Inter 14/500. Height 40px, 12px horizontal padding, 2px gap between items. Inactive text: `side/text` (`#ECECF3`). Icon: 18px, color follows text. |
| **Sidebar — active nav item** | **Full pill, not a left-rail accent.** Background `side/active-bg` (`#3D3C52`), 1px stroke `side/active-stroke` (`#525066`), 8px corner radius, text shifts to `side/active-text` (`#FFF8F5` cream-orange) at 600 weight. |
| **Sidebar — hover nav item** | Background `side/hover` (`#2A2940`), text shifts to `#FFFFFF`. |
| **Sidebar — collapsed** | Width **64px**, icons only, labels hidden, tooltip on hover. Active pill still renders (just centered on the icon). Toggle persists per-user. |
| **Sidebar — collapse toggle** | Bottom-of-sidebar ghost row: `⟨ Collapse` when expanded, `⟩` icon-only when collapsed. Also `⌘\` shortcut. |
| **Sidebar — dividers** | 1px `side/divider` (`rgba(255,255,255,0.06)`) between sections. |
| **Sidebar — footer (avatar row)** | User avatar + name + role pill, on `side/bg`. Hover lifts to `side/hover`. Three-dot overflow on the right. |
| **Main canvas** | Background `chrome/bg` (`#FCFCFE` — off-white, softer than pure white), no built-in max-width (content stays readable via inner `max-w-[920px]` on text-heavy pages like the landing). |
| **Cards** | Background white, **8px** corner radius (was 4px in the older Whatfix DAP — Seek uses 8px to match Mini Bar inner controls), soft double-layered shadow `0 2px 4px rgba(31,31,50,.04), 0 4px 12px rgba(31,31,50,.08)` on hover, 16px internal padding. |
| **Buttons — primary** | Background `fire/400` (`#EF5F00`), white text, 4px radius. Hover `fire/300` (`#E45913`), pressed `fire/500` (`#C74900`). |
| **Spacing grid** | 4 / 8 / 12 / 16 / 24 px. |

**Why dark sidebar + light canvas:** the sidebar is always visible — making it dark lets it recede when the user is reading the canvas, while still being obvious and clickable. The light canvas maximises readability for prompts, history, and Task Detail. The Mini Bar (Phase 2) is darker still (radial gradient `#454565 → #2B2B40`) so when it appears it reads as "operating-system level" — above both the sidebar and the canvas.

---

## 4. The Mini Seek Bar — the in-flight surface

The most important component in the product. It is the user's only ambient signal that an AI is operating their machine. It must be:
- Obvious (you cannot miss that Seek is running)
- Calm (it lives with you for minutes at a time — no flashing)
- Controllable (Pause and Stop within one click)
- Honest (it tells you, in fading text, what Seek is doing right now)

The Mini Bar is the same component in both modes; only its copy, controls, and host surface change.

### 4.1 Anatomy (single source of truth)

```
┌──────────────────────────────────────────────────────────────┐
│  [⊙ Seek]   Seek is working in this tab    ·  ◷  ⏸  ⏹       │
│              ↳ "Filling expense form — line 3 of 7"           │
└──────────────────────────────────────────────────────────────┘
   ↑ pill, dark radial gradient bg, 24px radius, backdrop blur
```

| Slot | Content | Notes |
|---|---|---|
| Logo | Seek mark with subtle animated pulse | Pulse synced to glow breathe |
| Status line | `Seek is working in this tab` (browser) / `Seek is active on this desktop` (desktop) | `Inter 14/600`, muted-dark |
| Thinking line | Live "what Seek is doing right now" — fades in for ~600ms, holds while current, fades out as the next step takes its place | `Inter 12/500`, muted; max 1 line truncated with ellipsis |
| Spinner | Orange spinner (`#FA8A1F`) when thinking; hidden when idle/paused | Indeterminate, 16px |
| Pause | Visible only in **Browser** mode | Click → pauses agent; bar darkens, glow stops; resumable |
| Stop | Always visible | Confirmation popover: "Stop and discard progress?" |
| Expand handle (optional) | Click anywhere on bar (excluding buttons) | Opens the Task Detail panel in the main Seek window |

### 4.2 The orange edge-glow

The defining visual signal. The boundary of the surface Seek is operating (the browser tab in Browser mode, the entire screen in Desktop mode) shows a **soft orange outer glow that breathes** — grows brighter and softer, then dims, in a slow 1.4s loop.

**Spec:**
- Color: `#FA8A1F` at 60% peak → 20% trough
- Blur radius: 24px peak → 12px trough
- Spread: ~6px
- Loop: 1.4s, ease-in-out, runs forever while task is in "Running"
- Pauses in place (frozen mid-glow at 30% opacity) when task is "Paused"
- Snaps to solid green for 1s then fades on "Completed"
- Snaps to solid red and stops breathing on "Failed"

This single visual replaces a thousand pieces of explanatory UI. It is what makes the user trust the agent is alive.

### 4.3 Browser mode — bar lives in the user's browser tab

- Mini Bar is injected by the Seek browser extension into every tab inside the **"Seek AI" tab group** of the user's own browser. Anchored bottom-center, 16px from the bottom edge.
- The browser tab viewport has the orange edge-glow on its inner border (so the user sees it even if they switch tabs and glance at the strip).
- **Tab group treatment:** the "Seek AI" tab group itself is colored orange in the browser's tab strip (using Chrome's `groups.color = "orange"` or equivalent). The user can spot Seek's tabs at a glance even when collapsed.
- The tab favicon is swapped for an animated Seek mark — the user can find the active tab in their tab strip by sight alone, even outside the group.
- Bar contents (browser mode):
  - Status: `Seek is working in this tab`
  - Controls: **Pause** + **Stop**
  - Thinking line: fades through `Reading invoice page → Locating amount field → Typing $1,420.00 → Clicking Submit` as Seek progresses.

**Tab-group edge cases (must be designed for Phase 2):**
- User drags a Seek tab out of the group → Seek detects and silently puts it back (with a one-time toast: "Seek keeps its work in the Seek AI group").
- User closes a Seek tab mid-task → task auto-pauses, surfaces a "Tab was closed — Resume?" prompt in the desktop app.
- User closes the entire browser → all running browser tasks auto-pause; resume offered when the browser reopens.
- User has multiple browsers installed → Seek uses the **default browser** by default; switchable in Settings.
- Browser is not yet open when a task starts → Seek launches the user's default browser and creates the group.

### 4.4 Desktop mode — bar lives over the screen

- The Mini Bar is a frameless, always-on-top OS-level window, anchored bottom-center of the active monitor, draggable.
- The orange edge-glow surrounds the **entire screen perimeter** (not just an app window) — because Seek owns the whole desktop while it works.
- Bar contents (desktop mode):
  - Status: `Seek is active on this desktop`
  - Controls: **Stop** only. No pause — pausing while Seek holds the cursor is a confusing state. The user's intent to interrupt is captured by mouse-move / keypress / Esc anyway, which auto-pauses.
  - Thinking line: same fade-in behavior as browser.
- Cursor: replaced with a Seek-branded cursor for the duration. The moment the user's input fires, the OS cursor returns and Seek's cursor disappears.

### 4.5 States of the Mini Bar

| State | Bar background | Edge glow | Thinking text | Controls |
|---|---|---|---|---|
| Idle (task queued) | dark radial, dimmed | none | "Waiting for slot" | Stop |
| Running | dark radial, full | breathing orange | live, fading sequence | Pause (browser) + Stop |
| Thinking pause | dark radial, full | breathing orange | "Thinking…" with three-dot ellipsis | Pause (browser) + Stop |
| Paused | dark radial, dimmed | frozen at 30% | "Paused at: <last step>" | Resume + Stop |
| Needs input | dark radial, full | breathing orange → adds purple inner ring | "Waiting for you: <question>" + Reply CTA | Reply + Stop |
| Completed | dark radial, fading | solid green 1s then off | "Done. <one-line summary>" | Open results · Dismiss |
| Failed | dark radial, dimmed | solid red, no breathe | "Couldn't finish: <reason>" | Retry · Take over · Dismiss |
| Stopped by user | dark radial, dimmed | none | "Stopped" | Dismiss · Rerun |

### 4.6 Multi-task — five tasks, one tab group

In Browser mode with multiple tasks running, the user sees:
- All Seek's tabs live together in the **"Seek AI" tab group** in their own browser (orange-tinted group label).
- One Mini Bar **per task tab** — the natural per-task signal where the work is actually happening.
- One **aggregated chip in the macOS menu bar / Windows tray** showing `Seek · 3 running` — click expands into a popover listing all five with thinking lines, Pause/Stop on each, and **"Jump to tab"** to focus the user's browser on that task.
- The main Seek desktop window's Multi-task Console (§5.3) shows them as chips/cards. Each card's primary click action is **jump to the browser tab** (because that's where the actual work surface is).

Desktop mode is always single-task, so there is always exactly one Mini Bar.

**Note on the live-preview thumbnail (deferred):** showing a small live screenshot of the active Seek tab inside the desktop app is on the roadmap but **explicitly not a Phase 2 requirement**. The mechanism (knowing which tab belongs to which task, jumping focus to it, capturing a screenshot for the detail view) must work from day one. The visible mini-preview tile in the desktop app can land later (see Phase 4 / Phase 8 in §12). When it does land, **clicking the preview jumps to the real tab in the user's browser** — never opens an embedded view inside the desktop app, because the embedded view would be a lie about where the work actually lives.

---

## 5. Core app surfaces (the main Seek window)

The main Seek window only matters when the user explicitly opens it. Most of the time the Mini Bar carries the relationship. The main window is for: starting tasks, inspecting tasks, and reviewing history.

Five anchors, exposed in a left rail, mapped 1:1 to the stated requirements.

### 5.1 New Task

- Single composer, large prompt field, mode toggle (Browser / Desktop) directly above the input — same control as on mobile, just sitting in a larger frame.
- Inline mode picker shows the consequence in plain English: _"Seek will run this in its own browser tab. You can keep working."_ vs. _"Seek will take over your screen. Don't touch the mouse or keyboard until it finishes."_
- `@`-mention pattern to reference apps, files, and prior tasks (`@Salesforce update the opportunity stage…`).
- **Save prompt** button next to Send — captures the current prompt (and any attached Flow) into the Prompt Library (§5.6).
- The AI-disclaimer footer from mobile is preserved verbatim: _"AI can make mistakes. Please monitor its activity. Learn more"_

#### 5.1.1 Attach menu (the paperclip)

Clicking the paperclip icon opens a small popover with two clearly separated options:

```
┌─────────────────────────────────┐
│  📄  Upload document             │
│      PDF, DOCX, CSV, image…     │
├─────────────────────────────────┤
│  ⚡  Attach Whatfix Flow         │
│      From this ENT — 247 flows  │
└─────────────────────────────────┘
```

This makes the Flow integration discoverable as a peer to file upload — not buried.

#### 5.1.2 Flow Picker

When the user picks "Attach Whatfix Flow," a modal slides in showing every Flow in the current ENT ID, **fetched automatically**. This is the differentiator that no generic agent has: Seek already knows the user's installed Whatfix content.

| Region | Contents |
|---|---|
| Header | "Attach a Flow from <ENT name>" · ENT ID badge · close |
| Search | Free-text search across flow name, description, target app, tags |
| Filters | App (Salesforce, Workday, SAP, …) · Status (Published / Draft / Archived) · Created by · Last updated · Tag · My flows / All flows |
| Sort | Recently used · Most used · A–Z · Last updated |
| List | One row per flow: name · target app icon · #steps · last used · "Used 124× in last 30d" · attach button |
| Empty state | "No flows match. Try fewer filters, or upload a document instead." |
| Footer | Selected: 0/1 (single-attach in v1) · Cancel · Attach |

Pulling the list happens on modal open — should be cached locally and refresh in the background. A subtle "Synced 2 min ago · Refresh" affordance in the footer.

#### 5.1.3 Flow-aware prompt scaffolding

The moment a Flow is attached, the composer transforms. The user shouldn't have to retype things the Flow already encodes (target app, the sequence of steps, required fields). Instead, the input becomes a **fill-in-the-blanks scaffold** with inline ghost-text prompts:

**Before attaching a flow:**
```
┌────────────────────────────────────────────────────┐
│  What do you want Seek to do?                      │
└────────────────────────────────────────────────────┘
```

**After attaching "Update Opportunity Stage in Salesforce":**
```
┌────────────────────────────────────────────────────┐
│  ⚡ Update Opportunity Stage  ×                     │
│                                                     │
│  Run this flow for ⟨which opportunities?⟩          │
│  and set the stage to ⟨target stage⟩.              │
│  ⟨Optional: any extra notes for Seek⟩              │
└────────────────────────────────────────────────────┘
   ↑ blue chip = attached flow      ↑ ghost-text slots, click to fill
```

Mechanics:
- Each `⟨slot⟩` is a click-to-fill placeholder rendered in muted text (`seek/text-muted-dark`, italic).
- Clicking a slot turns it into a focused inline editor; pressing Tab moves to the next.
- Slots are derived from the Flow's metadata: required parameters become required slots (validated before Send), optional parameters become optional slots.
- Below the input, a one-line hint: _"This flow runs in Salesforce → 7 steps · usually takes ~40s."_
- A `Customize` link expands a side panel showing the flow's full step list, so the user can verify what will happen before sending.
- If the user types free-form text instead of filling slots, Seek treats it as additional context layered on top of the flow.

This pattern is the Whatfix moat — it converts "I have to write a long, exact prompt" into "I confirm three blanks." Adoption with non-technical users will live or die on this.

#### 5.1.4 Other composer affordances

- **From Library** button (or `/` slash command) — opens the Prompt Library inline (§5.6) and inserts a saved prompt with one click. Saved prompts can carry an attached Flow with them.
- **Suggested templates** by department (Sales, Support, HR, Finance) — surfaced as a 2×3 grid of cards on first launch and on empty composer.
- **Save as recurring/scheduled task.**

### 5.2 Task History

- Reverse-chronological list grouped _Today / Last 3 days / This week / Earlier._
- Each row: title, mode icon (browser/desktop), status pill (using the §4.5 taxonomy), duration, app(s) touched.
- Filters: mode, status, app, time range. Search across task name and prompt.
- Click into a row to open Task Detail (§5.5).
- Bulk actions: rerun, duplicate as new task, export run log, delete.

### 5.3 Multi-tasking (up to 5 concurrent — browser only)

- **Multi-task Console** — up to 5 live task **cards** (not a thumbnail grid). The actual work lives in the user's browser (in the "Seek AI" tab group); the desktop console is the dashboard, not the viewport.
- Each card shows:
  - Task name + truncated prompt
  - Mode + status + elapsed time
  - The same thinking-text line as the Mini Bar (live, fading)
  - Tab badge — `1 tab` / `3 tabs` if the task is using multiple tabs in its group
  - Inline actions: **Jump to tab** (focuses the user's browser on the task's active tab) · **Pause** · **Stop** · **Send message**
- Slot 6 is disabled with a tooltip: _"Limit is 5 parallel tasks. Pause or complete one to start another."_
- **Mode conflict:** kicking off a Desktop task while Browser tasks are running shows a modal: _"Desktop tasks block your screen. Your 3 browser tasks will keep running in the background. Continue?"_

**Deferred (post-v1):** an optional live-preview thumbnail rendered on each card — a small screenshot of the active Seek tab updated every few seconds. Useful but **not blocking** for v1. Clicking the preview must jump to the real browser tab (never open an embedded view inside the desktop app). The underlying capability (screenshotting the live tab, knowing which tab belongs to which task) is required from Phase 2 because Task Detail and the audit log both need it.

### 5.4 Task Queueing (same session)

- Print-queue model. Anything kicked off when 5 browser slots are full goes into the queue and starts the moment a slot frees up.
- Desktop tasks always serialize.
- Queue visible in the persistent footer bar: `3 running · 2 queued · 12 completed today`.
- Drag to reorder; right-click to "Run next."
- Queue persists across app restarts.

### 5.5 Per-task inspection

- Clicking a tile or a history row opens **Task Detail** in a three-column panel:
  1. **Plan & Steps** — checklist; each step expands to show the model's reasoning, the screenshot it took, the action it took, and the result.
  2. **Live View** — for browser: a stream of the most recent screenshots from the user's active Seek tab plus a prominent **"Open tab in browser"** button (we never embed the user's browser inside the desktop app). For desktop mode: live screencast and recorded video. After completion, both modes play back as a stitched video.
  3. **Activity log** — timestamped events: clicks, API calls, screenshots, agent decisions, model used, credits/cost consumed.
- Right rail: created by, started at, runtime, status, model, actions used, credits used, linked apps.
- Per-task actions: **Pause / Resume / Stop / Mark Complete / Rerun / Edit prompt and re-run / Rollback to checkpoint.**

### 5.6 Prompt Library

A first-class surface in the sidebar — `⌘L`. Three things live here, in tabs:

| Tab | Contents |
|---|---|
| **My prompts** | Prompts the user has saved themselves |
| **Workspace** | Prompts shared by the admin / by teammates inside the same Whatfix workspace |
| **Templates** | Whatfix-curated starter prompts by department (Sales / Support / HR / Finance / IT) |

**Each entry shows:**
- Title (user-named, e.g. "Q4 close — pull MRR breakdown")
- Prompt body preview (2-line truncated)
- Attached Flow chip if any (`⚡ Update Opportunity Stage`)
- Mode badge (Browser / Desktop) — the prompt remembers which mode it was authored for
- Usage stats: "Used 12× · last 3d ago"
- Author + share scope (Private / Workspace / Public-to-org)

**Row actions:**
- **Run** — drops the prompt into a new task composer pre-filled, ready to Send.
- **Edit** — opens it in the composer for changes.
- **Duplicate** — fork into "My prompts" even if it came from Workspace.
- **Share** — toggle scope (Private → Workspace).
- **Delete** — confirm modal.

**How prompts get saved:**
- From the New Task composer: **Save prompt** button next to Send. Modal asks for a name, optional description, and toggle "Save attached Flow with this prompt."
- From a completed task in History: "Save as prompt" action.
- From the agent itself when a freshly-typed prompt works well: a subtle suggestion after task completes — _"Save this as a prompt for next time?"_ — dismissible, never aggressive.

**Search & filter:** free text across title, body, and tags · filter by attached flow, mode, last used, author.

**Why this matters:** the same five users will run the same ten workflows hundreds of times. The Library converts every successful one-off into a reusable asset, which is exactly the value loop Whatfix already sells on the Flows side.

---

## 6. Cross-cutting features (informed by competitor scan)

These aren't in the original brief but every comparable product ships them, and Whatfix-shaped buyers will expect them:

1. **Run from anywhere** — global hotkey (`⌘⇧K`) opens a frameless quick-task composer over whatever app the user is in.
2. **Templates / Saved tasks** — recurring workflows as one-click presets.
3. **Scheduled tasks** — run nightly, weekly, or via webhook.
4. **Credentials vault** — Seek logs into apps on the user's behalf; passwords live in a local encrypted store with biometric unlock. Never sent to the model.
5. **Knowledge & context** — upload reference docs the agent uses for grounding; `@`-mention for files, contacts, prior tasks.
6. **Human in the loop checkpoints** — for high-stakes steps (sending email, submitting a form, paying an invoice) Seek pauses and asks "Send?" with a 10-second auto-decline. Toggleable per task type. Shows up in the Mini Bar as the "Needs input" state (§4.5).
7. **Audit log & shareable replay** — every action recorded as a video + structured log, sharable as a link.
8. **Cost / credits meter** — visible per task and in the footer.
9. **Failure handoff** — when Seek fails, offer: _"Try a different approach?"_ or _"Take over from here?"_ (the latter pops the user into the task's exact state).
10. **Org & permissioning** — workspace-level allowed apps, allowed domains, allowed time windows, audit export. Out of v1 scope but informs the data model.

---

## 7. Information architecture

```
Whatfix Seek (desktop app)
├── Top bar (79px, white, Whatfix DAP standard)
│   ├── ≡ Collapse sidebar                 [⌘\]
│   ├── Whatfix logo · "Seek" · product switcher
│   ├── (spacer)
│   ├── 🔔 Notifications
│   ├── ⚙ Settings
│   └── Avatar menu
├── Left rail (DARK #1F1F32 · 240px expanded, 64px collapsed)
│   ├── + New Task                         [⌘N]
│   ├── ▶ Multi-task Console (3 running)   [⌘1]
│   ├── ⏱ Queue (2 waiting)
│   ├── 🕘 Task History
│   ├── 📚 Prompt Library                  [⌘L]
│   ├── ⚡ Whatfix Flows (synced)
│   ├── 📅 Scheduled
│   ├── ────────
│   ├── [avatar] Sandeep · Admin
│   └── ⟨ Collapse                          [⌘\]
├── Main canvas (context-sensitive)
│   ├── New Task composer
│   ├── Multi-task grid (1–5 live tiles)
│   ├── Task Detail (Plan / Live View / Activity)
│   └── History list
└── Persistent footer
    └── 3 running · 2 queued · 12 completed today · 1.4k credits used
```

**Outside the main window:**
- **Mini Seek Bar** in every active browser tab (browser mode) or pinned over the screen (desktop mode) — §4.
- **Menu-bar / tray chip** — aggregate count of running tasks, click for popover.
- **OS notifications** — task completed / needs input / failed.

---

## 8. States to design for explicitly

- **Empty state — first launch.** Two-mode table from §2.3 + 6 starter templates by department.
- **Slot full.** "All 5 browser slots are busy" — show what's running, suggest queueing.
- **Mode conflict.** User tries Desktop while Browser tasks run — confirmation modal.
- **Interrupted desktop task.** Auto-pause, capture diff, show Resume CTA.
- **Needs input.** Mini Bar gains purple inner ring + Reply CTA; main window tile pulses; OS notification fires.
- **Auth required.** Hit a login wall, needs MFA — surface live view with "Your turn for MFA" and a 60s window; auto-resume.
- **Permission denied.** App/domain not in allow-list — explain why, link to admin.
- **Long-running tasks (>10 min).** Collapse step list to a progress summary, add ETA.
- **Failure.** Surface error category (auth / element-not-found / timeout / model-refused), suggest fixes, offer rerun with adjustments.

---

## 9. Open questions

1. Is the 5-task cap a hard limit (cost) or a UX limit (cognitive)? Power-user opt-in to 10?
2. Should the menu-bar / tray chip be a feature of the desktop app or a separate utility process?
3. How do we communicate cost to non-technical buyers? "Credits" is industry-standard but opaque.
4. Desktop mode on multi-monitor setups — does Seek own all screens or just the focused one? The orange edge-glow needs to follow.
5. Should "Send message to agent mid-run" be free-form text or structured (Pause / Skip step / Change input)?
6. Is the Mini Bar draggable on all four edges of the screen / tab, or anchored bottom-center only? Mobile is anchored — desktop might want freedom.
7. Do we let users build agents (Clay/Lindy/Relevance pattern) or only run prompts (Manus pattern)? V1 recommendation: prompts only; templates fill the gap.

---

## 10. Competitive reference set (from Mobbin)

Patterns informing this doc:

| Product | Pattern borrowed |
|---|---|
| **Cursor** (background agents) | Multi-task list in sidebar with model badges; "Started N background agents" toast — direct analog for §5.3. <https://mobbin.com/screens/f3a0c140-cd83-498f-84f1-3ea991079865> |
| **Manus** | New task `⌘K`, "while we work you can leave the page" tips, browser notifications when complete, scheduled tasks. <https://mobbin.com/screens/26f6352b-4eb0-4088-a658-23478bd18c1c>, <https://mobbin.com/screens/728a9190-886a-4843-8b2e-a9ea8c180d18> |
| **Lindy** | "Start computer" / "Use Computer", Browser + Terminal tabs alongside chat, todo-list step progress — closest existing analog to Seek's browser/desktop duality. <https://mobbin.com/screens/9f4affd5-f387-4149-860e-95c83f9bbba5> |
| **Replit Agent** | Live timeline with checkpoints + "Rollback to here", persistent Stop button — informs §5.5 rollback. <https://mobbin.com/screens/cf76137b-1033-4582-b6d5-0a28e4c0dfb5> |
| **Relevance AI** | Task timeline + right-rail metadata (Status, Credits used, Run time, Linked tools), "Pause Task / Mark as complete", Agent Queue — informs §5.2, §5.5. <https://mobbin.com/screens/4366a3ad-efe2-464b-99e7-2ff4202948a5>, <https://mobbin.com/screens/13e6efb5-d059-4365-96f3-5c8f4722409e> |
| **Rox** | "Step 1 of 7 · 3 min left" progress with nested tool calls — model for §5.5 plan view. <https://mobbin.com/screens/107c729c-a68d-48e3-8ece-51d43eff4215> |
| **Plane Pi** | Expandable "Thinking" panel — model for reasoning transparency that complements the Mini Bar's fade. <https://mobbin.com/screens/19249595-3bcc-418f-88e5-15d5b60ea3af> |
| **ClickUp Brain** | Suggested follow-ups after task completion. <https://mobbin.com/screens/03de3331-f424-43b6-85ab-05fb5951549c> |
| **Claude / Sana AI / Mistral** | Sidebar IA: New chat, Starred, Recents, Projects, `@`-mention pattern. |
| **Lightfield** | "Task created" inline cards as the agent produces work — useful for showing artifacts of work, not just status. <https://mobbin.com/screens/5b5f4b9f-5940-47a0-845d-f6c74bac4de8> |

---

## 11. Out of scope for v1

- Agent builder (no-code workflow canvas like n8n/Relevance).
- Mobile companion app (the mobile app already exists; deep-linking between them is a v1.5 ask).
- Team-shared task templates.
- Marketplace of community templates.
- Voice input.

---

## 12. Phased build plan

A staged delivery so you can sign off at each milestone. Each phase ships a demo-able slice — no half-built stuff bleeding across phases. Foundations first; the highest-risk work (Desktop takeover) is deliberately late.

### Phase 1 — Landing Page + app shell (foundation)

**Goal:** stand up the desktop app shell, design tokens, sidebar, footer, and the Landing Page that everything else plugs into. No execution wired yet — pressing Send is a no-op with a "Execution unlocks next phase" tooltip.

**Why this is Phase 1:** every later screen sits inside this chrome and uses these tokens. Skipping the foundation means retrofitting the visual system later, which always rots. A clickable Landing Page is also enough to get internal feedback on whether the mobile brand language transferred cleanly to the bigger canvas.

#### The Landing Page itself

The user's first impression when they open Seek. Three jobs only: greet, get them composing a task, show what's possible. It sits inside the Whatfix dashboard chrome (§3.5) — same top bar, same collapsible sidebar, same look as Whatfix DAP.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ≡  [WF] Whatfix Seek  ▾                       🔔  ⚙  [SS]              │  79px, white
├──────────────┬──────────────────────────────────────────────────────────┤
│ WF DAP     ▾ │                                                          │
│              │   Good morning, Sandeep                                  │
│ + New Task   │   What do you want Seek to do?                          │
│ ▶ Multi-task │                                                          │
│ ⏱  Queue     │   ┌────────────────────────────────────────────────┐   │
│ 🕘 History   │   │  [Browser ▾]                                    │   │
│ 📚 Library   │   │  Describe a task…                                │   │
│ ⚡ Flows     │   │  📎  /  @                            💾  Send  │   │
│ 📅 Scheduled │   └────────────────────────────────────────────────┘   │
│              │   AI can make mistakes. Please monitor its activity.    │
│ ──────────   │                                                          │
│ [SS] Sandeep │   Try one of these                                       │
│              │   ┌──────┬──────┬──────┬──────┬──────┬──────┐           │
│ ⟨ Collapse   │   │Sales │ Sup. │ HR   │Finan.│  IT  │ Ops  │           │
│              │   └──────┴──────┴──────┴──────┴──────┴──────┘           │
│              │                                                          │
│              │   Recent                                                 │
│              │   [first-run empty state — "No tasks yet"]              │
└──────────────┴──────────────────────────────────────────────────────────┘
   240px         Footer: 0 running · 0 queued · 0 completed today
   (collapses to 64px via ⟨ or ⌘\)
```

**Components shipped:**
- **Whatfix dashboard chrome** (§3.5) — light 79px top bar, **dark 240px sidebar** (`#1F1F32`) with collapse to 64px (`⌘\` toggle), workspace switcher, full-pill active state (`#3D3C52` bg + stroke + cream `#FFF8F5` text), off-white `#FCFCFE` canvas
- App shell — window chrome, traffic lights, draggable title region
- Left sidebar — all nav items rendered with Whatfix-style active state; non-Phase-1 items disabled with "coming soon" tooltips
- Top bar with notification, settings, avatar menu
- Persistent footer
- Time-aware greeting (`Good morning / afternoon / evening, <first name>`) + intro line
- New Task composer (visual only — mode toggle works, paperclip/`/`/`@` show their intended menus but with stub content, Save-prompt button stubbed, Send disabled with tooltip)
- 6 starter template cards (Sales, Support, HR, Finance, IT, Ops) using the Whatfix card spec — 4px radius, Elevation-02 shadow. Clicking pre-fills the composer.
- Recent tasks list with first-run empty state ("No tasks yet — your last 5 will appear here")
- AI disclaimer footer microcopy

**Foundation work shipped alongside (invisible to the user but unlocks every later phase):**
- **Two token sets** from §3 baked into the component library: `whatfix/*` (light chrome — sidebar, top bar, cards, buttons) and `seek/*` (dark Mini Bar, glow, in-flight signals). Phase 1 only uses the chrome tokens visibly, but seeding both means Phase 2 doesn't have to retrofit.
- Inter typography stack (with platform fallbacks: SF Pro Text macOS, Segoe UI Windows)
- 4/8/12/16 spacing grid
- Iconography pack (outlined, 16–24px)
- Sidebar collapse/expand state machine + persistence per-user
- Telemetry + logging pipeline (so later phases get analytics for free)
- Auth + ENT identification (so Phase 5 Flow sync has workspace context)
- Update/release channel

**Theme:** light-only (matches the Whatfix DAP dashboard). A dark variant of the chrome is a v1.5 decision. The Mini Bar (Phase 2) remains dark in all themes.

**Landing Page states to design:**
- First-run empty (full 2×3 template grid, Recent hidden)
- Returning user (template grid collapses to single row, Recent expands to last 5)
- Has running tasks (top of canvas shows a "2 tasks running" pill that links to Multi-task Console — placeholder this phase)

**User can at end of Phase 1:**
- Open the app, see the Landing Page, feel the brand
- Type into the composer, switch mode (UI only)
- Click a template → composer pre-fills
- Navigate the sidebar (most items show "coming soon")

**Out of scope for Phase 1:**
- Any task execution
- Mini Seek Bar (Phase 2)
- Flow fetch (Phase 5)
- Prompt Library (Phase 6)

**Definition of done:** internal demo where someone unfamiliar with the project opens the app and immediately says "this is Whatfix Seek on desktop, same product as mobile."

**Approx size:** M

---

### Phase 2 — Browser mode execution + Mini Seek Bar

**Goal:** end-to-end one-task flow in Browser mode. User types a prompt, hits Send, Seek creates the "Seek AI" tab group in the user's own browser, opens a tab, runs the task, and the Mini Bar with the orange glow is visible the whole time.

**Surfaces shipped:**
- **Seek browser extension** (Chrome, Edge — Chromium-based in v1) — the core enabler. It creates/finds the "Seek AI" tab group, opens tabs into it, takes screenshots, parses the DOM, dispatches clicks and keystrokes, and injects the Mini Bar.
- **Onboarding flow for the extension** — first-run modal in the desktop app: "Install the Seek browser extension to run browser tasks." Detects install / enable state. Browser mode is gracefully disabled until the extension is present.
- **Native-messaging / local-socket bridge** between the desktop app and the extension. Auth handshake so a malicious extension can't impersonate Seek.
- **"Seek AI" tab group lifecycle** — created on first task, color-tinted orange in the tab strip, auto-disposed when empty + no tasks pending.
- **Mini Seek Bar** injected into each task tab — Running / Paused / Completed / Stopped / Failed states (Needs-input deferred to Phase 8).
- **Orange edge-glow** with breathing animation on the tab viewport, plus animated Seek favicon for the active tab.
- **Pause / Stop** controls in the Mini Bar wired to actually halt the agent.
- **Tab-group edge cases handled** (§4.3): tab dragged out of group → snap back + toast; tab closed mid-task → auto-pause with Resume CTA; browser closed → auto-pause all; browser not open → launch default browser.
- **OS-level notification** on completion (and on failure).
- **Screenshot pipeline** — every action is preceded by a screenshot, stored, and addressable by task + step. Powers Task Detail (Phase 3), audit (Phase 8), and the deferred mini-preview thumbnail (Phase 4+).

**User can at end of Phase 2:** run one browser task at a time start-to-finish in their own browser, see the Seek AI tab group appear, watch the live glow, pause/stop, get notified when done.

**Out of scope:** multi-task, history, task detail panel, queueing, live-preview thumbnails inside the desktop app, the "Jump to tab" action from the desktop app (that lands with multi-task in Phase 4).

**Approx size:** XL (was L — adding the extension + bridge + tab-group lifecycle is significant)

---

### Phase 3 — Task Detail + Task History

**Goal:** introspection. The user can review what Seek did.

**Surfaces shipped:**
- Task Detail panel (Plan / Live View / Activity columns + right-rail metadata)
- Task History list — grouping, filters, search, bulk actions
- Per-task: Rerun, Edit & rerun, Mark complete, Stop

**Out of scope:** rollback-to-checkpoint and shareable replay (Phase 8).

**Approx size:** M

---

### Phase 4 — Multi-tasking (up to 5) + Queue

**Goal:** unlock parallel browser tasks. This is where Seek starts to feel categorically different from a chat assistant.

**Surfaces shipped:**
- Multi-task Console — up to 5 live task **cards** (not thumbnails) with name, status, elapsed time, fading thinking line, tab badge (`1 tab` / `3 tabs`).
- **Jump to tab** action on every card — focuses the user's browser on the task's active tab.
- Queue UI with drag-to-reorder + "Run next."
- Footer counter wired up.
- Menu-bar / tray aggregate chip with popover, including per-task Jump-to-tab.
- Tab-group: a single "Seek AI" group hosts all parallel tasks (each task may itself own multiple tabs inside the group).

**Out of scope (deferred to Phase 8):** the optional **live-preview thumbnail** on each card. The screenshot capability exists from Phase 2, but rendering a continuously updating mini-preview inside the desktop app is a nice-to-have, not a Phase 4 blocker. When it ships, clicking it still jumps to the real browser tab.

**Out of scope (other):** Desktop mode (Phase 7).

**Approx size:** L

---

### Phase 5 — Whatfix Flow integration + Flow Picker + Scaffolded prompts

**Goal:** the Whatfix moat. Composer becomes Flow-aware.

**Surfaces shipped:**
- Paperclip attach menu (Upload document / Attach Whatfix Flow)
- Flow Picker modal — ENT-scoped list, search, filter, sort, usage counts
- Flow sync + local cache + background refresh
- Flow-aware composer scaffolding with `⟨ghost-text slots⟩`
- Customize side panel showing the flow's step list
- Sidebar `⚡ Whatfix Flows (synced)` browse surface

**Why this is Phase 5, not earlier:** needs Phase 2 (execution exists) and Phase 3 (detail view, so users can verify what the flow did). Coming after multi-task means the demo can show "five flow-driven tasks running in parallel" — the actual pitch to a buyer.

**Out of scope:** authoring/editing flows inside Seek — always defer to existing Whatfix authoring tools.

**Approx size:** L

---

### Phase 6 — Prompt Library

**Goal:** convert successful one-off prompts into reusable assets.

**Surfaces shipped:**
- Sidebar Prompt Library (`⌘L`)
- Three tabs: My prompts / Workspace / Templates
- Save-prompt flow from composer + from completed history items + soft "Save this for next time?" suggestion
- Row actions: Run, Edit, Duplicate, Share, Delete
- Search + filter
- `/` slash command in composer to insert from library

**Out of scope:** prompt versioning, org-level template governance (Phase 9).

**Approx size:** M

---

### Phase 7 — Desktop mode (the blocking one)

**Goal:** unlock native-app automation. Highest-risk feature — late on purpose. If the takeover UX feels unsafe, users lose trust permanently, so it ships after the rest of the product has earned that trust.

**Surfaces shipped:**
- OS-level cursor + keyboard control
- Pre-flight modal with 3-second countdown
- Always-on-top HUD strip with persistent Stop
- Screen-perimeter orange edge-glow (whole-screen, not tab)
- Branded Seek cursor
- Hard-stop on any user input (mouse move / keypress / Esc)
- Auto-pause with diff + Resume CTA on interruption
- Mode-conflict handling (Desktop while Browser tasks are running)

**Out of scope:** multi-monitor edge cases and allow-list (Phase 9).

**Approx size:** XL

---

### Phase 8 — Polish + power features

**Goal:** the features users will eventually demand but that don't block first-customer demos.

**Surfaces shipped:**
- Mini Bar **Needs-input** state (purple inner ring + Reply CTA)
- **Live-preview thumbnails on Multi-task Console cards** — small screenshot of each task's active tab, updated every few seconds. Clicking jumps to the real browser tab (never embeds the browser inside the desktop app).
- HITL checkpoints for high-stakes actions ("Send email?" with 10s auto-decline)
- Rollback to checkpoint in Task Detail
- Shareable replay links
- Scheduled tasks (cron + webhook triggers)
- Credentials vault with biometric unlock
- Failure-handoff prompts ("Try differently? / Take over from here?")
- Cost / credits meter per task and in footer
- Global hotkey (`⌘⇧K`) frameless quick composer

**Approx size:** L

---

### Phase 9 — Enterprise

**Goal:** unblock the buyer-side conversation.

**Surfaces shipped:**
- Workspace allowed-apps / allowed-domains / allowed-time-windows
- Audit log export (CSV + SIEM webhook)
- Multi-monitor Desktop-mode behavior + glow follow
- Org-level prompt governance + prompt versioning
- SSO / SCIM
- Per-user / per-team quotas

**Approx size:** L

---

### Sequencing summary

```
P1 ─ P2 ─ P3 ─ P4 ─ P5 ─ P6 ─ P7 ─ P8 ─ P9
              ↑           ↑         ↑          ↑
       internal demo   beta GA   public GA   enterprise
                                              deal-ready
```

- **After Phase 4:** internal demo — Seek running 5 browser tasks in parallel.
- **After Phase 6:** beta GA — Whatfix Flows + Prompt Library + history → the Whatfix story is complete on the browser side.
- **After Phase 7:** public GA — full product, both modes.
- **After Phase 9:** enterprise contract-ready.

**Compression options if you need a shorter path:**
- Phase 6 can swap with Phase 7 if Desktop-mode is more important than the Library for your first lighthouse customer.
- Phase 8 items can be lifted into earlier phases per-feature (e.g. Needs-input may need to ship with Phase 2 if early demos hit auth walls a lot).
- Phase 3 can be partially deferred — a stripped Task Detail with just the Activity log is enough to ship Phase 4. The Plan column can wait until Phase 5 when Flows give it more structure to show.
