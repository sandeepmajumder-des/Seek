# Floating Experience: Improvements & Spec

This document captures the next set of design and behavior changes for the **Floating Companion Panel** option of Whatfix Seek. It is the source of truth for what to build next on `Seek-Panel.html`.

The panel ships with two width modes:
- **Default** 400 px wide
- **Expanded** 940 px wide, with the dark left task drawer in view

All changes below apply to both modes unless explicitly noted.

---

## 1. Task initiation

A task can be started in three ways. All three flow into the **same composer** at the bottom of the panel and produce the **same downstream experience**.

### 1.1 Entry points

1. **Type a prompt manually**
   The user clicks the composer textarea and types free-form. Send action: arrow button on the right, or `⌘↵`.

2. **Attach a document**
   Click the paperclip icon (left of the composer textarea). The attach menu opens. Pick **Upload document**. A file picker takes over. The selected document becomes an inline attachment chip in the composer.

3. **Choose a Whatfix Flow**
   Click the paperclip icon. Pick **Attach Whatfix Flow**. A list modal opens (port the **Flow Picker** modal pattern from the full-screen build, see `Seek-Desktop-Phase-1.html`, lines 905 to 940 for the modal markup and behavior). Search, filter (`All`, `Recent`, `Mine`), select a flow, click **Attach**. The flow becomes a chip in the composer.

4. **Pick a saved prompt**
   Paperclip menu also has **From Prompt Library** (third item, below a divider). Opens the same library experience from the full-screen build's Phase 6, but rendered as a modal sized to the panel.

The attach menu order is fixed:
```
Upload document
Attach Whatfix Flow
─────────────────────────
From Prompt Library
```

### 1.2 Prompt prefilling with inline controls

When a flow or prompt-library item is attached, the composer textarea is **prefilled with a template prompt that contains inline categorical chips** the user can configure before sending.

Reference: `Seek-Desktop-Phase-1.html` lines 1095 to 1310. Reuse:
- `FLOW_CHIPS` config (per-flow chip definitions: `records`, `target`, `guardrails`, `output`, etc.)
- `PROMPT_TEMPLATES` (per-flow templates with `{chip:key}` placeholders)
- The chip popover that lets the user pick from predefined options or write something custom
- The "Customize" flow hint with app + step count + estimated duration

Inside the panel, the chip system stays identical to the workspace version, just scoped to the panel's narrower width. Chips wrap onto multiple lines if the prompt is long.

The **Send arrow** stays disabled until every chip is filled (or the textarea has free-form text if no flow is attached).

---

## 2. Active task lifecycle

When the user hits Send, **two surfaces wake up in parallel**.

### 2.1 The Mini Seek surface (where Seek actually runs)

Seek begins executing the task on the selected mode:
- **Browser mode**: opens a Seek-AI tab group, executes there. The mini-bar inside that tab acts as the in-browser presence.
- **Desktop mode**: takes over the user's mouse and keyboard (only after the safety education modal, first 3 uses). The mini bar floats above the macOS Dock.

This surface is **outside** the floating panel. The panel is the user's status view; the mini surface is where the actual driving happens.

### 2.2 The Activity surface (inside the Seek panel)

The moment the user hits Send, the active view in the panel updates with:
1. The **user message** (the prompt with filled chips) appears in a right-aligned blue bubble.
2. An **Activity** accordion appears immediately below the user message. **Collapsed by default.**
3. The **sticky thinking bar** above the composer flips to its in-progress state (see Section 4).

---

## 3. The Activity component

Activity is the surface that shows what Seek is currently doing, granular step by step. It is **not** the conversation. It is the working log.

### 3.1 Anatomy

- Accordion header labelled **Activity**
- Chevron-down indicator that rotates when expanded
- Collapsed by default
- When expanded: bullet list of timestamped reasoning and action lines (verifying inputs, taking screenshots, confirming entities, applying categories, etc.)
- Screenshot rectangles appear inline as small thumbnails next to "Taking screenshot" rows

### 3.2 When Activity appears (and when it doesn't)

Activity rendering is **state-aware**:

- **While the task is still executing** and Seek produces a reply: the next item in the conversation thread carries its own Activity accordion. Each Seek reply during execution can have one.
- **If the task pauses** (for any reason: permission denied, server timeout, lost connection, login challenge, guard-rail tripped, user-triggered pause): the next item in the chat **does not** carry an Activity. The pause surfaces in the sticky thinking bar instead, with the appropriate state.
- **If the task is stopped**: the next item does not carry an Activity. The stop reason appears in the thinking bar.
- **If the task is completed**: the next item is not an Activity; it is a **completion summary** (see Section 5).

This rule preserves the discipline that Activity = "I am currently thinking and acting". Anything else has its own affordance.

---

## 4. The sticky thinking bar (four states)

The bar sits above the composer with a 16 px gap. It does **not** scroll with the chat. It has a transparent background and a Secondary-300 border only (already implemented).

The bar reflects a single state at a time. Each state has its own chip color, label, right-side controls, and a **milestones accordion chevron sitting beside the state label** (see Section 6).

### State 1: Thinking
- **Chip**: blue chip (Info-100 background, Info-500 text), spinner on the left, label `Thinking`, chevron beside the label
- **Right controls**: `Go to tab` (tertiary text) and `Pause` (outlined button with pause icon)

### State 2: Paused
- **Chip**: yellow chip (Warn-50 background, Warn-700 text), label `Paused`, chevron beside the label
- **Right controls**: `Go to tab` and `Resume` (outlined button with play icon)

### State 3: Stopped
- **Chip**: red-tinted chip (Danger-50 background, Danger-700 text), label `Task stopped`, chevron beside the label
- **Right side**: no CTAs. Instead, a single line of plain text describing **why Seek stopped**. Examples:
  - "Lost connection to Salesforce."
  - "Stopped by you at 0:54."
  - "Approval required from your manager."

### State 4: Completed
- **Chip**: green chip (Success-50 background, Success-700 text), label `Task completed successfully`, chevron beside the label
- **Right side**: no CTAs. The completion summary card (Section 5) appears as the next chat item.

The bar is **always present** while a task is active or recently completed. It is the user's single, fixed read of "where things stand right now". Clicking the chevron in any of the four states expands the bar **upward** to reveal the milestones plan (Section 6). The chip row, CTAs, and stop-reason text always remain at the bottom of the bar.

---

## 5. Completed task summary

When a task finishes, the next chat item is a **completion summary card**, written for a non-technical user. The goal: the user can read this in 10 seconds and know what happened.

### 5.1 What the summary contains

Plain language, never technical jargon:

1. **One-line outcome.** `Your purchase requisition for the Dell Latitude 7440 was submitted for approval.`
2. **Was it successful?** Yes / Yes with deviations / No. If deviations: one line describing what changed and why. Example: `Seek paused once on the high-value record ($112,400) and waited for your approval before continuing.`
3. **Key steps Seek took.** Bullet list of 3 to 5 milestones, action-oriented language. Example:
   - Verified cost center CC-1045
   - Confirmed legal entity USMF
   - Attached business justification document
   - Submitted for approval to finance manager
4. **What happens next.** One line, optional. Example: `You'll be notified when finance reviews it.`

No long paragraphs. No internal Seek reasoning. No raw error codes.

### 5.2 Decision trace links

Below the summary, two affordances:

- **Download decision trace (PDF)**: a button that triggers an immediate file download. The PDF includes the full step-by-step trace with screenshots, timing, and decisions, intended for compliance or sharing.
- **Open decision trace in Insights**: a text link that routes the user to the L2 decision trail view inside the panel's Insights surface. This is the rich, interactive trail (flowchart + per-step recording).

Both links sit in a single row, separated by a vertical divider or just spacing, with the PDF download as the heavier affordance.

### 5.3 Feedback and bookmark

To the right of the summary card (or directly below, depending on width):

- **Thumbs up** icon button: "This task ran well." Single click. Confirms with a subtle toast.
- **Thumbs down** icon button: "Something was off." Opens an inline one-line feedback input ("What went wrong?") with a submit affordance.
- **Bookmark** icon button: saves the task to the user's bookmarked list, accessible from the Insights view.

All three are icon-only with title tooltips. They are restrained, not loud; success affordances should not compete with the summary itself.

---

## 6. Milestones (fused into the thinking bar)

Milestones are **not** a separate block. They live **inside the sticky thinking bar**, accessed via an accordion control placed beside the status text. While Activity is the running log of micro-steps, **Milestones is the plan** that Seek is executing.

### 6.1 Anatomy

The thinking bar has three persistent slots, left to right:

1. **Status chip + accordion control** (left)
2. **Inline CTAs** (right, for Thinking and Paused states only)
3. **Milestones expansion** (above the chip + CTAs row, only when the accordion is open)

A small chevron sits **beside** the state label (Thinking / Paused / Task stopped / Task completed successfully). Click the chevron, or click the label, to expand the bar upward.

**Collapsed state** (default):
```
┌─────────────────────────────────────┐
│ ● Thinking  ▾        Go to tab Pause│
└─────────────────────────────────────┘
```

**Expanded state**:
```
┌─────────────────────────────────────┐
│ Milestones                          │
│ ✓ Read and validate request         │
│ ✓ Verify cost center                │
│ → Attach justification document     │  ← current milestone
│ ○ Submit for approval               │
│ ○ Notify finance                    │
├─────────────────────────────────────┤
│ ● Thinking  ▴        Go to tab Pause│  ← chevron flipped
└─────────────────────────────────────┘
```

The status chip row **always stays at the bottom**. The milestones list grows upward from it. This holds across all four states:

- **Thinking** (blue chip): bar bottom has blue chip + chevron + `Go to tab` + `Pause`. Milestones expand above.
- **Paused** (yellow chip): bar bottom has yellow chip + chevron + `Go to tab` + `Resume`. Milestones expand above.
- **Task stopped** (red chip): bar bottom has red chip + chevron + the one-line stop reason. No CTAs (per Section 4). Milestones still expand above.
- **Task completed successfully** (green chip): bar bottom has green chip + chevron only, no CTAs. Milestones expand above, all items strike-through with grey ticks.

### 6.2 Completion treatment for individual milestones

When a milestone is completed:
- Text gets **strike-through**.
- A **tick mark** appears next to it. The tick is **grey** (Secondary-500), **not** green. This keeps the milestone list calm. Stacking green ticks on green ticks would compete with the completion-summary card that arrives in the chat once the task finishes.

The current (in-progress) milestone gets a small **arrow glyph** (`→`) instead of an empty circle, plus a single subtle ink-emphasis weight (Secondary-900) on the text to signal "here is where Seek is right now".

Queued milestones get an empty circle and Secondary-600 text.

### 6.3 Plan updates mid-run

If Seek revises the plan mid-execution (adds, removes, or reorders a milestone), the change is reflected immediately in the milestones list.

A small **revision indicator** appears to the **right of the milestone text** inside the expanded thinking bar, formatted as `<n/N>`:

- `N` = total number of plan revisions made so far (revision 1 is the initial plan; not surfaced)
- `n` = the revision that produced the current state of *this* milestone

So a milestone added or last-changed in revision 2 of a 2-revision plan shows `<2/2>`. A milestone that survived through 3 revisions, last changed in revision 3, shows `<3/3>`. A milestone untouched since the original plan (revision 1) shows nothing.

Styling: 10 px, Secondary-500 ink, light angle brackets. Right-aligned, with a small left padding from the milestone text.

Hovering the indicator reveals a small tooltip with the change summary (e.g. "Reordered after Cost-Center check failed" or "Added: Confirm legal entity"). The tooltip is one short sentence; no expanded history view.

If the bar is currently collapsed when the plan is revised, the chevron pulses once (a 240 ms ease-out scale 1 → 1.08 → 1) to invite the user to expand and see what changed.

This keeps the lightweight audit signal visible inline, without requiring a separate revision-history view.

### 6.4 Layout rules

- The bar is **always pinned** above the composer with a 16 px gap.
- The bar has a **transparent background** and a **Secondary-300 border**. No fill (per the earlier change to the progress card).
- When the accordion is open, the bar grows in height upward, **not downward**. The composer position stays fixed; the chat area above shrinks proportionally.
- Maximum expanded height: roughly half the panel's body height. If the milestones list exceeds that, the milestones region inside the bar gets its own internal scroll (scrollbar styled to match the body's thin grey thumb).
- Activity log lives in the chat scroll area above the bar; the milestones expansion **never overlaps** the activity. Visually, expanding milestones pushes the activity up.

### 6.5 Why fused, not separate

Two components stacked above the composer (separate thinking bar + separate milestones block, as originally specced) created an over-furnished bottom dock. Folding milestones into the bar yields:
- **Single calm fixture** when the user just wants status: chip + CTAs, one strip.
- **Single rich fixture** when the user wants the plan: chip + CTAs at the bottom, plan above, still one cohesive block.
- The user's eye lands on the status (always visible), then can drill into the plan with one click without leaving the status context.

---

## 7. Notifications

A platform-level (macOS / Windows / Linux) notification fires on three terminal events:

1. **Task completed**
   `Seek finished updating the Dell Latitude requisition.`

2. **Task stopped** (by user, by guard rail, or because Seek could not proceed)
   `Seek stopped: lost connection to Salesforce.`

3. **Seek ran into an error**
   `Seek hit an error on the Dell Latitude requisition.`

Clicking the notification:
- Brings the Seek panel back into focus (raises the panel app)
- Sets the panel's view to the task in question (active view if running-recent, detail view if completed)
- If the panel is closed, opens it

Implementation note: notifications should use the native OS notification API (via the Seek desktop wrapper). For the prototype, simulate with an in-window toast.

---

## 8. Critical scenarios

### Scenario 1: Returning user with a stale chat

The user completed a task a few days ago. They open the panel and the chat area still shows that old task's history. Now they want to start something new in the same panel.

**Behavior**:
- The composer accepts the new prompt as normal. Send works.
- On send, a **task-boundary divider** is inserted into the chat at the moment of the new task's first user message. The divider reads: a thin horizontal rule with a small centered label: `New task · just now` (or the relative time). Style: 1 px Secondary-200, centered text in Secondary-500, 11 px regular.
- The previous task's content (user message, activity, milestones, summary card) remains above the divider, fully scrolled out of the immediate view.
- The sticky thinking bar resets to the new task's status. The milestones component swaps to the new task's plan.
- The new task is now the **active scope**. Pause, Go to tab, and Stop all operate on the new task only.

This applies whether the previous task was completed, stopped, or paused-then-forgotten.

### Scenario 2: Seek-initiated multi-task (one prompt, parallel sub-tasks)

Multi-task in the panel is **not user-led**. The user gives a single prompt. Seek decides, based on the work, that fanning out into multiple parallel sub-tasks will complete it faster (e.g. updating 30 Salesforce records in parallel batches, triaging tickets across three Zendesk queues at once). Seek splits the work itself.

The chat space accommodates this in one place. There is still only one user message at the top; under it, Seek's response is structured as a **tab strip** representing each parallel sub-task.

#### Tab strip at the top of the chat container (Chrome-style)

The tab strip sits at the **very top of the chat container**, the same way Chrome browser tabs sit at the top of a window. The tabs **own** the chat body below; switching tabs swaps **everything** that lives inside the chat container.

```
┌──────────────────────────────────────────────────────────┐
│ │● Primary · all batches│ │● Batch 2│ │● Batch 3│        │  ← Chrome-style tabs
├──╯                       ╰─────────╯ ╰─────────╯─────────│
│                                                          │
│ User: "Reconcile yesterday's Stripe payouts..."          │  ← user prompt (per tab)
│                                                          │
│ [Activity, milestones, summary for the selected tab]     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Visual treatment, matching Chrome:
- Tabs have rounded top corners; the **active tab** is connected to the chat body below (no bottom border separating it from the content area) so it reads as the "front" surface.
- **Inactive tabs** sit slightly recessed: a subtle background tint, no connection to the body, and a soft separator at the bottom of the strip.
- The strip is flush with the top edge of the chat container. Nothing sits above it inside the chat area.

Switching tabs swaps the full body content:
- The user prompt block (shown once per tab, as the first item in the body)
- Activity log
- Milestones (and its fused thinking-bar expansion at the bottom of the panel)
- Summary card (when the sub-task completes)

The sticky thinking bar at the bottom of the panel always reflects the **currently focused tab's** status. Switch tabs, the bar swaps too.

All tabs belong to the **same parent task** (one user prompt, one history entry). No task-boundary divider is inserted between them because they are not separate tasks. They are facets of one task that Seek chose to parallelise.

#### Primary versus secondary tabs

The **first tab is always Primary**. It carries a visible demarcation so the user can spot it at a glance:

- A small `Primary` label or visual treatment (bolder weight, an underline accent, or a leading dot) on the first tab.
- The other tabs are **Secondary**: same shape, less emphasised, no Primary label.

The Primary tab's content is **different in kind** from the secondary tabs:

- **Primary tab body**: the **combined summary** across all sub-tasks. One unified Activity feed (merged events, marked with which sub-task each event came from), one unified Milestones list ("Batch 1 of 3 done", "Batch 2 in progress", "Batch 3 queued"), and on completion one unified summary card that rolls up the whole job ("All 30 records updated across 3 batches in 2m 14s. 1 record paused for review, approved").
- **Secondary tab bodies**: each shows the **individual sub-task's own** Activity, Milestones, and summary card. Self-contained. Reading Batch 2's tab tells you only what happened to those 10 records, not the full job.

This means the user has two ways to read a multi-task run:
- "Just tell me how the whole thing went" → Primary tab
- "What happened to this specific batch?" → Secondary tab N

#### Sticky thinking bar in multi-task runs

The sticky thinking bar reflects the **selected tab's** status. Switch to Batch 2, the bar shows Batch 2's state. Switch to Primary, the bar shows the aggregated state (rolling chip color, e.g. Thinking if any sub-task is still running, Completed only once all are done, Paused if any is paused, Stopped if any failed terminally).

Milestones in the expanded bar follow the same rule: Primary tab shows the rolled-up milestones for the whole job; secondary tabs show their own.

#### History treatment

In the Recent list (left panel drawer / sidebar), a multi-task run shows as **a single entry** with the user's task name, plus a small chip indicating the fan-out count:

```
Reconcile Q4 payouts      +2     ← +2 means: this single task fanned out into 3 sub-tasks
```

Clicking the history entry opens the panel with the same tab strip restored, Primary tab selected by default. The summary view in detail mode also opens on the Primary tab unless the user explicitly switches.

The `+N` chip is restrained: same visual treatment as the count badge on My Tasks ("Running 3"). Small, light grey, no orange or blue colouring.

#### Why this matters

Treating multi-task as one task with internal parallelism (rather than as separate tasks the user managed) is correct because:

- The user didn't ask for parallelism. They asked for an outcome. Seek made the parallelism decision; the model should keep that under one task name from the user's perspective.
- History stays clean. One prompt produces one history entry, not three.
- The Primary tab gives the user the answer they want first ("did it work?"), with the per-batch detail available without forcing it.

The left-panel drawer's running task list does **not** show each sub-task separately. It shows the parent task with the same `+N` chip. Clicking it opens the panel onto that task's tab strip.

---

## 9. Build order recommendation

If we are picking up these changes incrementally, this is the order that maximises early-validation:

1. **Attach modal + flow picker integration** (Section 1.3, 1.4): unlocks the second most common entry point and proves the prefill-with-chips flow inside the panel width.
2. **Sticky thinking bar with all 4 states** (Section 4): single, persistent, tells the user where they stand.
3. **Milestones accordion** (Section 6): the plan-and-progress block.
4. **Activity rules** (Section 3.2): conditional rendering based on task state.
5. **Completion summary card with feedback + bookmark** (Section 5): the "I trust this" moment.
6. **Decision trace links and PDF download** (Section 5.2): compliance and shareability.
7. **Notifications** (Section 7): cross-context reliability.
8. **Multi-task and task-boundary divider** (Section 8): proves the system holds up as usage scales.

Each step is shippable independently and reviewable on its own.

---

## 10. Resolved decisions

The previously-open questions have been resolved. Each entry below states the decision and the rationale.

### 10.1 Bookmark surface

**Decision**: Bookmarked tasks live in a dedicated **Bookmarks** section inside the left panel drawer, sitting alongside `Running` and `Recent`. They are also reachable inline from the composer via the `/bookmark` slash command (see Section 11).

### 10.2 Decision trace PDF

**Decision**: Generated **lazily on first download click**, not on task completion. The trace data is captured during the run; PDF assembly only happens when the user actually requests it. Subsequent downloads of the same trace reuse the cached PDF.

Rationale: most tasks never have their trace downloaded. Eager generation wastes server capacity. Lazy generation keeps the trace-data pipeline cheap and the download experience identical for the user (the spinner is shown for the few seconds during first generation).

### 10.3 Plan revision history

**Decision**: When Seek revises the milestone plan mid-run, surface the revision as a small **version indicator** to the **right of the milestone text**, inside the expanded thinking bar.

Format: `<n/N>` where `N` is the total number of revisions made so far and `n` is the revision that produced the current state of this milestone. So a milestone that survived through 2 plan revisions shows `<2/2>`. A milestone added in revision 2 also shows `<2/2>`. A milestone that's been untouched since the initial plan shows nothing (revision 1 is the default plan, not surfaced).

The indicator uses Secondary-500 ink, 10 px, with light angle brackets so it stays out of the way visually but is scannable. Hovering the indicator reveals a small tooltip with the change summary ("Reordered after Cost-Center check failed").

This avoids a separate "revision history" view and bakes the lightweight audit signal directly into the milestone row.

### 10.4 Multi-task limit

**Decision**: There is **no multi-task within a single Seek session**. One session runs one parent task at a time (with Seek's own internal sub-task parallelism allowed under Section 8 Scenario 2 — that is a single parent task with tabs, not multiple separate tasks).

Across **different Seek sessions**, a user can run up to **7 concurrent sessions**. Each session is independent: its own panel state, its own task, its own sticky thinking bar.

While a task is running inside a session, the user **can queue follow-up inputs** for that same task (the 7-item queue pattern from the previous build, see `Seek-Desktop-Phase-1-Working.html`). The queue is per-task, not per-session.

So the rules are:
- 1 active task per session
- Up to 7 sessions concurrently across the workspace
- Up to 7 queued follow-up inputs per active task

This collapses the previously-tangled "multi-task in one chat" question. The chat scope is always one task; parallelism happens above (multiple sessions) or below (Seek's internal sub-task tabs).

### 10.5 Stop reason copy

**Decision**: A dedicated **stop reason copy library**, owned by Seek's content design team, maps internal error/stop codes to user-facing strings. See Section 12 for the library shape and example entries.

---

## 11. Slash commands in the composer

Two slash commands are first-class affordances inside the composer. They open inline floating list modals so the user never leaves the input zone.

### 11.1 `/bookmark`

When the user types `/bookmark` at the start of the composer, a floating list modal appears **anchored above the composer**, listing all bookmarked tasks from the user's library.

- Modal width matches the composer (panel-width minus its padding)
- Search: typing more characters after `/bookmark ` filters the list live
- Each row: bookmark title, source app glyph (SF, ZD, etc.), the chip configuration the bookmark was saved with, a small "Run" button
- Click a row → the bookmark's prompt + chip values load into the composer, ready to send (or to edit)
- `Esc` or click-outside dismisses

### 11.2 `/prompt`

Same affordance, different source. Types `/prompt` → floating list modal of all saved prompt templates from the user's Prompt Library.

- Same modal shell as `/bookmark`
- Each row: prompt name, tags, author, "uses" count
- Click a row → template + chip placeholders load into the composer
- User configures chips and sends

These two commands share a single floating-list-modal component. The component takes a data source + row template; behavior is identical.

### 11.3 Saving / templating a prompt

A user can save the prompt currently in the composer as a reusable template at two moments:

1. **Inline, during composition** ([Save as prompt] icon in the composer's overflow menu, sitting alongside the paperclip and mode pill). Opens a small modal: name, optional description, sharing (Private / Team), save. The current chip configuration is captured so future invocations preload the values.

2. **Post-completion, from the summary card** (a fourth icon next to thumbs-up / thumbs-down / bookmark, labelled `Save as prompt`). Captures the *successful* run as a reusable template. This is the high-trust save moment: if it worked once, the user knows it can work again.

Saved prompts:
- Appear in `/prompt` results
- Appear in the Prompt Library page
- Carry their original chip configuration as defaults
- Can be edited later (rename, change description, change sharing)

### 11.4 Modal interaction details

The slash-command modal has its own dismiss keys:
- `Esc` closes
- Click outside the modal closes
- Picking a row closes and fills the composer
- Arrow-up / arrow-down navigate rows; `Enter` selects

Visually, the modal:
- Anchored above the composer, with a 4 px gap
- Light surface (matches the composer body), 1 px Secondary-200 border, 8 px border radius
- 12 px shadow below to lift it off the body gradient
- Max 6 rows visible, scrolls internally beyond that
- A small footer row inside the modal shows `↑↓ navigate · ↵ select · esc close` in 10 px muted ink

---

## 12. Stop reason copy library

A single keyed library, owned by content design and reviewed quarterly. Maps internal stop / error codes to user-facing copy. Surfaces inside the **State 3: Stopped** treatment of the sticky thinking bar (Section 4) where no CTAs appear and the stop reason is shown as plain text below the chip.

### 12.1 Library shape

Each entry is a record with these fields:

```
{
  code:        "AUTH_EXPIRED",            // internal identifier; engineers map to this
  line:        "Lost connection to your account.",
                                          // user-facing one-liner. May contain {variables}.
  suggestion:  "Sign back in to continue.",
                                          // optional next-step nudge. One short sentence.
  severity:    "soft",                    // soft = retryable, hard = needs manual intervention
  variables:   ["app"]                    // declares which runtime values can be interpolated
}
```

Variables are interpolated from runtime data using `{name}` placeholders. Example: `"{app} isn't responding right now."` → `"Salesforce isn't responding right now."`

### 12.2 Categories and a starter set

A non-exhaustive starter set, grouped:

**Connection issues**
```
NETWORK_LOST       → "Lost your internet connection." (soft)
                     "Reconnect to continue. Seek will pick up where it left off."
SERVER_UNAVAILABLE → "{app} isn't responding right now." (hard)
                     "Try again in a few minutes."
TIMEOUT            → "{app} took too long to respond." (soft)
                     "Try again. If it keeps happening, check {app}'s status page."
```

**Auth and permission issues**
```
AUTH_EXPIRED       → "Lost connection to your {app} account." (soft)
                     "Sign back in to continue."
PERMISSION_DENIED  → "You don't have permission to do that in {app}." (hard)
                     "Ask an admin for access, then re-run."
MFA_REQUIRED       → "{app} is asking you to verify it's you." (soft)
                     "Approve the sign-in on your phone, then resume."
```

**Guard-rail trips** (user-set safety rules)
```
GUARD_HIGH_VALUE   → "Paused on a high-value record (${amount})." (soft)
                     "Approve to continue, or stop the task."
GUARD_LIMIT_REACHED→ "Reached your {limit_kind} guard rail of {limit_value}." (soft)
                     "Adjust the rail or stop the task."
GUARD_MISSING_DATA → "Missing required data in record {record_id}." (soft)
                     "Fill it in {app} and resume, or stop the task."
```

**User-initiated stops**
```
USER_STOPPED       → "Stopped by you at {time}." (soft)
                     null
USER_DECLINED      → "You declined the approval." (soft)
                     null
```

**App-specific** (extended per integration; each entry references the app)
```
SF_API_LIMIT       → "Salesforce hit its hourly API limit." (hard)
                     "Try again after {reset_time}."
ZD_TICKET_LOCKED   → "This Zendesk ticket is locked by another agent." (soft)
                     "Skip it or try again in a moment."
STRIPE_REFUND_FAIL → "Stripe couldn't process the refund: {reason}." (hard)
                     "Check the payment method, then re-run."
```

### 12.3 Style rules for new entries

When adding a new stop reason to the library:

- **One sentence max for the line.** No multi-clauses, no compound subjects.
- **No raw error codes** in user-facing text. Map internal codes to plain language.
- **Always second person.** "You" not "the user".
- **Suggestion (if provided) is one short sentence.** Cut "consider" and "try X or Y or Z" phrasing.
- **Hard severity** means the user must intervene before Seek can resume. **Soft severity** means the user can resume without changing anything (just retry, sign back in, approve, etc.).
- **App names are real.** "Salesforce", "Zendesk", "Stripe", not "the application" or "the integrated system".

### 12.4 Ownership and process

- The library is maintained in a versioned JSON file in the Seek monorepo (e.g. `seek-content/stop-reasons.json`).
- Content design owns the strings. Engineering owns the codes.
- New codes added by engineering require a content design review before they ship.
- The library is reviewed quarterly for clarity, completeness, and tone drift.

---

*Owner: Seek design team. Reviewed and built against `Seek-Panel.html`. Last updated 2026-05-26.*
