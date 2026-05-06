# Score Runner — Feature Specification

**Feature name:** Score Runner  
**Location:** Storyteller section → new "Score Runner" tab  
**Audience:** GM / Storyteller only  
**Persistence:** PocketBase (per-user, save and resume)  
**App context:** Blade's Edge (React + Vite + Tailwind + PocketBase)  
**Source documents:** Blades in the Dark Core Rulebook (Evil Hat, 2017); Blades '68 v0.9.5 (Evil Hat / Old Dog Games, 2026)

---

## 1. Purpose

Score Runner is an interactive GM assistant that guides the Storyteller through the full Blades in the Dark gameplay cycle — from choosing a score through planning, execution, and downtime — in a checklist-style flow with embedded dice rolling, live progress clocks, and a session recap. It replaces the need to flip between book pages mid-session.

There are two variant modes:
- **Core** — the three-phase cycle from the Blades in the Dark core rulebook
- **'68** — the four-phase cycle from Blades '68

The GM selects the mode when starting a new session. Mode selection is locked in for the life of that session (it cannot be switched mid-run).

---

## 2. Entry Point & Navigation

### Sidebar placement
Add a new tab to the existing `cat-storyteller` category in `DEFAULT_NAV`:

```js
{ id: "Score Runner", label: "Score Runner", icon: "FileText", hidden: false }
```

The tab renders the `<ScoreRunnerView />` component.

### Landing state
When the user opens Score Runner:
- If **no active session exists** → show the **New Session screen**
- If **an active session exists** (loaded from PocketBase) → resume directly at the current phase, showing the **Resume banner** at the top

---

## 3. Session Lifecycle

```
New Session → [choose mode] → [name the score] → Phase 1 → Phase 2 → ... → Recap → End Session
```

- A session is a single score + its downtime/aftermath
- "End Session" archives the recap and resets to the New Session screen
- A user can only have one active (non-archived) session at a time per PocketBase account
- Archived sessions are stored but not surfaced in the UI (future feature)

---

## 4. Data Model

### PocketBase Collection: `score_sessions`

| Field | Type | Notes |
|---|---|---|
| `id` | string | PocketBase auto-id |
| `user` | relation → users | owner |
| `mode` | enum: `"core" \| "68"` | locked at creation |
| `scoreName` | string | GM-named (e.g., "The Strangford Job") |
| `phase` | string | current phase key (see §5–6) |
| `planType` | string | assault/deception/stealth/occult/social/transport |
| `planDetail` | string | the specific detail the crew provided |
| `engagementRoll` | object | `{ modifiers: [...], dicePool: number, result: number }` |
| `clocks` | array | `[{ id, name, segments, filled, type }]` |
| `heat` | number | 0–9+ |
| `wantedLevel` | number | 0–4 |
| `rep` | number | rep earned this score |
| `coin` | number | coin earned this score |
| `heatModifiers` | object | flags for each heat modifier |
| `entanglement` | object | `{ rolled: bool, result: string, detail: string }` |
| `downtimeActivities` | array | per-PC activity log |
| `rollLog` | array | log of all dice rolls this session |
| `notes` | string | freeform GM notes (any phase) |
| `recap` | object | generated at end of session |
| `createdAt` | datetime | |
| `updatedAt` | datetime | auto-updated on save |
| `archived` | bool | false = active, true = past session |

Auto-save: debounced 2 seconds after any state change, write to PocketBase. Show a subtle "Saved" indicator in the header.

---

## 5. Core Mode — Three-Phase Cycle

```
[New Session] → FREE PLAY → SCORE → DOWNTIME → [Recap] → [End]
```

### Phase keys: `free_play` | `score_plan` | `score_engagement` | `score_active` | `downtime_payoff` | `downtime_heat` | `downtime_entanglements` | `downtime_activities` | `recap`

---

### Phase 0: New Session Screen

**Fields:**
- Mode toggle: **Core** / **'68** (pill toggle, same style as Generators tab)
- Score name: text input (e.g., "The Bellweather Break-In")
- Optional notes field: "What's the setup? Who's the client?"
- **[Begin Score]** button → creates PocketBase record, transitions to `free_play`

---

### Phase 1: Free Play

**Purpose:** Remind the GM what free play is for; let them take notes before the score starts.

**UI:**
- Phase header: "FREE PLAY" with a short description card:  
  *"Characters talk, gather info, establish contacts. When the crew is ready to commit to a score, move on."*
- Freeform **GM Notes** textarea (synced to `notes`)
- Checklist of optional free-play GM reminders (non-blocking, just checkboxes the GM can tick off):
  - [ ] Establish the fictional situation
  - [ ] Answer player questions about the target
  - [ ] Allow information gathering rolls if needed
  - [ ] Let players set the scene for their characters
- **[Move to Score Planning]** CTA button at bottom

**Dice available:** Fortune Roll (see §8.3) available as a floating action for any free-play rolls

---

### Phase 2: Score — Plan & Loadout (`score_plan`)

**Purpose:** Capture the crew's plan type and detail. This is the equivalent of "choose a plan" from p.127 of the core rulebook.

**UI sections:**

#### 2a. Choose a Plan Type
Six plan-type cards displayed in a 2×3 or 3×2 grid. Each card shows:
- Plan name (bold)
- Required detail label
- Short description

| Plan | Detail Needed |
|---|---|
| **Assault** | Point of attack |
| **Deception** | Method of deception |
| **Stealth** | Point of infiltration |
| **Occult** | Arcane method |
| **Social** | Social connection |
| **Transport** | Route & means |

Tapping a card selects it (highlighted border). The selected plan persists to `planType`.

#### 2b. The Detail
After selecting a plan, a text field appears:  
*"What is the [point of attack / method of deception / etc.]?"*  
GM types the detail; saved to `planDetail`.

#### 2c. Item Loadout Reminder
Non-interactive reminder card:  
*"Each player now chooses their load: Light (3), Normal (5), or Heavy (6). Remind them to select items — they cannot change load once the score begins."*

#### 2d. Notes
Freeform text field for any additional pre-score notes.

**[Roll Engagement →]** CTA → transitions to `score_engagement`

---

### Phase 3: Score — Engagement Roll (`score_engagement`)

**Purpose:** Roll the engagement roll (a fortune roll) to determine starting position. Interactive modifier checklist auto-builds the dice pool.

**UI:**

#### 3a. Engagement Roll Header
Title: "ENGAGEMENT ROLL"  
Subtitle: *"Start with 1d. Add or subtract for each factor below."*

#### 3b. Modifier Checklist
Each modifier is a toggle row with a +1d or −1d pill. Toggles are three-state: **inactive** (neutral), **+** (advantage), **−** (disadvantage).

| Modifier | +1d if... | −1d if... |
|---|---|---|
| **Plan boldness** | Operation is bold or daring | Plan is complex / contingent on many factors |
| **Target vulnerability** | Detail exposes a vulnerability / hits them where they're weak | Target is strongest against this approach / has special defenses |
| **Friends & contacts** | A friend/contact provides aid or insight | An enemy/rival is interfering |
| **Target Tier** | Target is lower Tier than crew | Target is higher Tier than crew |
| **Other factors** | Situational advantage (GM notes what it is) | Situational disadvantage |

Each +/− toggle adds or removes 1d from the pool. "Other factors" supports a freeform note field.

**Live dice pool display:**  
`Base: 1d` + modifier math = `TOTAL: Xd`  
If total goes below 1: display "Roll 2d, take lowest" warning.

#### 3c. The Roll
**[Roll Engagement]** button → opens the **Dice Roll Widget** (see §8.1) pre-loaded with the calculated pool, labeled "Engagement Roll (Fortune Roll)".

Roll result is interpreted and displayed:

| Result | Starting Position |
|---|---|
| 1–3 | **Desperate** — Cut to the score in a dire situation |
| 4–5 | **Risky** — Cut to the score with normal pressure |
| 6 | **Controlled** — Cut to the score with an advantage |
| Critical (6+6) | **Controlled + bonus** — Skip past the first obstacle, deeper into the action |

The interpreted position is displayed prominently with a color-coded badge:
- Desperate = red
- Risky = amber  
- Controlled = green

**GM prompt below result:**  
*"Describe the scene. Where are they? What's the first obstacle? What's the position?"*

Result is saved to `engagementRoll`.

**[Begin the Score →]** → transitions to `score_active`

---

### Phase 4: Score — Active (`score_active`)

**Purpose:** The score is underway. This is the open-ended play phase. The GM has access to: action rolls, resistance rolls, fortune rolls, the clock panel, and session notes.

**UI layout (stacked vertically on mobile):**

#### 4a. Score Status Bar
Persistent header strip showing:
- Score name
- Starting position badge (from engagement roll result)
- Phase label "SCORE IN PROGRESS"
- Auto-save indicator

#### 4b. Active Clocks Panel
Embedded clock panel (same `ClockSVG` component already in the app). Supports:
- **Add clock**: name + segment count (4/6/8) + type label (Obstacle / Danger / Racing / Mission / Faction)
- **Tick/untick** segment controls (+ / − buttons per clock)
- **Clock full alert**: when any clock fills, show a prominent red banner "CLOCK FULL: [name]" with a **[What Happens? ✨]** AI prompt button (same Gemini integration as existing ClockCard)
- Clock list persists to `session.clocks`

#### 4c. Roll Panel
A persistent floating or pinned section with three roll type buttons:

**[Action Roll]** → opens Action Roll Wizard (§8.2) — most-used roll  
**[Resistance Roll]** → opens Resistance Roll Widget (§8.4)  
**[Fortune Roll]** → opens Fortune Roll Widget (§8.3)  
**[Flashback]** → opens Flashback helper (§8.5)

All rolls are appended to `rollLog` for the recap.

#### 4d. GM Notes
Expandable freeform notes area, synced continuously.

#### 4e. Score Resolution
At the bottom of the score screen, two large buttons:

**[Score Succeeded]**  
**[Score Failed / Partial]**

Both transition to `downtime_payoff`. The resolution choice is saved to the session and surfaced in the recap.

---

### Phase 5: Downtime — Payoff (`downtime_payoff`)

**Purpose:** Calculate and record the crew's payoff from the score.

**UI:**

#### 5a. Rep
*"The crew earns 1 Rep per Tier of the target."*  
- Input: "Target Tier" (0–4 stepper)
- Toggle: "Operation kept completely quiet?" → if yes, Rep = 0
- Calculated rep displayed: **+X Rep**

#### 5b. Coin
Coin amount picker with descriptive labels:

| Coin | Description |
|---|---|
| 2 | Minor job; several full purses |
| 4 | Small job; a strongbox |
| 6 | Standard score; decent loot |
| 8 | Big score; serious loot |
| 10+ | Major score; a treasure trove |

Stepper to set the coin value. Optional notes field for "what was the loot?"

#### 5c. Tithe Reminder
*"Does the crew owe a tithe to a boss or larger organization?"*  
Toggle yes/no. If yes: show formula "Subtract [Tier + 1] coin as tithe."

Both rep and coin values saved to session.

**[Move to Heat →]**

---

### Phase 6: Downtime — Heat (`downtime_heat`)

**Purpose:** Tally heat from the score.

**UI:**

#### 6a. Base Heat
Selector with labeled options:

| Heat | Label |
|---|---|
| 0 | Smooth & quiet — low exposure |
| 2 | Contained — standard exposure |
| 4 | Loud & chaotic — high exposure |
| 6 | Wild — devastating exposure |

#### 6b. Heat Modifiers
Toggle checklist (each adds +1 or +2):

| Modifier | Amount |
|---|---|
| High-profile or well-connected target | +1 |
| Situation happened on hostile turf | +1 |
| Crew is at war with another faction | +1 |
| Killing was involved (crew or not) | +2 |

**Live heat total:** `Base + modifiers = X Heat`

#### 6c. Heat Tracker
Visual heat bar (0–9 cells, same dark aesthetic). As heat is added:
- Cells fill left-to-right
- At 9: **"Wanted Level gained! Heat resets."** banner appears; increment Wanted Level and reset heat (with overflow carrying over)

Wanted Level displayed as a 0–4 tracker with skull icons.

Current heat + wanted level saved to session.

**[Roll Entanglements →]**

---

### Phase 7: Downtime — Entanglements (`downtime_entanglements`)

**Purpose:** Determine what complication the crew faces based on heat and wanted level.

**UI:**

#### 7a. Roll Setup
*"Roll dice equal to the crew's Wanted Level. If Wanted Level is 0, roll 2d and keep the lowest."*

Display: "Current Wanted Level: X → Roll Xd"

**[Roll Entanglement]** → opens Fortune Roll Widget with pre-filled pool, labeled "Entanglement Roll."

#### 7b. Entanglement Table
After the roll, the result maps to a heat column × roll result lookup. Display the matching entanglement as a card:

**Low Heat (0–3) Entanglements:**

| Roll | Entanglement |
|---|---|
| 1–3 | Gang Trouble |
| 4–5 | Rivals |
| 6 | Unquiet Dead |
| Critical | Cooperation |

**Medium Heat (4–5) Entanglements:**

| Roll | Entanglement |
|---|---|
| 1–3 | Cooperation |
| 4–5 | Show of Force |
| 6 | Unquiet Dead |
| Critical | Gang Trouble |

**High Heat (6+) Entanglements:**

| Roll | Entanglement |
|---|---|
| 1–3 | Arrest |
| 4–5 | Show of Force |
| 6 | Interrogation |
| Critical | Flipped |

Each entanglement result card shows:
- Name (bold)
- Short description of what it means in play
- GM prompt: "How do you handle this?"
- Notes field to record what happened

Entanglement result saved to session.

**[Move to Downtime Activities →]**

---

### Phase 8: Downtime — Activities (`downtime_activities`)

**Purpose:** Each PC takes their downtime activities (2 free).

**UI:**

#### 8a. PC Roster
Simple name list. The GM can add PC names (just text, no character sheet sync needed). Each PC gets their own row.

For each PC, an expandable activity section shows:

- **Activity 1** (free) — dropdown selector + roll widget
- **Activity 2** (free) — dropdown selector + roll widget  
- **Additional** (costs 1 coin each) — can add more

**Activity types (Core):**

| Activity | Roll Type | Notes |
|---|---|---|
| **Indulge Vice** | Downtime Roll (lowest attribute) | Clear Stress equal to result; overindulgence if excess |
| **Long-Term Project** | Action Roll (player's choice of action) | Tick clock segments per result: 1-3=1, 4-5=2, 6=3, Crit=5 |
| **Recover** | Downtime Roll (via healer) | Fill healing clock; clear harm |
| **Reduce Heat** | Action Roll | 1-3: −1 Heat, 4-5: −2, 6: −3 |
| **Acquire Asset** | Fortune Roll (crew Tier) | Quality = Tier−1 / Tier / Tier+1 / Tier+2 |
| **Train** | No roll | Mark 1 XP on chosen track |
| **Work on Long-Term Project** | Action Roll | Same as Long-Term Project |

Each activity row:
1. Dropdown to select activity type
2. Optional notes ("what are they doing?")
3. **[Roll]** button → opens appropriate roll widget
4. Result displayed inline with interpretation
5. Checkbox "Done"

Any heat changes from Reduce Heat update the session's `heat` value live.

**[Complete Downtime →]** → transitions to `recap`

---

### Phase 9: Recap

**Purpose:** Summary of the full session before archiving.

**UI:** Read-only summary card (stylized, dark aesthetic):

```
─────────────────────────────
  THE [SCORE NAME]
  Mode: Blades in the Dark Core
─────────────────────────────
  Plan: [Stealth — via the east canal dock]
  Engagement: 4/5 → Risky Start
  Outcome: Succeeded
─────────────────────────────
  PAYOFF
  Rep: +3   Coin: 6
─────────────────────────────
  HEAT & WANTED
  Heat gained: +4 (killing involved, hostile turf)
  Wanted Level: 1
─────────────────────────────
  ENTANGLEMENT
  Show of Force — [GM note]
─────────────────────────────
  DOWNTIME
  [PC Name] — Indulge Vice → 4/5 (cleared 4 stress)
  [PC Name] — Recover → 6 (2 segments on healing clock)
─────────────────────────────
  ROLLS THIS SESSION: 14
─────────────────────────────
```

**Actions:**
- **[Copy Recap]** — copy plaintext to clipboard
- **[End Session & Archive]** → sets `archived: true`, clears active session, returns to New Session screen

---

## 6. Blades '68 Mode — Four-Phase Cycle

```
[New Session] → PERSONAL BUSINESS → PLANNING MEETING → THE SCORE → AFTERMATH → [Recap] → [End]
```

### Phase keys: `personal_business` | `planning_meeting` | `score_plan` | `score_engagement` | `score_active` | `aftermath_payoff` | `aftermath_heat` | `aftermath_harm` | `aftermath_unwind` | `recap`

The Score phase (plan → engagement → active) is **identical** to Core Mode §5 phases 2–4 above, with one difference: plan types remain the same six options. The differences are entirely in Personal Business and Aftermath.

---

### Phase 1: Personal Business (`personal_business`)

This phase combines free play and downtime activities. It runs **before** the score in '68, unlike Core where downtime comes after.

**UI:**

#### 1a. Backing Faction: Return the Favor
*"If any PC has a backing faction, make a Return the Favor roll at the start of personal business."*

Toggle: "Does any PC have a backing faction?" → if yes:
- Display instructions: "Roll 1d per instance of help received since your last Return the Favor roll."
- **[Roll Return the Favor]** → Fortune Roll widget
- Result table displayed:

| Result | Outcome |
|---|---|
| 1–3 | Nothing. Add +1d next time. |
| 4/5 | They ask for a minor favor. |
| 6 | Personal mission assigned. |
| Critical | Urgent mission — mark failure clock twice. |

Notes field for GM to record the favor/mission.

#### 1b. Downtime Activities
Same activity rows as Core (§5 Phase 8) but with the '68 activity list:

| Activity | Roll / Notes |
|---|---|
| **Indulge Vice** | Lowest attribute roll; clear Stress = result; overindulgence options shown |
| **Long-Term Project** | Action roll; 1-3=1 seg, 4/5=2, 6=3, Crit=5 |
| **Recover** | Healer rolls; segments on healing clock; taking Recover always clears level-1 harm |
| **Reduce Heat** | Action roll; 1-3: −1, 4/5: −2, 6: −3, Crit: −5 |
| **Acquire Asset** | Crew Tier roll + lifestyle bonus dice |
| **Training Montage** | No roll; mark 1 XP (or 2 with crew Training upgrade) |

**'68-specific overindulgence options** (shown when overindulge occurs):
- Attract Trouble (GM rolls additional Crew Trouble)
- Bad Decision (GM ticks a clock)
- Bender (character absent; vanishes for weeks)
- Brag (+2 Heat)
- Brawl (−1 status with a faction OR level 2 harm)
- Tapped (lose current vice source)

**Spending Stacks for extra activities:**  
Toggle: "Spend 1 stack for an extra activity?" → each adds one more activity slot per PC.

**[Move to Planning Meeting →]**

---

### Phase 2: Planning Meeting (`planning_meeting`)

**Purpose:** The table collaborates on what score to do next. Unlike Core's more fluid approach, '68 formalizes this as a group pitch session.

**UI:**

#### 2a. Opportunity Pitches
Expandable list where the GM can record each pitch:
- **[+ Add Pitch]** → adds a card with fields: "Who's pitching? What's the opportunity?"
- Each pitch card: name/title + brief description textarea

#### 2b. Selected Score
After discussion, the GM selects one pitch as the active score:
- Tap a pitch card to "select" it (highlighted)
- Or type a new score name manually
- Score name saved to session

#### 2c. GM Details
*"Now add specific details to the broad opportunity."*
- Freeform notes field for the GM to flesh out the score
- Secondary score field: "Is there a secondary score for a cohort?" (optional)

**[Move to Score Planning →]** → transitions to `score_plan` (same as Core)

---

### Phase 3: The Score

Identical to Core Mode phases 2–4 (`score_plan` → `score_engagement` → `score_active`).

The only '68-specific note: **Harm during the score is purely fictional** (no mechanical penalty during the score itself). The GM sees a reminder banner:

> *"In '68, harm is a fictional consideration that affects effect — it carries no mechanical penalties during the score. Harm complications are resolved in Aftermath."*

Score resolution buttons remain the same: **[Score Succeeded]** / **[Score Failed / Partial]** → transitions to `aftermath_payoff`.

---

### Phase 4: Aftermath — Payoff & Heat (`aftermath_payoff` / `aftermath_heat`)

Same as Core Mode phases 5–6 with one addition in the heat section:

**'68 Faction Status Changes:**
*"Did the score affect your standing with any faction?"*

Toggle list of factions involved. For each:
- +1 / 0 / −1 / −2 status change stepper
- Freeform note: "Why did this change?"

Faction changes saved to session and surfaced in recap.

**[Move to Harm Complications →]**

---

### Phase 5: Aftermath — Harm Complications (`aftermath_harm`)

**This is unique to '68.** Every PC who took harm during the score rolls for complications.

**UI:**

#### 5a. PC List with Harm
For each PC (from the same name list used in personal business):
- Toggle: "Did [PC name] take any harm this score?"
- If yes: show harm levels they have (text input: e.g., "Level 2: Gunshot Wound")
- **[Roll Harm Complications]** → Fortune Roll widget (roll = number of harm levels taken)

**Harm Complication Results:**

| Result | Outcome |
|---|---|
| 1–3 | Serious complication — GM describes lasting consequence |
| 4–5 | Minor complication — setback, but manageable |
| 6 | Clean — no lasting harm complication |
| Critical | Shrug it off — fully recovered |

Notes field per PC for "what happened?"

Special case: **Mortal injury (level 4)** → red warning banner:  
*"This character has a mortal injury. They will die without immediate intervention. Consider: do they survive? Do they return as a resonance echo?"*

**[Move to Unwind →]**

---

### Phase 6: Aftermath — Unwind (`aftermath_unwind`)

**Purpose:** The crew debriefs and blows off steam. This is a narrative capstone scene, not a mechanical step, but the GM needs a prompt for it.

**UI:**

Prompt card:

> *"Play the unwind scene. The crew is somewhere safe — a bar, their base, a parked car outside. They decompress together. What do they talk about? What just happened? Where do things stand?"*

Freeform notes field for GM to record scene highlights.

Optional toggle: "Does any PC hit a Key during the unwind scene?"  
→ If yes: freeform field to record which PC and which key (no mechanical integration needed — just a note).

**[View Recap →]**

---

### Phase 7: Recap

Same structure as Core recap (§5 Phase 9) with '68-specific additions:

- Harm complications per PC
- Faction status changes
- Unwind scene notes
- Keys hit during aftermath (if any)

---

## 7. Trouble Engine (Blades '68 — Between Sessions)

**The Trouble Engine runs between sessions, not within the score flow.** It is a separate sub-panel accessible from the Score Runner landing screen (not part of the active session).

**UI:** A persistent "Trouble Engine" collapsible section on the '68 New Session / landing screen.

**Contents:**
- **Faction Clocks Panel:** GM can add/tick faction clocks (same clock UI as score active phase, but these are long-running cross-session clocks)
- **Roll Crew Trouble:** Fortune roll to generate a new entanglement/threat
- **Roll Local Trouble:** Separate fortune roll for district-level troubles
- Notes field per trouble

The Trouble Engine does not auto-advance — the GM runs it manually between sessions.

---

## 8. Dice Roll Widgets

All dice rolling uses the same underlying 6d6 pool system: roll N dice, read the highest single result. If pool is 0 or negative, roll 2d and take the lowest.

**Result thresholds:**
| Highest die | Outcome |
|---|---|
| 6 + 6 (two or more 6s) | **Critical** — full success + extra benefit |
| 6 | **Full Success** — things go well |
| 4–5 | **Partial Success** — success with consequence |
| 1–3 | **Bad Outcome** — things go poorly |

---

### 8.1 Dice Roll Widget (Base Component)

Reusable `<DiceRollWidget>` component used by all roll types:

**Props:** `{ pool: number, label: string, onResult: fn }`

**UI:**
1. Animated dice tray: renders N dice as d6 icons. On roll, they animate (spin/tumble for ~600ms using CSS animation), then land on final values.
2. All dice values shown individually (e.g., `[2] [5] [6]`)
3. Highest die highlighted with a ring
4. Result badge (Critical / Full / Partial / Bad) with color coding:
   - Critical = gold
   - Full = green
   - Partial = amber
   - Bad = red
5. **Reroll button** (optional, GM discretion)
6. **[Confirm]** saves result to roll log

**Roll log entry format:**
```json
{
  "type": "action",
  "label": "Revka — Attune vs ghost",
  "pool": 3,
  "dice": [6, 5, 2],
  "result": 6,
  "outcome": "full",
  "position": "desperate",
  "effect": "limited",
  "timestamp": "..."
}
```

---

### 8.2 Action Roll Wizard (6-Step Flow)

The Action Roll Wizard is a step-by-step modal for the most common roll in the game. Steps flow top-to-bottom (scrollable on mobile) — the GM doesn't have to navigate between screens.

**Step 1 — Player's Goal**  
Label: "What is the character trying to accomplish?"  
Text input: free-form (e.g., "Get past the guard without being seen")  
Saved to roll log.

**Step 2 — Action Rating**  
Label: "Which action are they using?"  
12-button grid of action names (Core: Attune, Command, Consort, Finesse, Hunt, Prowl, Skirmish, Study, Survey, Sway, Tinker, Wreck).  
After selecting, stepper: "Rating (dots): 0 / 1 / 2 / 3 / 4" → sets base dice pool.

**Step 3 — Position**  
Label: "What is the position?"  
Three large cards:

| Card | Color | Description |
|---|---|---|
| Controlled | Green | Golden opportunity. Dominant advantage. Set up for success. |
| Risky | Amber | Head to head. Acting under duress. Taking a chance. **(Default)** |
| Desperate | Red | Serious trouble. Overreaching. Dangerous maneuver. |

Tap to select. Saved to roll.

**Step 4 — Effect Level**  
Label: "What is the likely effect?"  
Three cards:

| Effect | Description |
|---|---|
| Great | More than usual. Stronger outcome. |
| Standard | As expected. **(Default)** |
| Limited | Less than usual. Incomplete result. |

Tap to select. Saved to roll.

**Step 5 — Bonus Dice**  
Label: "Add or remove dice?"  
A set of toggle rows, each ±1d:

| Source | Effect |
|---|---|
| Push Yourself (2 stress) | +1d |
| Devil's Bargain | +1d (GM notes what it is) |
| Assistance (teammate) | +1d |
| Group Action Lead | Uses highest result across group |
| Other (freeform note) | ±Xd |

**Running pool display:** `[Action Rating] + [bonuses] = Xd → Roll Xd`

If pool = 0: "Roll 2d, take lowest" message.

**Step 6 — Roll & Result**  
**[Roll Dice]** → triggers `<DiceRollWidget>` with the final pool.

After roll resolves, show **full context panel:**

```
┌─────────────────────────────────┐
│  Goal: Get past the guard       │
│  Action: Prowl (2d)             │
│  Position: RISKY                │
│  Effect: STANDARD               │
│  Dice: [3][6] → 6               │
│  ▓▓▓▓▓▓▓▓ FULL SUCCESS ▓▓▓▓▓▓▓▓ │
│  "You succeed. No consequences." │
│                                 │
│  [Confirm]  [Consequence →]     │
└─────────────────────────────────┘
```

**Context-aware outcome text** (auto-generated from position + result):

| Position + Result | Display text |
|---|---|
| Any + Critical | "Critical success — gain an additional benefit." |
| Any + Full | "Full success — achieve your goal with no consequences." |
| Controlled + Partial | "Partial — you succeed, but with a minor complication." |
| Risky + Partial | "Partial — you succeed, but face a consequence." |
| Desperate + Partial | "Partial — you succeed, but face a serious consequence." |
| Controlled + Bad | "Bad outcome — reduced effect or minor setback." |
| Risky + Bad | "Bad outcome — fail and face a consequence." |
| Desperate + Bad | "Bad outcome — fail and face a severe consequence." |

**[Consequence →]** opens the Consequence quick-reference panel (see §8.6).

---

### 8.3 Fortune Roll Widget

Used for: engagement roll, entanglement roll, downtime rolls that use fortune.

**UI:** Simpler than the Action Roll Wizard. Single-screen:

- Label: what the roll is for (pre-filled by context, editable)
- Dice pool stepper: 1d / 2d / 3d / 4d
- Optional "Roll 2d take lowest" toggle (for 0-pool situations)
- **[Roll]** → `<DiceRollWidget>`
- Result displayed with outcome badge + context label

---

### 8.4 Resistance Roll Widget

Used when a PC wants to resist a consequence.

**UI:**

1. Label: "What consequence are they resisting?"  
   Free text.
2. Attribute selector: **Insight / Prowess / Resolve**  
   Each shows its description:
   - Insight → mental harm, confusion, losing track, etc.
   - Prowess → physical harm, being forced to move, etc.
   - Resolve → willpower, composure, emotional harm, etc.
3. Attribute rating stepper: 0–4
4. **[Roll Resistance]** → `<DiceRollWidget>`
5. Result:
   - The result die value determines **how much stress the resistance costs**: `6 − result = stress cost` (minimum 0, unless critical which means clear 1 stress)
   - Display: "Result: [X] → Stress cost: [Y]"
   - Special: Critical → "Resist at no stress cost and clear 1 stress!"
6. Outcome note: "The consequence is avoided / reduced. Describe how."

---

### 8.5 Flashback Helper

Not a dice roll — a structured prompt to help the GM adjudicate a flashback.

**UI:** Modal with:

1. "What is the flashback?" — free text
2. GM judgment: **Stress Cost**  
   Three options as large tap targets:
   - **0 Stress** — "Ordinary action, easy opportunity"
   - **1 Stress** — "Complex action or unlikely opportunity"
   - **2+ Stress** — "Elaborate action, special contingencies"
   Stepper for 2+ to go higher.
3. "Does the flashback require a roll?"  
   Toggle → if yes, opens Action Roll Wizard; if no, just confirm.
4. Note: "If the flashback involves a downtime activity, pay 1 coin or 1 rep instead of stress."

---

### 8.6 Consequence Quick-Reference Panel

A slide-up sheet triggered from the Action Roll result screen. Not a roll — just a reference.

Displays consequence options the GM can use:

| Type | Description |
|---|---|
| Harm | Inflict harm 1–4 on a PC |
| Complication | Start or tick a clock |
| Reduced Effect | Downgrade the effect level |
| Worse Position | Future rolls are at a worse position |
| Lost Opportunity | The chance is gone |

Each type has a 1-sentence description. Helps the GM pick the right consequence quickly.

---

## 9. UI Design Guidelines

**Visual language:** Follow the existing app's aesthetic throughout.
- Background: `#09090b` / `#111113` / `#0f0f11`
- Borders: `#1f1f1f` / `#27272a`
- Neutral text: `#e5e5e5` / `#a3a3a3`
- Animations: use existing `animate-fade-in`, `animate-scale-in`, `animate-slide-up`

**Mode accent colors:**
- Core BitD: neutral/gray (`#737373` bar, `#f5f5f5` titles) — matches existing `accentColor("BitD Core")`
- Blades '68: blue (`#1d4ed8` bar, `#bfdbfe` titles) — matches existing `accentColor("B68")`

**Phase navigation:**
- A persistent top strip inside Score Runner shows the current phase as a step indicator (dots or abbreviated labels). Completed phases show a check; current phase is highlighted; future phases are dim.
- The strip is non-clickable (forward-only flow) — no skipping phases
- A **[← Back]** button is available to go back one phase (with confirmation if the phase had rolls)

**Roll dice button styling:**
- Primary action: white bg / black text (same as "Add Clock" button in existing app)
- Large tap target, minimum 48px height

**Clocks embedded in score:**
- Reuse existing `<ClockCard>` and `<ClockSVG>` components directly
- Layout: horizontal scroll row on mobile, grid on wider screens

**Empty states:**
- Follow existing pattern (icon + italic text)

---

## 10. Component Architecture

```
<ScoreRunnerView>                    ← new top-level tab component
  <NewSessionScreen>                 ← shown when no active session
  <TroubleEngine>                    ← '68 only, between-session panel
  <ActiveSession>                    ← rendered when session exists
    <SessionHeader>                  ← score name, phase strip, save status
    <PhaseRouter>                    ← renders the correct phase component
      <FreePlayPhase>                ← Core phase 1
      <PersonalBusinessPhase>        ← '68 phase 1
      <PlanningMeetingPhase>         ← '68 phase 2
      <ScorePlanPhase>               ← shared
      <EngagementRollPhase>          ← shared
      <ScoreActivePhase>             ← shared
        <ClocksPanel>                ← embedded clocks (reuses ClockCard, ClockSVG)
        <RollPanel>                  ← floating roll type buttons
      <DowntimePayoffPhase>          ← Core phase 5 / '68 aftermath
      <DowntimeHeatPhase>            ← Core phase 6 / '68 aftermath
      <EntanglementsPhase>           ← Core only
      <DowntimeActivitiesPhase>      ← Core phase 8
      <AftermathHarmPhase>           ← '68 only
      <AftermathUnwindPhase>         ← '68 only
      <RecapPhase>                   ← shared
    <ActionRollWizard>               ← modal/sheet
    <FortuneRollWidget>              ← modal/sheet
    <ResistanceRollWidget>           ← modal/sheet
    <FlashbackHelper>                ← modal/sheet
    <ConsequencePanel>               ← slide-up sheet
    <DiceRollWidget>                 ← base animated dice component
```

**State management:** Use a single `useScoreSession` hook that:
- Holds all session state in local React state
- Debounces saves to PocketBase (2s after any change)
- Exposes `updatePhase`, `updateClocks`, `addRoll`, `updateHeat`, etc.
- Loads existing session on mount

---

## 11. Differences Summary: Core vs '68

| Element | Core BitD | Blades '68 |
|---|---|---|
| Phase order | Free Play → Score → Downtime | Personal Business → Planning Meeting → Score → Aftermath |
| Downtime timing | After the score | Before the score (Personal Business) |
| Planning | Informal, GM-driven | Formalized group pitch session |
| Entanglements | Roll during Downtime (Core table) | Trouble Engine between sessions |
| Harm during score | Mechanical (levels affect action) | Only fictional (affects effect) |
| Harm resolution | During score via resistance | After score in Aftermath (harm complications roll) |
| Trauma | Permanent conditions | Keys / Deadlocks (keys have 3 marks, deadlock on stress-out) |
| Currency | Coin | Stacks & Bank |
| Advancement XP triggers | Desperate rolls + end-of-session triggers | Desperate + zero-dot + key hits + end-of-session triggers |
| Post-score closer | (transitions to free play) | Unwind scene |
| Between-session system | Not formalized | Trouble Engine (faction clocks + trouble rolls) |
| Overindulgence | 4 options | 6 options including Bender |

For the app: both modes share the Score phase (plan → engagement → active) without modification. The divergence is entirely in phases 1–2 (before) and phases 5+ (after).

---

## 12. Out of Scope (v1)

The following are intentionally excluded from v1 to keep the feature focused:

- Syncing character stress/harm between Score Runner and the Character Manager
- Multi-GM or shared session (one user owns the session)
- Archived session browser / history view
- Print/export to PDF
- Player-facing view (spectator mode)
- '68 Ticking Timebombs (background situation tracker)
- Full faction status tracker (only per-score changes in recap)
- Full prison / incarceration flow
- Time skips
- Raids

These can be added in v2 once the core loop is solid.
