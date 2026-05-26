# Seek Bar — Iteration 3 (Hybrid Approach)

> **Concept:** A single 56-px dark bar that is the entire Seek experience. Functions as the composer when idle, the status indicator while a task runs, and the outcome surface when a task completes. Lives over whatever app the user is actually working in.

This is the third design direction, complementing:
- **Option A — Workspace** (`Seek-Workspace.html`): Seek as its own full-screen app
- **Option B — Companion Panel** (`Seek-Panel.html`): floating 400px / 940px panel
- **Option C — Seek Bar** (`Seek-Bar.html`): minimal floating bar (this doc)

---

## 1. The bar

- **Height:** 56 px, never changes
- **Width:** 760 px (input) / 820 px (in-progress) / 900 px (output) — smooth width transition between phases
- **Position:** fixed, bottom-center of screen, 28 px above the dock
- **Background:** Navi `Secondary-800` (`#3D3C52`)
- **Radius:** 14 px (rounded pill)
- **Shadow:** prominent floating elevation (24 px blur, 35% opacity) + 1 px inner highlight
- **Stripe:** 3 px left edge, color-coded by state — peripheral-vision state cue

The bar is the only persistent Seek UI in this approach. There is no separate panel, sidebar, or window unless the user explicitly expands "Open in Seek".

---

## 2. The three phases

| Phase | Trigger | Purpose |
|---|---|---|
| **Input** | Default · post-decay · post-dismiss | Compose a prompt or browse history |
| **In Progress** | User hits Send | Show what Seek is doing in real time |
| **Output** | Task reaches terminal state | Surface the outcome and offer follow-ups |

### Phase 1 — Input (default)

Element-by-element, left to right:

```
[ Seek ✦ ]  [ Browser ▾ ]  | What can I help you with today?  |  [ My tasks ▾² ]  [📎]  [↑]
```

| Slot | Element | Notes |
|---|---|---|
| 1 | Animated Seek mark | Idle breathing animation (see §4) |
| 2 | Mode pill | `Browser` / `Desktop` — popover above with details |
| – | Divider | 1 px vertical, white at 8% |
| 3 | Text area | Italic placeholder, light-on-dark; expands flush |
| 4 | My tasks pill | Chevron + count badge if >1 running task |
| 5 | Attach icon | Paperclip — opens document / flow / prompt sub-menu |
| 6 | Send button | Fire-400 fill, disabled until input has content; `⌘↵` shortcut |

### Phase 2 — In Progress

```
[ Seek ✦ ]  | ⟳ Thinking · Verifying cost center …  |  [ Refund overcharge ▾ ]  [ Go to tab ]  [⏸]  [◼]
```

| Slot | Element | Notes |
|---|---|---|
| 1 | Animated Seek mark | Thinking → Taking-action animation (see §4) |
| – | Mode pill | **Removed** — mode is already chosen |
| 2 | Thinker chip | Compact pill with pulsing dot + state label |
| 3 | Sub-status | Rotating text (~3-4 s) — what Seek is doing right now |
| 4 | Truncated task pill | The prompt collapsed to ~28 chars; chevron opens accordion |
| 5 | Go-to-tab CTA | Jumps to the browser tab Seek is driving (only in Browser mode) |
| 6 | Pause icon | Replaces attach; click swaps to Resume on paused state |
| 7 | Stop button | Replaces Send; white-on-dark, requires confirmation |

### Phase 3 — Output

```
[ Seek ✦ ]  | ✓ Task completed · Add a follow-up…  |  [ Refund overcharge ▾ ]  [ Summary ]  [ ↻ Re-run ]  [📎]  [↑]  [ Open in Seek ]
```

| Slot | Element | Notes |
|---|---|---|
| 1 | Animated Seek mark | Squash-stretch celebration → settles into idle breath |
| – | Mode pill | Still **removed** until full reset to Input |
| 2 | Thinker chip | Now success-green, label "Done" |
| 3 | Sub-status | Italic invitation: "Add a follow-up task…" |
| 4 | Truncated task pill | Same task name, still accordion-accessible |
| 5 | Summary CTA | Opens a small popover with the outcome bullets + key decisions |
| 6 | Re-run CTA | Loads the prompt back into the composer (tweak then send) |
| 7 | Attach icon | Returns (attach to follow-up) |
| 8 | Send button | Disabled until follow-up has content |
| 9 | "Open in Seek" CTA | Expands the bar upward into a popover with full recording + decisions trail |

---

## 3. State system (six + one)

The bar's mood is communicated through three layers:
1. **The animated Seek mark** (primary — see §4)
2. **The left-edge stripe color** (peripheral cue)
3. **The thinker chip background + label**

| State | Stripe | Thinker chip color | When |
|---|---|---|---|
| **Idle** | none | n/a | Waiting for input |
| **Thinking** | Info-400 | rgba blue · light info | Seek just received the prompt, working out what to do |
| **Taking action** | Info-500 | deeper blue | Seek is executing |
| **Paused** | Warn-500 | amber | User or guard-rail halted |
| **Stopped** | Danger-500 | red | Terminal failure (with reason) |
| **Needs you** | Fire-400 | brand orange | Inline approval/decision required |
| **Completed** | Success-500 | green | Task succeeded, awaiting decay |

---

## 4. The animated Seek mark — character per state

The Seek logo (the 7-block tetris monogram in fire tones) is the bar's emotional center. It removes the need for a separate loader/spinner — the mark itself communicates state through movement.

| State | Animation | Timing | Easing | Character |
|---|---|---|---|---|
| **Idle** | Whole-mark gentle scale breath `1.00 → 1.04 → 1.00` | 2.8 s loop | `cubic-bezier(0.45, 0, 0.55, 1)` (sine) | "Patient lamp on standby" |
| **Thinking** | Per-block opacity wave cascading bottom-left → top-right + subtle whole-mark bounce | 1.64 s wave, 1.4 s bounce | sine | "Internal cascade — ideas traveling" |
| **Taking action** | Rhythmic heartbeat `0.98 → 1.08 → 0.99 → 1.00` + warm fire halo (drop-shadow) | 0.76 s loop | `cubic-bezier(0.34, 1.56, 0.64, 1)` (gentle overshoot) | "In the flow — craftsperson at work" |
| **Completed** | Squash-stretch `1.00 → 1.18 → 0.94 → 1.00` + success halo flash → settles into idle breath | 480 ms one-shot | `cubic-bezier(0.34, 1.8, 0.64, 1)` (spring) | "Quiet triumph, then return" |
| **Paused** | Very slow breath `1.00 → 1.015 → 1.00`; saturation reduced 45% | 6.4 s loop | ease-in-out | "Held breath, suspended" |
| **Stopped** | Completely static; saturation reduced 65%, brightness 85% | n/a | n/a | "Concluded, not dead" |
| **Needs you** | Lean toward action buttons (rotate 4°) + scale pulse `1.00 → 1.06 → 1.00` + fire halo | 1.4 s loop | sine | "Friendly tap on the shoulder" |

### Animation principles applied

1. **Slow-in / slow-out** on every transition. No linear motion.
2. **Anticipation** (Thinking accelerates breath before cascade fires).
3. **Squash & stretch** reserved for Completed only — scarcity makes it feel earned.
4. **Follow-through** — Completed's 0.94 dip after the peak, Heartbeat's gentle settle.
5. **Restraint via stillness** — Stopped uses no motion; the absence is the signal.
6. **Co-varying primitives** — motion frequency, color warmth, luminance move together so the state reads holistically.

### Cross-state motion gradient

```
SLOW (calm)                                                 FAST (active)
───────────────────────────────────────────────────────────────────
Stopped   Paused   Idle   Completed   Thinking   Taking Action   Needs you
static    6.4s     2.8s   480ms       1.4s       0.76s           1.4s
                          (one-shot)  cascade    heartbeat       lean+pulse
COLD                      NEUTRAL                                   WARM
desaturated               base orange                         brighter orange
```

A user looking at another app can tell Seek's state from peripheral vision based on the mark's pace + color warmth alone.

---

## 5. Phase transitions (the choreography)

### Input → In Progress (trigger: Send)

| Element | Behavior | Timing |
|---|---|---|
| Send button | Micro-bounce (scale 1 → 1.04 → 1) on click, then icon morphs ↑ → ◼ | 140 ms bounce, 200 ms swap |
| Mode pill | Slides right + fades out | 180 ms ease-out |
| Text-area content | Collapses leftward, becomes the truncated task pill | 240 ms |
| My-tasks pill | Morphs into the task pill (same chevron) | 200 ms |
| Center well | Empties, then thinker chip scales in `0.92 → 1` | 180 ms (delayed 80 ms) |
| Sub-status line | Fades in below thinker | 200 ms (delayed 200 ms) |
| Attach icon | Morphs 📎 → ⏸ | 200 ms |
| Go-to-tab CTA | Slides in from right edge | 200 ms (delayed 120 ms) |
| Left stripe | Neutral → Info-400 (gentle pulse) | 280 ms |

**Total:** ~440 ms. Bar width animates from 760 → 820 px.

### In Progress → Output (trigger: terminal state)

| Element | Behavior | Timing |
|---|---|---|
| Seek mark | Heartbeat completes, holds 80 ms, then squash-stretch celebration | 480 ms |
| Thinker chip | Loader → check mark, label `"Step 3 of 5"` → `"Done"` | 320 ms morph |
| Sub-status | Rotates one last time to `"Add a follow-up task"` (italic) | 240 ms |
| Stripe | Info → Success-500 | 280 ms |
| Pause | Morphs back ⏸ → 📎 | 200 ms |
| Go-to-tab | Label `"Go to tab"` → `"Open in Seek"`, icon swap | 200 ms |
| Re-run + Summary | Slide in from right | 200 ms (delayed 80 ms) |
| Send / Stop | Morphs back ◼ → ↑ (disabled) | 200 ms |

**Total:** ~480 ms. Bar width animates from 820 → 900 px.

### Output → Input (the loop closes)

Three routes back:

**Route A — User starts typing (most engaging):**
- First keystroke triggers output content fade-out (160 ms)
- A small **context pill** appears at top-left of the text area: `↩ Following up on "Refund overcharge"` (auto-attaches prior task context to the new prompt)
- Text area expands
- Truncated task pill **slides left + shrinks** into the My-tasks accordion pill — the user literally sees the task "going home"
- Mode pill slides back in from the right (220 ms, delayed 120 ms)

**Route B — Dismiss × (instant):**
- Same as above, no context pill. 140 ms total.

**Route C — Auto-decay (6 s of no interaction, default):**
- Output fades, task slides home, mode pill returns
- Stopped state has 12-second decay; Needs-you never decays

The "task slides home into My-tasks" is the signature micro-interaction — gives the bar a sense of memory and creates a brief count-badge pulse when the task lands in Recent.

---

## 6. Multi-task model

The bar reflects **one focused task at a time**. Other running tasks are accessible through the My-tasks accordion.

### Starting a second task while one runs

1. User clicks `+ Start a new task` in the accordion (or `⌘N` shortcut)
2. The current task collapses to a small chip with mini-spinner on the far left (next to the Seek mark)
3. The composer opens fresh in the center
4. User sends → new task starts as the focused one; the old task's chip persists as peripheral indicator
5. Click any chip (or accordion row) to swap focus

### Focus rules

- **Needs-you steals focus** automatically (with a fire-stripe pulse), regardless of what's currently focused
- Override with shift+pin: pins the current focus, prevents auto-steal
- Up to 7 concurrent tasks per session (matches floating-panel spec)

---

## 7. Browser vs Desktop mode

The mode pill (visible only in Input phase) determines where Seek actually runs:

| Mode | Behavior | Bar appearance |
|---|---|---|
| **Browser** | Seek opens a tab group in your browser and drives that | `Go to tab` CTA in In Progress |
| **Desktop** | After 3-use safety modal, Seek takes over mouse + keyboard. Bar floats above the OS as always-on-top overlay | `Watching desktop` label replaces `Go to tab` |

The bar's appearance and state machine are identical in both modes — only the sub-label and one CTA differ. This keeps the user's mental model unified.

---

## 8. The accordion (My tasks popover)

When user clicks `My tasks ▾` (input phase) or the truncated task pill (in-progress / output):

```
┌──────────────────────────────────────────┐
│  + Start a new task                       │  ← always pinned top
├──────────────────────────────────────────┤
│  RUNNING                              2  │
│  ⟳  Refund overcharge        Thinking    │
│  ❗  Triage VIP tickets       Needs you   │
├──────────────────────────────────────────┤
│  RECENT                                  │
│  ✓  Export pipeline report     1m 24s    │
│  ✓  Add 3 users to Okta          52s    │
│  ✕  Send Q4 renewal reminders  Stopped   │
├──────────────────────────────────────────┤
│  BOOKMARKS                               │
│  ☆  Weekly Pipeline Review               │
│  ☆  Daily Stripe Reconciliation          │
└──────────────────────────────────────────┘
```

- Popover slides up from above the bar with 220 ms ease-out-quart
- Dismisses on click outside or `Esc`
- 360 px wide, dark surface matching the bar
- Each row shows: status dot, task name (truncated), meta (state or duration)

---

## 9. Resolved decisions

These were aligned on during ideation; recording them here so the build has a single source of truth.

1. **Sub-status cadence:** real Seek activity with a "still working…" filler if no new event in 5 s. Avoids appearing frozen.
2. **Output dwell times:**
   - Completed: 6 s
   - Stopped: 12 s (gives time to read the stop reason)
   - Needs-you: no auto-decay
3. **Follow-up context auto-attach:** typing during Output auto-attaches the prior task's context to the new prompt. The context pill makes this visible. So "now do the same for invoice INV-08214" works without the user re-explaining.
4. **`+ Start a new task` location:** top of the accordion (always pinned), not a separate button. Keeps the bar clean.
5. **"Open in Seek" target:** expands the bar upward into a popover with activity log + recording + decisions. The Workspace/Panel becomes optional — the bar paradigm stays primary.
6. **Mode pill returns:** only when the bar is fully back to Input phase (after task slides home). Keeps Output focused on outcome.
7. **Truncated task pill hover:** tooltip with the full prompt; click expands into the accordion.

---

## 10. Open questions (still to decide)

These are the high-leverage choices we haven't locked yet:

1. **Bar drag-ability** — pinned to bottom-center always? Or shift-drag to reposition? Raycast-style?
2. **Heartbeat tempo** — 760 ms is "active human heart rate." Faster (560 ms) reads urgent, slower (1100 ms) meditative. Need user testing.
3. **First-launch "hello" wave** — should the Seek mark do a more expressive one-shot cascade on first run to invite the first prompt?
4. **Completed → Idle merge** — currently 480 ms celebration then smooth ease into idle breath. Should there be a brief hold (~200 ms) at scale 1.00 in between to mark the moment more clearly?
5. **Stopped's color floor** — desaturating 65% keeps brand recognizable but mutes it. Going further (75%+) makes stopped feel more dramatic. Where on that emotional scale?
6. **Compact mode** — should the bar shrink to ~280 px when no task is running and the user isn't focused on it (becoming more dock-icon-like)? Or stay full-width always?

---

## 11. Build notes

The prototype (`Seek-Bar.html`) is a single-file static HTML build:
- **Tokens:** Navi color palette inline
- **Logo:** the 7-path orange SVG from `Seek-Panel.html`
- **Animations:** CSS keyframes only (no JS animation libraries). Each state has its own keyframe + easing.
- **Per-block cascade for Thinking:** uses `nth-child(N)` on the SVG paths with staggered `animation-delay`
- **Dev cycler** at top of screen lets stakeholders click through phases + states without running a real task
- **Send → fake run** sequence: triggers In Progress (3.5 s thinking → 9 s taking action → completed → 6 s decay → idle)
- **Sub-status rotation:** every 3.4 s, only when state is `thinking` or `taking-action`

### What's stubbed vs real

| Real | Stubbed |
|---|---|
| State machine for the bar | Actual Seek backend / task execution |
| All animations on the Seek mark | Real activity tracking that drives sub-status |
| Phase transitions | Document attach / flow attach modals |
| Accordion popover with sample data | Persistent state across reloads |
| Mode pill popover with description | Mode-specific behavior (browser tab open / desktop takeover) |
| Dev cycler for stakeholder demo | Real task data |

### Hooks where Seek-Bar.html overlaps with Seek-Panel.html and Seek-Workspace.html

- **Color tokens** — identical Navi palette
- **State semantics** — same 4 states (Thinking / Paused / Stopped / Completed) plus this iteration adds "Taking action" as distinct from "Thinking", and "Needs you" as its own state
- **The Seek logo SVG** — bytewise identical to Panel + Workspace
- **Stop-reason library** — would reuse the same content from `Floating-Experience-Improvements.md` §12
- **Multi-task model** — same rules as Panel (1 focused, ≤7 concurrent, Needs-you steals focus)

---

*Owner: Seek design team. Built against `Seek-Bar.html`. Last updated 2026-05-26.*
