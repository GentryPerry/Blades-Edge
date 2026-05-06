import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Minus, X, RotateCcw, Check, Skull, Clock,
  FileText, AlertTriangle, Copy, Archive,
  Target, Shield, Dices, Swords
} from "lucide-react";
import { DieFace } from "./diceroller";
import { callGemini } from "./gemini";

// ─── STORAGE ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "blades_score_session";

// ─── GAME DATA ──────────────────────────────────────────────────────────────

const PLAN_TYPES = [
  { id: "assault",    label: "Assault",    detail: "Point of attack",      desc: "Overwhelm the target with force." },
  { id: "deception",  label: "Deception",  detail: "Method of deception",  desc: "Trick the target into letting you in." },
  { id: "stealth",    label: "Stealth",    detail: "Point of infiltration", desc: "Slip in without being seen." },
  { id: "occult",     label: "Occult",     detail: "Arcane method",         desc: "Use strange powers or rituals." },
  { id: "social",     label: "Social",     detail: "Social connection",     desc: "Leverage relationships and charm." },
  { id: "transport",  label: "Transport",  detail: "Route & means",         desc: "Move people, goods, or information." },
];

const ACTIONS = [
  "Attune","Command","Consort","Finesse","Hunt",
  "Prowl","Skirmish","Study","Survey","Sway","Tinker","Wreck",
];

const ATTRIBUTES = [
  { id: "insight",  label: "Insight",  desc: "Mental harm, confusion, losing track." },
  { id: "prowess",  label: "Prowess",  desc: "Physical harm, forced movement." },
  { id: "resolve",  label: "Resolve",  desc: "Willpower, composure, emotional harm." },
];

const ENGAGEMENT_MODS = [
  { id: "boldness",     label: "Plan boldness",       plus: "Bold or daring",         minus: "Complex / contingent" },
  { id: "vulnerability",label: "Target vulnerability",plus: "Exposes a weakness",     minus: "Target is resistant" },
  { id: "friends",      label: "Friends & contacts",  plus: "Aid from a friend",      minus: "Enemy interfering" },
  { id: "tier",         label: "Target Tier",         plus: "Target lower Tier",      minus: "Target higher Tier" },
  { id: "other",        label: "Other factors",       plus: "Situational advantage",  minus: "Situational disadvantage" },
];

const HEAT_MODS = [
  { id: "connected",   label: "High-profile / well-connected target", amount: 1 },
  { id: "hostile",     label: "Situation on hostile turf",            amount: 1 },
  { id: "war",         label: "Crew at war with another faction",     amount: 1 },
  { id: "killing",     label: "Killing was involved",                 amount: 2 },
];

const ENTANGLEMENT_TABLE = {
  low: [
    { range: [1,3], name: "Gang Trouble",       desc: "A crew member gets into trouble with a rival gang. Someone gets hurt or caught." },
    { range: [4,5], name: "Rivals",             desc: "A rival faction makes a move against you. They strengthen their position." },
    { range: [6,6], name: "Unquiet Dead",       desc: "Ghosts or spirits are disturbed. Something supernatural takes notice." },
    { range: [7,9], name: "Cooperation",        desc: "A faction reaches out with an offer of cooperation. There's a catch." },
  ],
  medium: [
    { range: [1,3], name: "Cooperation",        desc: "A faction reaches out — but this time the request is more urgent." },
    { range: [4,5], name: "Show of Force",      desc: "A hostile faction makes a visible move in your territory." },
    { range: [6,6], name: "Unquiet Dead",       desc: "Spectral complications from your score linger. The dead are restless." },
    { range: [7,9], name: "Gang Trouble",       desc: "A rival crew escalates. Expect a confrontation soon." },
  ],
  high: [
    { range: [1,3], name: "Arrest",             desc: "The Bluecoats move in. A crew member is taken in for questioning — or worse." },
    { range: [4,5], name: "Show of Force",      desc: "Blue coats or enforcers arrive in strength. You're being watched." },
    { range: [6,6], name: "Interrogation",      desc: "Someone close to the crew is picked up and questioned. What do they say?" },
    { range: [7,9], name: "Flipped",            desc: "Someone in your network has been turned. A contact or ally is now working against you." },
  ],
};

const DOWNTIME_ACTIVITIES_CORE = [
  { id: "vice",     label: "Indulge Vice",         roll: "fortune",    desc: "Clear Stress = result die. Risk overindulgence." },
  { id: "project",  label: "Long-Term Project",    roll: "action",     desc: "Tick clock: 1-3=1 seg, 4-5=2, 6=3, Crit=5." },
  { id: "recover",  label: "Recover",              roll: "fortune",    desc: "Healer rolls to fill healing clock and clear harm." },
  { id: "heat",     label: "Reduce Heat",          roll: "action",     desc: "1-3: −1 Heat, 4-5: −2, 6: −3." },
  { id: "acquire",  label: "Acquire Asset",        roll: "fortune",    desc: "Roll crew Tier to acquire an asset." },
  { id: "train",    label: "Train",                roll: "none",       desc: "Mark 1 XP on a chosen track." },
];

const DOWNTIME_ACTIVITIES_68 = [
  { id: "vice",     label: "Indulge Vice",         roll: "fortune",    desc: "Clear Stress = result die. Risk overindulgence." },
  { id: "project",  label: "Long-Term Project",    roll: "action",     desc: "Tick clock: 1-3=1 seg, 4-5=2, 6=3, Crit=5." },
  { id: "recover",  label: "Recover",              roll: "fortune",    desc: "Healer rolls to fill healing clock. Level-1 harm always clears." },
  { id: "heat",     label: "Reduce Heat",          roll: "action",     desc: "1-3: −1, 4-5: −2, 6: −3, Crit: −5." },
  { id: "acquire",  label: "Acquire Asset",        roll: "fortune",    desc: "Roll crew Tier + lifestyle bonus dice." },
  { id: "train",    label: "Training Montage",     roll: "none",       desc: "Mark 1 XP (or 2 with Training upgrade)." },
];

const PHASE_SEQUENCES = {
  core: ["free_play","score_plan","score_engagement","score_active","downtime_payoff","downtime_heat","downtime_entanglements","downtime_activities","recap"],
  "68": ["personal_business","planning_meeting","score_plan","score_engagement","score_active","aftermath_payoff","aftermath_heat","aftermath_harm","aftermath_unwind","recap"],
};

const PHASE_LABELS = {
  free_play:              "Free Play",
  personal_business:      "Personal Business",
  planning_meeting:       "Planning Meeting",
  score_plan:             "Score Plan",
  score_engagement:       "Engagement Roll",
  score_active:           "Score Active",
  downtime_payoff:        "Payoff",
  downtime_heat:          "Heat",
  downtime_entanglements: "Entanglements",
  downtime_activities:    "Downtime",
  aftermath_payoff:       "Payoff",
  aftermath_heat:         "Heat",
  aftermath_harm:         "Harm",
  aftermath_unwind:       "Unwind",
  recap:                  "Recap",
};

const DEFAULT_SESSION = () => ({
  id: Date.now().toString(),
  mode: "core",
  scoreName: "",
  setupNotes: "",
  phase: null,
  rollLog: [],
  freePlay: { notes: "", checks: {} },
  personalBusiness: { hasBacking: false, backingNote: "", activities: [] },
  planningMeeting: { pitches: [], selectedPitch: "", notes: "" },
  scorePlan: { planType: "", planDetail: "", notes: "" },
  engagement: { mods: {}, result: null, notes: "" },
  scoreActive: { clocks: [], startingPosition: "", outcome: "", notes: "" },
  downtimePayoff: { targetTier: 1, quiet: false, coin: 6, coinNotes: "", hasTithe: false },
  downtimeHeat: { baseHeat: 0, mods: {}, totalHeat: 0, wantedLevel: 0 },
  downtimeEntanglements: { result: null, notes: "" },
  downtimeActivities: { players: [], entries: [] },
  aftermathHarm: { players: [] },
  aftermathUnwind: { notes: "", keysHit: false, keysNotes: "" },
  recap: {},
});

// ─── HOOK ────────────────────────────────────────────────────────────────────

function useScoreSession() {
  const [session, setSessionRaw] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSessionRaw(JSON.parse(saved));
    } catch {}
  }, []);

  const setSession = useCallback((updater) => {
    setSessionRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const patch = useCallback((path, value) => {
    setSession(prev => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, [setSession]);

  const advance = useCallback(() => {
    setSession(prev => {
      const seq = PHASE_SEQUENCES[prev.mode];
      const idx = seq.indexOf(prev.phase);
      if (idx < seq.length - 1) return { ...prev, phase: seq[idx + 1] };
      return prev;
    });
  }, [setSession]);

  const back = useCallback(() => {
    setSession(prev => {
      const seq = PHASE_SEQUENCES[prev.mode];
      const idx = seq.indexOf(prev.phase);
      if (idx > 0) return { ...prev, phase: seq[idx - 1] };
      return prev;
    });
  }, [setSession]);

  const addRoll = useCallback((entry) => {
    setSession(prev => ({ ...prev, rollLog: [...(prev.rollLog || []), { ...entry, ts: Date.now() }] }));
  }, [setSession]);

  const clearSession = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSessionRaw(null);
  }, []);

  return { session, setSession, patch, advance, back, addRoll, clearSession };
}

// ─── UI PRIMITIVES ──────────────────────────────────────────────────────────

const Btn = ({ children, onClick, variant = "primary", disabled, className = "", small }) => {
  const base = "font-black uppercase tracking-widest transition-all rounded-xl disabled:opacity-40 disabled:cursor-not-allowed";
  const size = small ? "text-[10px] px-3 py-1.5" : "text-xs px-5 py-3";
  const variants = {
    primary:  "bg-white text-black hover:bg-neutral-200",
    danger:   "bg-red-600 text-white hover:bg-red-500",
    ghost:    "bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700",
    outline:  "border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${size} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green:  "bg-green-950 text-green-400 border-green-900",
    amber:  "bg-amber-950 text-amber-400 border-amber-900",
    red:    "bg-red-950 text-red-400 border-red-900",
    gold:   "bg-yellow-950 text-yellow-400 border-yellow-900",
    gray:   "bg-neutral-800 text-neutral-400 border-neutral-700",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${colors[color]}`}>
      {children}
    </span>
  );
};

const SectionCard = ({ children, className = "" }) => (
  <div className={`bg-[#111113] border border-neutral-800 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">{children}</p>
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    className="w-full bg-[#18181b] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 resize-none"
  />
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full bg-[#18181b] border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
  />
);

const Stepper = ({ value, onChange, min = 0, max = 10, label }) => (
  <div className="flex items-center gap-3">
    {label && <span className="text-sm text-neutral-400 flex-1">{label}</span>}
    <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 transition-colors flex items-center justify-center">
      <Minus size={12} />
    </button>
    <span className="text-lg font-black text-white w-6 text-center">{value}</span>
    <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 transition-colors flex items-center justify-center">
      <Plus size={12} />
    </button>
  </div>
);

const PhaseContainer = ({ children }) => (
  <div className="flex flex-col gap-4 pb-24">{children}</div>
);

const PhaseHeader = ({ title, sub, icon: Icon }) => (
  <div className="text-center pt-2 pb-1">
    {Icon && <Icon size={20} className="text-neutral-500 mx-auto mb-2" />}
    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Score Runner</p>
    <h2 className="text-xl font-black uppercase tracking-widest text-white">{title}</h2>
    {sub && <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">{sub}</p>}
  </div>
);

// ─── CLOCK SVG ──────────────────────────────────────────────────────────────

const ClockSVG = ({ segments, filled, size = 64 }) => {
  const r = 46, cx = 50, cy = 50;
  const ratio = filled / segments;
  const fill = ratio >= 1 ? "#ef4444" : ratio >= 0.5 ? "#f97316" : "#71717a";
  const paths = [];
  for (let i = 0; i < segments; i++) {
    const a1 = (i * 360 / segments - 90) * Math.PI / 180;
    const a2 = ((i + 1) * 360 / segments - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    paths.push(
      <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
        fill={i < filled ? fill : "transparent"} stroke="#27272a" strokeWidth="2" />
    );
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="#0f0f11" stroke="#27272a" strokeWidth="2" />
      {paths}
    </svg>
  );
};

// ─── DICE ROLL WIDGET ────────────────────────────────────────────────────────

function getOutcome(dice, isZeroPool) {
  if (!dice || dice.length === 0) return null;
  const best = isZeroPool ? Math.min(...dice) : Math.max(...dice);
  const sixes = dice.filter(v => v === 6).length;
  if (sixes >= 2 && !isZeroPool) return { label: "CRITICAL", sub: "Exceptional result!", color: "gold", value: best };
  if (best === 6) return { label: "FULL SUCCESS", sub: "Full effect.", color: "green", value: best };
  if (best >= 4) return { label: "PARTIAL", sub: "Success with a consequence.", color: "amber", value: best };
  return { label: "FAILURE", sub: "Things go wrong.", color: "red", value: best };
}

function DiceRollWidget({ pool: initialPool, label, onResult, onClose, zeroPoolLabel }) {
  const [pool] = useState(Math.max(0, initialPool));
  const isZeroPool = pool === 0;
  const diceCount = isZeroPool ? 2 : pool;
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [bestIdx, setBestIdx] = useState(-1);
  const [confirmed, setConfirmed] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setOutcome(null);
    setDice([]);
    setBestIdx(-1);
    setConfirmed(false);
    setTimeout(() => {
      const rolled = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setDice(rolled);
      const best = isZeroPool ? Math.min(...rolled) : Math.max(...rolled);
      setBestIdx(rolled.indexOf(best));
      setOutcome(getOutcome(rolled, isZeroPool));
      setRolling(false);
    }, 1000);
  };

  const confirm = () => {
    if (onResult) onResult(outcome, dice);
    setConfirmed(true);
    setTimeout(onClose, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111113] border border-neutral-800 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Dice Roll</p>
            <p className="text-sm font-bold text-white">{label}</p>
            {isZeroPool && <p className="text-xs text-red-400 mt-0.5">{zeroPoolLabel || "0-pool: roll 2d take lowest"}</p>}
          </div>
          <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="flex gap-2 justify-center flex-wrap min-h-[60px]">
          {Array.from({ length: diceCount }).map((_, i) => (
            <div key={i} style={{ animation: !rolling && dice[i] ? "dieReveal 0.3s ease-out both" : "none" }}>
              <DieFace value={dice[i] || 1} spinning={rolling} isBest={i === bestIdx && !isZeroPool} size={52} />
            </div>
          ))}
        </div>

        {outcome && !rolling && (
          <div className="text-center">
            <div className="flex justify-center mb-1"><Badge color={outcome.color}>{outcome.label}</Badge></div>
            <p className="text-neutral-500 text-xs">{outcome.sub}</p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!confirmed && (
            <Btn onClick={roll} disabled={rolling} variant={rolling ? "ghost" : "primary"}>
              {rolling ? "Rolling…" : dice.length ? "Re-Roll" : "Roll Dice"}
            </Btn>
          )}
          {outcome && !rolling && !confirmed && (
            <Btn onClick={confirm} variant="ghost">Confirm →</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ACTION ROLL WIZARD ──────────────────────────────────────────────────────

function ActionRollWizard({ onClose, onResult }) {
  const [goal, setGoal] = useState("");
  const [action, setAction] = useState("");
  const [rating, setRating] = useState(1);
  const [position, setPosition] = useState("risky");
  const [effect, setEffect] = useState("standard");
  const [push, setPush] = useState(false);
  const [bargain, setBargain] = useState(false);
  const [assist, setAssist] = useState(false);
  const [bargainNote, setBargainNote] = useState("");
  const [showRoll, setShowRoll] = useState(false);
  const [result, setResult] = useState(null);

  const bonusDice = (push ? 1 : 0) + (bargain ? 1 : 0) + (assist ? 1 : 0);
  const pool = Math.max(0, rating + bonusDice);

  const POSITION_OPTIONS = [
    { id: "controlled", label: "Controlled", color: "green",  desc: "Dominant advantage." },
    { id: "risky",      label: "Risky",      color: "amber",  desc: "Normal pressure. (Default)" },
    { id: "desperate",  label: "Desperate",  color: "red",    desc: "Serious danger." },
  ];
  const EFFECT_OPTIONS = [
    { id: "great",    label: "Great",    desc: "More than usual." },
    { id: "standard", label: "Standard", desc: "As expected. (Default)" },
    { id: "limited",  label: "Limited",  desc: "Incomplete result." },
  ];

  const OUTCOME_TEXT = {
    "controlled+critical": "Critical — extra benefit on top of full success.",
    "risky+critical":      "Critical — exceptional result, extra benefit.",
    "desperate+critical":  "Critical — you nail it despite everything.",
    "controlled+full":     "Full success — clean result, no complications.",
    "risky+full":          "Full success — you achieve your goal.",
    "desperate+full":      "Full success — you pull it off by a hair.",
    "controlled+partial":  "Partial — success with a minor complication.",
    "risky+partial":       "Partial — success but face a consequence.",
    "desperate+partial":   "Partial — success but a serious consequence.",
    "controlled+bad":      "Bad outcome — reduced effect or minor setback.",
    "risky+bad":           "Bad outcome — fail and face a consequence.",
    "desperate+bad":       "Bad outcome — fail and face a severe consequence.",
  };

  const getOutcomeText = () => {
    if (!result) return null;
    const key = `${position}+${result.label.toLowerCase().replace("full success","full").replace("failure","bad").replace("partial","partial").replace("critical","critical")}`;
    const lookup = result.label === "FULL SUCCESS" ? `${position}+full`
      : result.label === "PARTIAL" ? `${position}+partial`
      : result.label === "FAILURE" ? `${position}+bad`
      : `${position}+critical`;
    return OUTCOME_TEXT[lookup];
  };

  const handleResult = (outcome, dice) => {
    setResult(outcome);
    if (onResult) onResult({ goal, action, rating, position, effect, pool, dice, outcome, bargainNote });
    setShowRoll(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111113] border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between sticky top-0 bg-[#111113] pb-2 border-b border-neutral-800">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Action Roll Wizard</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-neutral-400">Pool:</span>
              <span className="text-base font-black text-white">{pool <= 0 ? "2d ↓" : `${pool}d`}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-600 hover:text-white"><X size={16} /></button>
        </div>

        {/* Step 1: Goal */}
        <div>
          <Label>1 — Player's Goal</Label>
          <Input value={goal} onChange={setGoal} placeholder="What are they trying to accomplish?" />
        </div>

        {/* Step 2: Action */}
        <div>
          <Label>2 — Action</Label>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {ACTIONS.map(a => (
              <button key={a} onClick={() => setAction(a)}
                className={`text-[10px] font-bold uppercase py-1.5 rounded-lg border transition-all ${action === a ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}>
                {a}
              </button>
            ))}
          </div>
          <Stepper value={rating} onChange={setRating} min={0} max={4} label="Rating (dots)" />
        </div>

        {/* Step 3: Position */}
        <div>
          <Label>3 — Position</Label>
          <div className="grid grid-cols-3 gap-2">
            {POSITION_OPTIONS.map(p => (
              <button key={p.id} onClick={() => setPosition(p.id)}
                className={`rounded-xl border p-2 text-center transition-all ${position === p.id
                  ? p.color === "green" ? "bg-green-950 border-green-700 text-green-400"
                    : p.color === "amber" ? "bg-amber-950 border-amber-700 text-amber-400"
                    : "bg-red-950 border-red-700 text-red-400"
                  : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600"}`}>
                <div className="text-[10px] font-black uppercase">{p.label}</div>
                <div className="text-[9px] mt-0.5 opacity-70">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Effect */}
        <div>
          <Label>4 — Effect</Label>
          <div className="grid grid-cols-3 gap-2">
            {EFFECT_OPTIONS.map(e => (
              <button key={e.id} onClick={() => setEffect(e.id)}
                className={`rounded-xl border p-2 text-center transition-all ${effect === e.id ? "bg-neutral-700 border-neutral-500 text-white" : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-neutral-600"}`}>
                <div className="text-[10px] font-black uppercase">{e.label}</div>
                <div className="text-[9px] mt-0.5 opacity-70">{e.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Bonus dice */}
        <div>
          <Label>5 — Bonus Dice</Label>
          <div className="flex flex-col gap-2">
            {[
              { state: push,   set: setPush,   label: "Push Yourself (2 stress)" },
              { state: assist, set: setAssist, label: "Assistance (teammate)" },
              { state: bargain,set: setBargain,label: "Devil's Bargain (+1d)" },
            ].map(({ state, set, label }) => (
              <button key={label} onClick={() => set(!state)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm ${state ? "bg-neutral-700 border-neutral-500 text-white" : "bg-neutral-900 border-neutral-800 text-neutral-500"}`}>
                <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${state ? "bg-white border-white" : "border-neutral-600"}`}>
                  {state && <Check size={10} className="text-black" />}
                </div>
                {label} <span className="ml-auto text-xs font-black text-green-500">+1d</span>
              </button>
            ))}
            {bargain && (
              <Input value={bargainNote} onChange={setBargainNote} placeholder="What's the Devil's Bargain?" />
            )}
          </div>
        </div>

        {/* Step 6: Roll */}
        <div className="border-t border-neutral-800 pt-4">
          <Label>6 — Roll & Result</Label>
          {result ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-2">
              {goal && <p className="text-sm text-neutral-300"><span className="text-neutral-500 text-xs">Goal: </span>{goal}</p>}
              <div className="flex flex-wrap gap-2 text-xs">
                {action && <Badge color="gray">{action} {rating}d</Badge>}
                <Badge color={position === "controlled" ? "green" : position === "risky" ? "amber" : "red"}>{position}</Badge>
                <Badge color="gray">{effect} effect</Badge>
              </div>
              <div className="flex justify-center my-1"><Badge color={result.color}>{result.label}</Badge></div>
              {getOutcomeText() && <p className="text-xs text-neutral-400 text-center">{getOutcomeText()}</p>}
              <div className="flex gap-2 justify-center mt-1">
                <Btn onClick={() => setResult(null)} variant="ghost" small>Re-Roll</Btn>
                <Btn onClick={onClose} variant="primary" small>Done</Btn>
              </div>
            </div>
          ) : (
            <Btn onClick={() => setShowRoll(true)} className="w-full justify-center" variant="primary">
              Roll {pool <= 0 ? "2d take lowest" : `${pool}d`}
            </Btn>
          )}
        </div>
      </div>

      {showRoll && (
        <DiceRollWidget pool={pool} label={`${action || "Action"} Roll — ${goal || "…"}`}
          onResult={handleResult} onClose={() => setShowRoll(false)} />
      )}
    </div>
  );
}

// ─── FORTUNE ROLL WIDGET ────────────────────────────────────────────────────

function FortuneRollModal({ label: initLabel, pool: initPool, onResult, onClose }) {
  const [label, setLabel] = useState(initLabel || "");
  const [pool, setPool] = useState(initPool || 2);
  const [showRoll, setShowRoll] = useState(false);
  const [result, setResult] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111113] border border-neutral-800 rounded-3xl p-5 w-full max-w-xs flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Fortune Roll</p>
          <button onClick={onClose}><X size={14} className="text-neutral-600 hover:text-white" /></button>
        </div>
        <Input value={label} onChange={setLabel} placeholder="What are you rolling for?" />
        <Stepper value={pool} onChange={setPool} min={1} max={6} label="Dice pool" />
        {result ? (
          <div className="text-center flex flex-col gap-2">
            <Badge color={result.color}>{result.label}</Badge>
            <p className="text-xs text-neutral-500">{result.sub}</p>
            <div className="flex gap-2 justify-center">
              <Btn onClick={() => setResult(null)} variant="ghost" small>Re-Roll</Btn>
              <Btn onClick={() => { if (onResult) onResult(result); onClose(); }} variant="primary" small>Confirm</Btn>
            </div>
          </div>
        ) : (
          <Btn onClick={() => setShowRoll(true)}>Roll {pool}d</Btn>
        )}
      </div>
      {showRoll && (
        <DiceRollWidget pool={pool} label={label} onResult={(r) => { setResult(r); setShowRoll(false); if (onResult) onResult(r); }} onClose={() => setShowRoll(false)} />
      )}
    </div>
  );
}

// ─── RESISTANCE ROLL MODAL ──────────────────────────────────────────────────

function ResistanceRollModal({ onClose }) {
  const [consequence, setConsequence] = useState("");
  const [attr, setAttr] = useState("prowess");
  const [rating, setRating] = useState(2);
  const [result, setResult] = useState(null);
  const [showRoll, setShowRoll] = useState(false);

  const stressCost = result
    ? result.label === "CRITICAL" ? "Clear 1 stress!" : `${Math.max(0, 6 - result.value)} stress`
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111113] border border-neutral-800 rounded-3xl p-5 w-full max-w-xs flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Resistance Roll</p>
          <button onClick={onClose}><X size={14} className="text-neutral-600" /></button>
        </div>
        <Input value={consequence} onChange={setConsequence} placeholder="What consequence are they resisting?" />
        <div>
          <Label>Attribute</Label>
          <div className="flex flex-col gap-2">
            {ATTRIBUTES.map(a => (
              <button key={a.id} onClick={() => setAttr(a.id)}
                className={`flex items-start gap-3 px-3 py-2 rounded-xl border text-left transition-all ${attr === a.id ? "bg-neutral-700 border-neutral-500" : "bg-neutral-900 border-neutral-800"}`}>
                <div className={`w-3 h-3 mt-0.5 rounded-full border-2 flex-shrink-0 ${attr === a.id ? "bg-white border-white" : "border-neutral-600"}`} />
                <div>
                  <div className="text-xs font-bold text-white">{a.label}</div>
                  <div className="text-[10px] text-neutral-500">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <Stepper value={rating} onChange={setRating} min={0} max={4} label="Attribute rating" />
        {result ? (
          <div className="text-center flex flex-col gap-2">
            <Badge color={result.color}>{result.label}</Badge>
            <p className="text-sm font-bold text-white">{stressCost}</p>
            <p className="text-xs text-neutral-500">Consequence avoided or reduced. Describe how.</p>
            <Btn onClick={onClose} variant="primary" small>Done</Btn>
          </div>
        ) : (
          <Btn onClick={() => setShowRoll(true)}>Roll {Math.max(0, rating)}d</Btn>
        )}
      </div>
      {showRoll && (
        <DiceRollWidget pool={rating} label={`Resistance — ${ATTRIBUTES.find(a => a.id === attr)?.label}`}
          onResult={r => { setResult(r); setShowRoll(false); }} onClose={() => setShowRoll(false)} />
      )}
    </div>
  );
}

// ─── PHASE STRIP ────────────────────────────────────────────────────────────

function PhaseStrip({ session, onBack }) {
  const seq = PHASE_SEQUENCES[session.mode] || [];
  const idx = seq.indexOf(session.phase);
  return (
    <div className="bg-[#0d0d0f] border-b border-neutral-800 px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        {idx > 0 ? (
          <button onClick={onBack} className="text-neutral-500 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            ← Back
          </button>
        ) : <div />}
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{session.scoreName || "Unnamed Score"}</p>
        <p className="text-[10px] text-neutral-600">{idx + 1}/{seq.length}</p>
      </div>
      <div className="flex gap-1 overflow-x-auto hide-scroll pb-0.5">
        {seq.map((p, i) => (
          <div key={p} className={`flex-shrink-0 h-1.5 rounded-full transition-all ${i < idx ? "bg-neutral-600 w-5" : i === idx ? "bg-white w-8" : "bg-neutral-800 w-4"}`} />
        ))}
      </div>
      <p className="text-[9px] text-neutral-500 mt-1 text-center uppercase tracking-widest">{PHASE_LABELS[session.phase]}</p>
    </div>
  );
}

// ─── PHASE: NEW SESSION ──────────────────────────────────────────────────────

function NewSessionScreen({ onBegin, existingSession, onResume, onDiscard }) {
  const [mode, setMode] = useState("core");
  const [scoreName, setScoreName] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <PhaseContainer>
      {existingSession && (
        <SectionCard className="border-amber-900 bg-amber-950/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Session in Progress</p>
          <p className="text-sm font-bold text-white mb-0.5">{existingSession.scoreName || "Unnamed Score"}</p>
          <p className="text-xs text-neutral-400 mb-3">{PHASE_LABELS[existingSession.phase]} — {existingSession.mode === "core" ? "Core" : "Blades '68"}</p>
          <div className="flex gap-2">
            <Btn onClick={onResume} variant="primary" small>Resume</Btn>
            <Btn onClick={onDiscard} variant="ghost" small>Discard &amp; New</Btn>
          </div>
        </SectionCard>
      )}

      {!existingSession && (
        <>
          <PhaseHeader title="New Session" sub="Choose your mode and name the score." icon={FileText} />

          <SectionCard>
            <Label>Game Mode</Label>
            <div className="flex gap-2">
              {[["core","Core","Blades in the Dark"], ["68","'68","Blades '68"]].map(([id, label, sub]) => (
                <button key={id} onClick={() => setMode(id)}
                  className={`flex-1 rounded-xl border p-3 text-center transition-all ${mode === id ? "bg-white text-black border-white" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
                  <div className={`text-sm font-black uppercase ${mode === id ? "text-black" : "text-white"}`}>{label}</div>
                  <div className={`text-[10px] mt-0.5 ${mode === id ? "text-neutral-600" : "text-neutral-600"}`}>{sub}</div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <Label>Score Name</Label>
            <Input value={scoreName} onChange={setScoreName} placeholder='e.g., "The Bellweather Break-In"' />
          </SectionCard>

          <SectionCard>
            <Label>Setup Notes</Label>
            <Textarea value={notes} onChange={setNotes} placeholder="Who's the client? What's the situation?" rows={3} />
          </SectionCard>

          <Btn onClick={() => onBegin({ mode, scoreName: scoreName || "Unnamed Score", setupNotes: notes })}
            variant="primary" className="w-full">
            Begin Score →
          </Btn>
        </>
      )}
    </PhaseContainer>
  );
}

// ─── PHASE: FREE PLAY ────────────────────────────────────────────────────────

function FreePlayPhase({ session, patch, advance }) {
  const data = session.freePlay;
  const [showFortune, setShowFortune] = useState(false);
  const CHECKS = [
    "Establish the fictional situation",
    "Answer player questions about the target",
    "Allow information gathering rolls if needed",
    "Let players set the scene for their characters",
  ];
  return (
    <PhaseContainer>
      <PhaseHeader title="Free Play"
        sub="Characters talk, gather info, establish contacts. When the crew is ready to commit to a score, move on." />
      <SectionCard>
        <Label>GM Checklist</Label>
        <div className="flex flex-col gap-2">
          {CHECKS.map(c => (
            <button key={c} onClick={() => patch("freePlay.checks", { ...data.checks, [c]: !data.checks[c] })}
              className="flex items-center gap-3 text-left">
              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${data.checks[c] ? "bg-white border-white" : "border-neutral-600"}`}>
                {data.checks[c] && <Check size={10} className="text-black" />}
              </div>
              <span className={`text-sm transition-colors ${data.checks[c] ? "text-neutral-500 line-through" : "text-neutral-300"}`}>{c}</span>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard>
        <Label>GM Notes</Label>
        <Textarea value={data.notes} onChange={v => patch("freePlay.notes", v)} placeholder="Notes for free play…" rows={4} />
      </SectionCard>
      <div className="flex gap-2">
        <Btn onClick={() => setShowFortune(true)} variant="ghost" small><Dices size={12} className="inline mr-1" />Fortune Roll</Btn>
      </div>
      <Btn onClick={advance} variant="primary" className="w-full">Move to Score Planning →</Btn>
      {showFortune && <FortuneRollModal label="Free Play Fortune Roll" onClose={() => setShowFortune(false)} />}
    </PhaseContainer>
  );
}

// ─── PHASE: PERSONAL BUSINESS ────────────────────────────────────────────────

function PersonalBusinessPhase({ session, patch, advance }) {
  const data = session.personalBusiness;
  const [showFortune, setShowFortune] = useState(false);
  const activities = session.downtimeActivities;
  const ACTS = DOWNTIME_ACTIVITIES_68;

  const addPlayer = () => {
    const name = prompt("PC name:");
    if (name) patch("downtimeActivities.players", [...(activities.players || []), name]);
  };

  return (
    <PhaseContainer>
      <PhaseHeader title="Personal Business"
        sub="Downtime activities run before the score in Blades '68. PCs handle their personal affairs." />

      {/* Return the Favor */}
      <SectionCard>
        <Label>Return the Favor</Label>
        <button onClick={() => patch("personalBusiness.hasBacking", !data.hasBacking)}
          className="flex items-center gap-3 text-sm text-neutral-300">
          <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${data.hasBacking ? "bg-white border-white" : "border-neutral-600"}`}>
            {data.hasBacking && <Check size={10} className="text-black" />}
          </div>
          A PC has a backing faction
        </button>
        {data.hasBacking && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs text-neutral-500">Roll 1d per instance of help received since last Return the Favor.</p>
            <Btn onClick={() => setShowFortune(true)} variant="ghost" small>Roll Return the Favor</Btn>
            <Textarea value={data.backingNote} onChange={v => patch("personalBusiness.backingNote", v)} placeholder="Record the favor or mission…" rows={2} />
          </div>
        )}
      </SectionCard>

      {/* Downtime activities */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <Label>Downtime Activities</Label>
          <Btn onClick={addPlayer} variant="ghost" small><Plus size={10} className="inline mr-1" />Add PC</Btn>
        </div>
        {(activities.players || []).length === 0 && (
          <p className="text-xs text-neutral-600 text-center py-2">Add players to begin.</p>
        )}
        {(activities.players || []).map((player, pi) => (
          <div key={pi} className="border border-neutral-800 rounded-xl p-3 mb-2">
            <p className="text-sm font-bold text-white mb-2">{player}</p>
            {[0, 1].map(slot => {
              const entryKey = `${pi}-${slot}`;
              const entry = (activities.entries || []).find(e => e.key === entryKey) || {};
              const updateEntry = (field, val) => {
                const entries = [...(activities.entries || [])];
                const idx = entries.findIndex(e => e.key === entryKey);
                if (idx >= 0) entries[idx] = { ...entries[idx], [field]: val };
                else entries.push({ key: entryKey, player, slot, [field]: val });
                patch("downtimeActivities.entries", entries);
              };
              return (
                <div key={slot} className="mb-2">
                  <p className="text-[10px] text-neutral-600 font-bold uppercase mb-1">Activity {slot + 1}</p>
                  <select value={entry.activityId || ""} onChange={e => updateEntry("activityId", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-300 mb-1">
                    <option value="">— Choose activity —</option>
                    {ACTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                  {entry.activityId && (
                    <p className="text-[10px] text-neutral-600 mb-1">{ACTS.find(a => a.id === entry.activityId)?.desc}</p>
                  )}
                  <Input value={entry.notes || ""} onChange={v => updateEntry("notes", v)} placeholder="Notes / result…" />
                </div>
              );
            })}
          </div>
        ))}
      </SectionCard>

      <Btn onClick={advance} variant="primary" className="w-full">Move to Planning Meeting →</Btn>
      {showFortune && <FortuneRollModal label="Return the Favor" pool={1} onClose={() => setShowFortune(false)} />}
    </PhaseContainer>
  );
}

// ─── PHASE: PLANNING MEETING ─────────────────────────────────────────────────

function PlanningMeetingPhase({ session, patch, advance }) {
  const data = session.planningMeeting;

  const addPitch = () => {
    patch("planningMeeting.pitches", [...(data.pitches || []), { id: Date.now(), who: "", what: "" }]);
  };

  const updatePitch = (id, field, val) => {
    patch("planningMeeting.pitches", data.pitches.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  return (
    <PhaseContainer>
      <PhaseHeader title="Planning Meeting" sub="The table pitches score opportunities. Select one and flesh it out." />
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <Label>Opportunity Pitches</Label>
          <Btn onClick={addPitch} variant="ghost" small><Plus size={10} className="inline mr-1" />Add Pitch</Btn>
        </div>
        {(data.pitches || []).map(p => (
          <div key={p.id}
            onClick={() => patch("planningMeeting.selectedPitch", p.id)}
            className={`border rounded-xl p-3 mb-2 cursor-pointer transition-all ${data.selectedPitch === p.id ? "border-white bg-neutral-800" : "border-neutral-800 hover:border-neutral-600"}`}>
            <Input value={p.who} onChange={v => updatePitch(p.id, "who", v)} placeholder="Who's pitching?" />
            <div className="mt-2">
              <Textarea value={p.what} onChange={v => updatePitch(p.id, "what", v)} placeholder="What's the opportunity?" rows={2} />
            </div>
          </div>
        ))}
      </SectionCard>
      <SectionCard>
        <Label>GM Details</Label>
        <Textarea value={data.notes} onChange={v => patch("planningMeeting.notes", v)} placeholder="Flesh out the selected score…" rows={3} />
      </SectionCard>
      <Btn onClick={advance} variant="primary" className="w-full">Move to Score Planning →</Btn>
    </PhaseContainer>
  );
}

// ─── PHASE: SCORE PLAN ───────────────────────────────────────────────────────

function ScorePlanPhase({ session, patch, advance }) {
  const data = session.scorePlan;
  const selected = PLAN_TYPES.find(p => p.id === data.planType);
  return (
    <PhaseContainer>
      <PhaseHeader title="Score Plan" sub="Choose a plan type. The detail is the one thing the crew does to make the plan work." icon={Target} />
      <SectionCard>
        <Label>Plan Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {PLAN_TYPES.map(p => (
            <button key={p.id} onClick={() => patch("scorePlan.planType", p.id)}
              className={`rounded-xl border p-3 text-left transition-all ${data.planType === p.id ? "bg-white border-white" : "bg-neutral-900 border-neutral-800 hover:border-neutral-600"}`}>
              <div className={`text-xs font-black uppercase ${data.planType === p.id ? "text-black" : "text-white"}`}>{p.label}</div>
              <div className={`text-[10px] mt-0.5 ${data.planType === p.id ? "text-neutral-600" : "text-neutral-500"}`}>{p.desc}</div>
              <div className={`text-[9px] mt-1 font-bold ${data.planType === p.id ? "text-neutral-700" : "text-neutral-600"}`}>Detail: {p.detail}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {selected && (
        <SectionCard>
          <Label>The Detail — {selected.detail}</Label>
          <Textarea value={data.planDetail} onChange={v => patch("scorePlan.planDetail", v)} placeholder={`What is the ${selected.detail.toLowerCase()}?`} rows={2} />
        </SectionCard>
      )}

      <SectionCard className="border-neutral-700">
        <p className="text-xs text-neutral-500"><span className="font-bold text-neutral-400">Loadout reminder:</span> Each player chooses Light (3), Normal (5), or Heavy (6). They cannot change load once the score begins.</p>
      </SectionCard>

      <SectionCard>
        <Label>Pre-Score Notes</Label>
        <Textarea value={data.notes} onChange={v => patch("scorePlan.notes", v)} placeholder="Any other setup notes…" rows={2} />
      </SectionCard>

      <Btn onClick={advance} disabled={!data.planType} variant="primary" className="w-full">Roll Engagement →</Btn>
    </PhaseContainer>
  );
}

// ─── PHASE: ENGAGEMENT ROLL ──────────────────────────────────────────────────

function EngagementRollPhase({ session, patch, advance, addRoll }) {
  const data = session.engagement;
  const [showRoll, setShowRoll] = useState(false);

  const modSum = Object.values(data.mods || {}).reduce((sum, v) => sum + (v || 0), 0);
  const basePool = 1 + modSum;
  const isZeroPool = basePool <= 0;

  const POSITION_FOR_RESULT = (v) => {
    if (!v) return null;
    if (v.label === "CRITICAL") return { label: "Controlled + Bonus", color: "gold", desc: "Skip past the first obstacle. Deeper into the action." };
    if (v.value === 6) return { label: "Controlled", color: "green", desc: "Cut to the score with an advantage." };
    if (v.value >= 4) return { label: "Risky", color: "amber", desc: "Cut to the score with normal pressure." };
    return { label: "Desperate", color: "red", desc: "Cut to the score in a dire situation." };
  };

  const pos = POSITION_FOR_RESULT(data.result);

  const handleResult = (outcome, dice) => {
    patch("engagement.result", outcome);
    patch("scoreActive.startingPosition", POSITION_FOR_RESULT(outcome)?.label || "Risky");
    addRoll({ type: "engagement", label: "Engagement Roll", pool: isZeroPool ? -1 : basePool, dice, outcome });
    setShowRoll(false);
  };

  const toggleMod = (id, dir) => {
    const cur = (data.mods || {})[id] || 0;
    const next = cur === dir ? 0 : dir;
    patch("engagement.mods", { ...(data.mods || {}), [id]: next });
  };

  return (
    <PhaseContainer>
      <PhaseHeader title="Engagement Roll"
        sub="Start with 1d. Add or subtract for each factor below." icon={Dices} />

      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <Label>Modifiers</Label>
          <div className="text-right">
            <span className="text-[10px] text-neutral-500">Pool: </span>
            <span className={`text-lg font-black ${isZeroPool ? "text-red-400" : "text-white"}`}>
              {isZeroPool ? "2d ↓" : `${basePool}d`}
            </span>
          </div>
        </div>
        {ENGAGEMENT_MODS.map(m => {
          const cur = (data.mods || {})[m.id] || 0;
          return (
            <div key={m.id} className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <p className="text-xs font-bold text-neutral-300">{m.label}</p>
                <p className="text-[10px] text-neutral-600">{cur === 1 ? m.plus : cur === -1 ? m.minus : "Neutral"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleMod(m.id, -1)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-black border transition-all ${cur === -1 ? "bg-red-600 border-red-500 text-white" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-500"}`}>
                  −1
                </button>
                <button onClick={() => toggleMod(m.id, 1)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-black border transition-all ${cur === 1 ? "bg-green-700 border-green-600 text-white" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:border-neutral-500"}`}>
                  +1
                </button>
              </div>
            </div>
          );
        })}
      </SectionCard>

      {!data.result ? (
        <Btn onClick={() => setShowRoll(true)} variant="primary" className="w-full">
          Roll Engagement ({isZeroPool ? "2d take lowest" : `${basePool}d`})
        </Btn>
      ) : (
        <SectionCard>
          <div className="flex justify-center mb-2"><Badge color={pos.color}>{pos.label}</Badge></div>
          <p className="text-sm text-center text-neutral-400 mb-3">{pos.desc}</p>
          <p className="text-xs text-neutral-600 text-center italic">Describe the scene. Where are they? What's the first obstacle?</p>
          <div className="mt-3">
            <Textarea value={data.notes} onChange={v => patch("engagement.notes", v)} placeholder="Scene description notes…" rows={2} />
          </div>
          <div className="flex gap-2 mt-3 justify-center">
            <Btn onClick={() => patch("engagement.result", null)} variant="ghost" small>Re-Roll</Btn>
            <Btn onClick={advance} variant="primary" small>Begin the Score →</Btn>
          </div>
        </SectionCard>
      )}

      {showRoll && (
        <DiceRollWidget pool={basePool} label="Engagement Roll (Fortune Roll)"
          onResult={handleResult} onClose={() => setShowRoll(false)}
          zeroPoolLabel="0-pool: roll 2d take lowest" />
      )}
    </PhaseContainer>
  );
}

// ─── PHASE: SCORE ACTIVE ─────────────────────────────────────────────────────

function ScoreActivePhase({ session, patch, advance, addRoll }) {
  const data = session.scoreActive;
  const is68 = session.mode === "68";
  const [rollMode, setRollMode] = useState(null); // 'action'|'fortune'|'resistance'|'flashback'
  const [aiLoading, setAiLoading] = useState(null);
  const [aiResult, setAiResult] = useState({});
  const [flashbackText, setFlashbackText] = useState("");
  const [flashbackOpen, setFlashbackOpen] = useState(false);

  const addClock = () => {
    const name = prompt("Clock name:");
    if (!name) return;
    const segs = parseInt(prompt("Segments (4/6/8):", "6") || "6");
    patch("scoreActive.clocks", [...(data.clocks || []), { id: Date.now(), name, segments: segs || 6, filled: 0 }]);
  };

  const tickClock = (id, delta) => {
    patch("scoreActive.clocks", data.clocks.map(c =>
      c.id === id ? { ...c, filled: Math.max(0, Math.min(c.segments, c.filled + delta)) } : c
    ));
  };

  const removeClock = (id) => {
    patch("scoreActive.clocks", data.clocks.filter(c => c.id !== id));
  };

  const askAI = async (clockId, clockName) => {
    setAiLoading(clockId);
    const prompt = `In Blades in the Dark, a clock called "${clockName}" has just filled completely during a score. In 1–2 sentences, describe what happens as a consequence in a dark, gritty Victorian-era setting.`;
    const result = await callGemini(prompt);
    setAiResult(prev => ({ ...prev, [clockId]: result }));
    setAiLoading(null);
  };

  const pos = data.startingPosition;

  return (
    <PhaseContainer>
      {is68 && (
        <SectionCard className="border-neutral-700">
          <p className="text-xs text-neutral-500">
            <span className="font-bold text-amber-400">Blades '68 reminder:</span> Harm is fictional during the score — no mechanical penalties. Harm complications resolve in Aftermath.
          </p>
        </SectionCard>
      )}

      <div className="flex items-center justify-between px-1">
        <PhaseHeader title="Score Active" />
        {pos && <Badge color={pos.includes("Desperate") ? "red" : pos.includes("Risky") ? "amber" : "green"}>{pos}</Badge>}
      </div>

      {/* Roll Panel */}
      <SectionCard>
        <Label>Rolls</Label>
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => setRollMode("action")} variant="ghost" small><Swords size={10} className="inline mr-1" />Action Roll</Btn>
          <Btn onClick={() => setRollMode("fortune")} variant="ghost" small><Dices size={10} className="inline mr-1" />Fortune Roll</Btn>
          <Btn onClick={() => setRollMode("resistance")} variant="ghost" small><Shield size={10} className="inline mr-1" />Resistance</Btn>
          <Btn onClick={() => setFlashbackOpen(true)} variant="ghost" small><RotateCcw size={10} className="inline mr-1" />Flashback</Btn>
        </div>
        {session.rollLog?.length > 0 && (
          <div className="mt-3 border-t border-neutral-800 pt-3">
            <p className="text-[10px] font-bold uppercase text-neutral-600 mb-2">Recent Rolls ({session.rollLog.length})</p>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {[...session.rollLog].reverse().slice(0, 8).map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500 truncate max-w-[60%]">{r.label}</span>
                  {r.outcome && <Badge color={r.outcome.color}>{r.outcome.label}</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Clocks Panel */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <Label>Clocks</Label>
          <Btn onClick={addClock} variant="ghost" small><Plus size={10} className="inline mr-1" />Add Clock</Btn>
        </div>
        {(data.clocks || []).length === 0 && (
          <p className="text-xs text-neutral-600 text-center py-2">No clocks yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {(data.clocks || []).map(c => {
            const full = c.filled >= c.segments;
            return (
              <div key={c.id} className={`border rounded-xl p-3 transition-all ${full ? "border-red-900 bg-red-950/10" : "border-neutral-800"}`}>
                {full && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={12} className="text-red-400" />
                    <span className="text-xs font-black text-red-400 uppercase">CLOCK FULL: {c.name}</span>
                    <button onClick={() => askAI(c.id, c.name)} disabled={aiLoading === c.id}
                      className="ml-auto text-[10px] font-bold text-purple-400 hover:text-purple-300 disabled:opacity-50">
                      {aiLoading === c.id ? "…" : "What Happens? ✨"}
                    </button>
                  </div>
                )}
                {aiResult[c.id] && (
                  <p className="text-xs text-purple-300 italic mb-2 border-l-2 border-purple-800 pl-2">{aiResult[c.id]}</p>
                )}
                <div className="flex items-center gap-3">
                  <ClockSVG segments={c.segments} filled={c.filled} size={52} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    <p className="text-xs text-neutral-500">{c.filled}/{c.segments}</p>
                    <div className="flex gap-1 mt-1.5">
                      <button onClick={() => tickClock(c.id, -1)} className="w-7 h-7 bg-neutral-800 border border-neutral-700 rounded-lg text-white hover:bg-neutral-700 flex items-center justify-center"><Minus size={10} /></button>
                      <button onClick={() => tickClock(c.id, 1)} className="w-7 h-7 bg-neutral-800 border border-neutral-700 rounded-lg text-white hover:bg-neutral-700 flex items-center justify-center"><Plus size={10} /></button>
                      <button onClick={() => removeClock(c.id)} className="w-7 h-7 bg-neutral-800 border border-neutral-700 rounded-lg text-red-500 hover:bg-red-950 flex items-center justify-center ml-auto"><X size={10} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Notes */}
      <SectionCard>
        <Label>GM Notes</Label>
        <Textarea value={data.notes} onChange={v => patch("scoreActive.notes", v)} placeholder="Score notes…" rows={3} />
      </SectionCard>

      {/* Resolution */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 text-center">Score Resolution</p>
        <Btn onClick={() => { patch("scoreActive.outcome", "succeeded"); advance(); }} variant="primary" className="w-full">Score Succeeded →</Btn>
        <Btn onClick={() => { patch("scoreActive.outcome", "failed"); advance(); }} variant="danger" className="w-full">Score Failed / Partial →</Btn>
      </div>

      {/* Roll Modals */}
      {rollMode === "action" && (
        <ActionRollWizard onClose={() => setRollMode(null)} onResult={entry => { addRoll({ type: "action", ...entry }); }} />
      )}
      {rollMode === "fortune" && (
        <FortuneRollModal label="Fortune Roll" onClose={() => setRollMode(null)} onResult={r => addRoll({ type: "fortune", label: "Fortune Roll", outcome: r })} />
      )}
      {rollMode === "resistance" && (
        <ResistanceRollModal onClose={() => setRollMode(null)} />
      )}
      {flashbackOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setFlashbackOpen(false)}>
          <div className="bg-[#111113] border border-neutral-800 rounded-3xl p-5 w-full max-w-xs flex flex-col gap-3">
            <div className="flex justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Flashback</p>
              <button onClick={() => setFlashbackOpen(false)}><X size={14} className="text-neutral-600" /></button>
            </div>
            <p className="text-xs text-neutral-400">A flashback shows something the character prepared in advance. The GM sets the stress cost (1, 2, or "impossible").</p>
            <Textarea value={flashbackText} onChange={setFlashbackText} placeholder="What is the flashback?" rows={3} />
            <div className="flex gap-2">
              {["0 stress (simple)", "1 stress (minor effort)", "2 stress (serious effort)"].map(cost => (
                <button key={cost} onClick={() => { addRoll({ type: "flashback", label: flashbackText, cost }); setFlashbackOpen(false); setFlashbackText(""); }}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg py-1.5 text-[9px] text-neutral-400 font-bold uppercase hover:bg-neutral-700 transition-all">
                  {cost}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </PhaseContainer>
  );
}

// ─── PHASE: DOWNTIME PAYOFF ──────────────────────────────────────────────────

function DowntimePayoffPhase({ session, patch, advance }) {
  const data = session.downtimePayoff;
  const rep = data.quiet ? 0 : data.targetTier;
  return (
    <PhaseContainer>
      <PhaseHeader title="Payoff" sub="Calculate the crew's reward from the score." />
      <SectionCard>
        <Label>Rep</Label>
        <Stepper value={data.targetTier} onChange={v => patch("downtimePayoff.targetTier", v)} min={0} max={4} label="Target Tier" />
        <button onClick={() => patch("downtimePayoff.quiet", !data.quiet)} className="flex items-center gap-3 mt-3 text-sm text-neutral-300">
          <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${data.quiet ? "bg-white border-white" : "border-neutral-600"}`}>
            {data.quiet && <Check size={10} className="text-black" />}
          </div>
          Kept completely quiet (Rep = 0)
        </button>
        <p className="text-sm font-bold text-white mt-2">+{rep} Rep</p>
      </SectionCard>
      <SectionCard>
        <Label>Coin</Label>
        <div className="flex flex-col gap-1 mb-2">
          {[[2,"Minor job"],[4,"Small job"],[6,"Standard score"],[8,"Big score"],[10,"Major score"]].map(([v, l]) => (
            <button key={v} onClick={() => patch("downtimePayoff.coin", v)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm transition-all ${data.coin === v ? "bg-white border-white text-black" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
              <span className={`font-black w-6 ${data.coin === v ? "text-black" : "text-white"}`}>{v}</span>
              <span>{l}</span>
            </button>
          ))}
        </div>
        <Input value={data.coinNotes} onChange={v => patch("downtimePayoff.coinNotes", v)} placeholder="What was the loot?" />
      </SectionCard>
      <SectionCard>
        <Label>Tithe</Label>
        <button onClick={() => patch("downtimePayoff.hasTithe", !data.hasTithe)} className="flex items-center gap-3 text-sm text-neutral-300">
          <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${data.hasTithe ? "bg-white border-white" : "border-neutral-600"}`}>
            {data.hasTithe && <Check size={10} className="text-black" />}
          </div>
          Crew owes a tithe
        </button>
        {data.hasTithe && <p className="text-xs text-amber-400 mt-2">Subtract [Tier + 1] coin as tithe to the boss.</p>}
      </SectionCard>
      <Btn onClick={advance} variant="primary" className="w-full">Move to Heat →</Btn>
    </PhaseContainer>
  );
}

// ─── PHASE: HEAT ─────────────────────────────────────────────────────────────

function DowntimeHeatPhase({ session, patch, advance }) {
  const data = session.downtimeHeat;
  const modTotal = HEAT_MODS.reduce((sum, m) => sum + (data.mods?.[m.id] ? m.amount : 0), 0);
  const total = (data.baseHeat || 0) + modTotal;

  const BASE_OPTS = [[0,"Smooth & quiet"],[2,"Contained"],[4,"Loud & chaotic"],[6,"Wild"]];

  return (
    <PhaseContainer>
      <PhaseHeader title="Heat" sub="Tally exposure from the score." />
      <SectionCard>
        <Label>Base Heat</Label>
        <div className="flex flex-col gap-1">
          {BASE_OPTS.map(([v, l]) => (
            <button key={v} onClick={() => patch("downtimeHeat.baseHeat", v)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm transition-all ${data.baseHeat === v ? "bg-white border-white text-black" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
              <span className={`font-black w-4 ${data.baseHeat === v ? "text-black" : "text-white"}`}>{v}</span>
              <span>{l}</span>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard>
        <Label>Heat Modifiers</Label>
        {HEAT_MODS.map(m => (
          <button key={m.id} onClick={() => patch("downtimeHeat.mods", { ...data.mods, [m.id]: !data.mods?.[m.id] })}
            className="flex items-center gap-3 mb-2 text-sm text-neutral-300 w-full text-left">
            <div className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center ${data.mods?.[m.id] ? "bg-white border-white" : "border-neutral-600"}`}>
              {data.mods?.[m.id] && <Check size={10} className="text-black" />}
            </div>
            <span className="flex-1">{m.label}</span>
            <span className={`text-xs font-black ${data.mods?.[m.id] ? "text-red-400" : "text-neutral-600"}`}>+{m.amount}</span>
          </button>
        ))}
        <div className="border-t border-neutral-800 pt-2 mt-1 flex justify-between">
          <span className="text-sm text-neutral-400">Total Heat</span>
          <span className="text-lg font-black text-white">{total}</span>
        </div>
      </SectionCard>
      <SectionCard>
        <Label>Wanted Level</Label>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${i < data.wantedLevel ? "bg-red-900 border-red-700" : "bg-neutral-900 border-neutral-800"}`}>
                <Skull size={12} className={i < data.wantedLevel ? "text-red-400" : "text-neutral-700"} />
              </div>
            ))}
          </div>
          <Stepper value={data.wantedLevel} onChange={v => patch("downtimeHeat.wantedLevel", Math.max(0, Math.min(4, v)))} min={0} max={4} />
        </div>
        {total >= 9 && <p className="text-xs text-red-400 mt-2 font-bold">Heat maxed! Wanted Level increases, heat resets.</p>}
      </SectionCard>
      <Btn onClick={() => { patch("downtimeHeat.totalHeat", total); advance(); }} variant="primary" className="w-full">Roll Entanglements →</Btn>
    </PhaseContainer>
  );
}

// ─── PHASE: ENTANGLEMENTS ────────────────────────────────────────────────────

function DowntimeEntanglementsPhase({ session, patch, advance, addRoll }) {
  const data = session.downtimeEntanglements;
  const heat = session.downtimeHeat?.totalHeat || 0;
  const wl = session.downtimeHeat?.wantedLevel || 0;
  const pool = wl === 0 ? -1 : wl;
  const heatTier = heat >= 6 ? "high" : heat >= 4 ? "medium" : "low";
  const [showRoll, setShowRoll] = useState(false);

  const getEntanglement = (die) => {
    const rows = ENTANGLEMENT_TABLE[heatTier];
    if (!rows) return null;
    return rows.find(r => die >= r.range[0] && die <= r.range[1]) || rows[rows.length - 1];
  };

  const handleResult = (outcome, dice) => {
    const die = outcome.value;
    const sixes = dice.filter(v => v === 6).length;
    const effectiveDie = sixes >= 2 ? 8 : die;
    const ent = getEntanglement(effectiveDie);
    patch("downtimeEntanglements.result", { die: effectiveDie, entanglement: ent, rawOutcome: outcome });
    addRoll({ type: "fortune", label: "Entanglement Roll", pool, dice, outcome });
    setShowRoll(false);
  };

  const ent = data.result?.entanglement;

  return (
    <PhaseContainer>
      <PhaseHeader title="Entanglements" sub="What complication does the crew face?" icon={Skull} />
      <SectionCard>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-neutral-400">Heat Level</span>
          <Badge color={heatTier === "high" ? "red" : heatTier === "medium" ? "amber" : "gray"}>
            {heatTier} heat ({heat})
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Wanted Level</span>
          <span className="font-bold text-white">{wl} → Roll {pool < 0 ? "2d take lowest" : `${wl}d`}</span>
        </div>
      </SectionCard>
      {!ent ? (
        <Btn onClick={() => setShowRoll(true)} variant="primary" className="w-full">Roll Entanglement</Btn>
      ) : (
        <SectionCard className="border-amber-900">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Entanglement</p>
          <p className="text-lg font-black text-white mb-1">{ent.name}</p>
          <p className="text-xs text-neutral-400 mb-3">{ent.desc}</p>
          <p className="text-xs text-neutral-600 italic mb-2">How do you handle this?</p>
          <Textarea value={data.notes} onChange={v => patch("downtimeEntanglements.notes", v)} placeholder="Record what happened…" rows={2} />
          <div className="flex gap-2 mt-3">
            <Btn onClick={() => patch("downtimeEntanglements.result", null)} variant="ghost" small>Re-Roll</Btn>
            <Btn onClick={advance} variant="primary" small>Downtime Activities →</Btn>
          </div>
        </SectionCard>
      )}
      {showRoll && (
        <DiceRollWidget pool={Math.max(1, wl)} label="Entanglement Roll"
          onResult={handleResult} onClose={() => setShowRoll(false)} />
      )}
    </PhaseContainer>
  );
}

// ─── PHASE: DOWNTIME ACTIVITIES ──────────────────────────────────────────────

function DowntimeActivitiesPhase({ session, patch, advance }) {
  const data = session.downtimeActivities;
  const ACTS = session.mode === "68" ? DOWNTIME_ACTIVITIES_68 : DOWNTIME_ACTIVITIES_CORE;
  const [activeRoll, setActiveRoll] = useState(null);

  const addPlayer = () => {
    const name = prompt("PC name:");
    if (name) patch("downtimeActivities.players", [...(data.players || []), name]);
  };

  const updateEntry = (key, field, val) => {
    const entries = [...(data.entries || [])];
    const idx = entries.findIndex(e => e.key === key);
    if (idx >= 0) entries[idx] = { ...entries[idx], [field]: val };
    else entries.push({ key, [field]: val });
    patch("downtimeActivities.entries", entries);
  };

  return (
    <PhaseContainer>
      <PhaseHeader title="Downtime Activities" sub="Each PC takes 2 free downtime activities." icon={Clock} />
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <Label>Players</Label>
          <Btn onClick={addPlayer} variant="ghost" small><Plus size={10} className="inline mr-1" />Add PC</Btn>
        </div>
        {(data.players || []).length === 0 && (
          <p className="text-xs text-neutral-600 text-center py-2">Add PCs to track their activities.</p>
        )}
        {(data.players || []).map((player, pi) => (
          <div key={pi} className="border border-neutral-800 rounded-xl p-3 mb-3">
            <p className="text-sm font-bold text-white mb-2">{player}</p>
            {[0, 1].map(slot => {
              const key = `${pi}-${slot}`;
              const entry = (data.entries || []).find(e => e.key === key) || {};
              const act = ACTS.find(a => a.id === entry.activityId);
              return (
                <div key={slot} className="mb-3 last:mb-0">
                  <p className="text-[10px] text-neutral-600 font-bold uppercase mb-1">Activity {slot + 1} {entry.done ? "✓" : ""}</p>
                  <select value={entry.activityId || ""} onChange={e => updateEntry(key, "activityId", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-300 mb-1">
                    <option value="">— Choose activity —</option>
                    {ACTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                  {act && <p className="text-[10px] text-neutral-600 mb-1">{act.desc}</p>}
                  {act && act.roll !== "none" && (
                    <Btn onClick={() => setActiveRoll({ key, player, act })} variant="ghost" small className="mb-1">
                      <Dices size={10} className="inline mr-1" />{act.roll === "action" ? "Action Roll" : "Fortune Roll"}
                    </Btn>
                  )}
                  <Input value={entry.notes || ""} onChange={v => updateEntry(key, "notes", v)} placeholder="Result / notes…" />
                </div>
              );
            })}
          </div>
        ))}
      </SectionCard>
      <Btn onClick={advance} variant="primary" className="w-full">Complete Downtime →</Btn>
      {activeRoll && activeRoll.act?.roll === "action" && (
        <ActionRollWizard onClose={() => setActiveRoll(null)} onResult={() => setActiveRoll(null)} />
      )}
      {activeRoll && activeRoll.act?.roll === "fortune" && (
        <FortuneRollModal label={`${activeRoll.player} — ${activeRoll.act.label}`} onClose={() => setActiveRoll(null)} />
      )}
    </PhaseContainer>
  );
}

// ─── PHASE: AFTERMATH HARM (68 only) ────────────────────────────────────────

function AftermathHarmPhase({ session, patch, advance }) {
  const data = session.aftermathHarm;
  const players = session.downtimeActivities?.players || session.personalBusiness?.activities?.map(a => a.player) || [];
  const [showRoll, setShowRoll] = useState(null);

  const getPlayer = (name) => (data.players || []).find(p => p.name === name) || { name, tookHarm: false, harmDesc: "", result: null };

  const updatePlayer = (name, field, val) => {
    const cur = getPlayer(name);
    const updated = { ...cur, [field]: val };
    const arr = [...(data.players || [])];
    const idx = arr.findIndex(p => p.name === name);
    if (idx >= 0) arr[idx] = updated;
    else arr.push(updated);
    patch("aftermathHarm.players", arr);
  };

  const HARM_TEXT = {
    "CRITICAL":       "Shrug it off — fully recovered.",
    "FULL SUCCESS":   "Clean — no lasting complication.",
    "PARTIAL":        "Minor complication — setback, manageable.",
    "FAILURE":        "Serious complication — lasting consequence.",
  };

  return (
    <PhaseContainer>
      <PhaseHeader title="Harm Complications" sub="Every PC who took harm rolls for lasting complications." />
      {players.length === 0 && <p className="text-xs text-neutral-600 text-center">No players found. Go back and add PCs in Personal Business.</p>}
      {players.map(name => {
        const p = getPlayer(name);
        return (
          <SectionCard key={name}>
            <p className="text-sm font-bold text-white mb-2">{name}</p>
            <button onClick={() => updatePlayer(name, "tookHarm", !p.tookHarm)} className="flex items-center gap-3 text-sm text-neutral-300 mb-2">
              <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${p.tookHarm ? "bg-white border-white" : "border-neutral-600"}`}>
                {p.tookHarm && <Check size={10} className="text-black" />}
              </div>
              Took harm this score
            </button>
            {p.tookHarm && (
              <div className="flex flex-col gap-2">
                <Input value={p.harmDesc || ""} onChange={v => updatePlayer(name, "harmDesc", v)} placeholder='e.g., "Level 2: Gunshot wound"' />
                {p.harmDesc?.includes("Level 4") || p.harmDesc?.includes("level 4") ? (
                  <p className="text-xs text-red-400 font-bold"><AlertTriangle size={12} className="inline mr-1" />Mortal injury! They will die without intervention.</p>
                ) : null}
                {!p.result ? (
                  <Btn onClick={() => setShowRoll(name)} variant="ghost" small>Roll Harm Complications</Btn>
                ) : (
                  <div>
                    <div className="flex justify-center mb-1"><Badge color={p.result.color}>{p.result.label}</Badge></div>
                    <p className="text-xs text-neutral-500 text-center">{HARM_TEXT[p.result.label]}</p>
                    <Input value={p.note || ""} onChange={v => updatePlayer(name, "note", v)} placeholder="What happened?" />
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        );
      })}
      <Btn onClick={advance} variant="primary" className="w-full">Move to Unwind →</Btn>
      {showRoll && (
        <DiceRollWidget pool={2} label={`Harm — ${showRoll}`}
          onResult={r => { updatePlayer(showRoll, "result", r); setShowRoll(null); }}
          onClose={() => setShowRoll(null)} />
      )}
    </PhaseContainer>
  );
}

// ─── PHASE: AFTERMATH UNWIND (68 only) ──────────────────────────────────────

function AftermathUnwindPhase({ session, patch, advance }) {
  const data = session.aftermathUnwind;
  return (
    <PhaseContainer>
      <PhaseHeader title="Unwind" sub="The crew debriefs and blows off steam." />
      <SectionCard className="border-neutral-700">
        <p className="text-sm text-neutral-400 italic">
          "Play the unwind scene. The crew is somewhere safe — a bar, their base, a parked car outside.
          They decompress together. What do they talk about? What just happened? Where do things stand?"
        </p>
      </SectionCard>
      <SectionCard>
        <Label>Scene Notes</Label>
        <Textarea value={data.notes} onChange={v => patch("aftermathUnwind.notes", v)} placeholder="Record scene highlights…" rows={4} />
      </SectionCard>
      <SectionCard>
        <button onClick={() => patch("aftermathUnwind.keysHit", !data.keysHit)} className="flex items-center gap-3 text-sm text-neutral-300">
          <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${data.keysHit ? "bg-white border-white" : "border-neutral-600"}`}>
            {data.keysHit && <Check size={10} className="text-black" />}
          </div>
          A PC hit a Key during the unwind scene
        </button>
        {data.keysHit && (
          <div className="mt-2">
            <Textarea value={data.keysNotes} onChange={v => patch("aftermathUnwind.keysNotes", v)} placeholder="Which PC, which Key?" rows={2} />
          </div>
        )}
      </SectionCard>
      <Btn onClick={advance} variant="primary" className="w-full">View Recap →</Btn>
    </PhaseContainer>
  );
}

// ─── PHASE: RECAP ────────────────────────────────────────────────────────────

function RecapPhase({ session, onEnd }) {
  const sp = session.scorePlan;
  const eng = session.engagement;
  const sa = session.scoreActive;
  const pay = session.downtimePayoff || session.aftermathPayoff;
  const heat = session.downtimeHeat || session.aftermathHeat;
  const ent = session.downtimeEntanglements;
  const da = session.downtimeActivities;
  const plan = PLAN_TYPES.find(p => p.id === sp?.planType);
  const rep = pay ? (pay.quiet ? 0 : pay.targetTier) : 0;

  const copyRecap = () => {
    const lines = [
      `THE ${session.scoreName?.toUpperCase() || "SCORE"}`,
      `Mode: ${session.mode === "core" ? "Blades in the Dark Core" : "Blades '68"}`,
      `──────────────────────────`,
      plan ? `Plan: ${plan.label} — ${sp.planDetail}` : "Plan: —",
      sa?.startingPosition ? `Engagement: → ${sa.startingPosition}` : "Engagement: —",
      `Outcome: ${sa?.outcome || "—"}`,
      `──────────────────────────`,
      `PAYOFF`,
      `Rep: +${rep}   Coin: ${pay?.coin || 0}`,
      `──────────────────────────`,
      `HEAT & WANTED`,
      `Heat: ${heat?.totalHeat || 0}   Wanted Level: ${heat?.wantedLevel || 0}`,
      `──────────────────────────`,
      ent?.result?.entanglement ? `ENTANGLEMENT: ${ent.result.entanglement.name}` : "ENTANGLEMENT: —",
      `──────────────────────────`,
      `ROLLS THIS SESSION: ${session.rollLog?.length || 0}`,
    ].join("\n");
    navigator.clipboard.writeText(lines).catch(() => {});
  };

  return (
    <PhaseContainer>
      <PhaseHeader title="Recap" sub="Session complete." icon={Archive} />
      <SectionCard className="font-mono text-xs">
        <p className="text-white font-black text-base mb-1">{session.scoreName || "Unnamed Score"}</p>
        <p className="text-neutral-500 mb-3">{session.mode === "core" ? "Blades in the Dark — Core" : "Blades '68"}</p>
        <div className="border-t border-neutral-800 pt-2 space-y-1 text-neutral-400">
          {plan && <p><span className="text-neutral-600">Plan:</span> {plan.label} — {sp.planDetail || "—"}</p>}
          {sa?.startingPosition && <p><span className="text-neutral-600">Engagement:</span> {sa.startingPosition}</p>}
          {sa?.outcome && <p><span className="text-neutral-600">Outcome:</span> <span className={sa.outcome === "succeeded" ? "text-green-400" : "text-red-400"}>{sa.outcome}</span></p>}
        </div>
        <div className="border-t border-neutral-800 pt-2 mt-2 space-y-1 text-neutral-400">
          <p className="text-[10px] font-black uppercase text-neutral-600 mb-1">Payoff</p>
          <p>Rep: <span className="text-white font-bold">+{rep}</span> &nbsp; Coin: <span className="text-white font-bold">{pay?.coin || 0}</span></p>
        </div>
        <div className="border-t border-neutral-800 pt-2 mt-2 space-y-1 text-neutral-400">
          <p className="text-[10px] font-black uppercase text-neutral-600 mb-1">Heat</p>
          <p>Total Heat: <span className="text-white font-bold">{heat?.totalHeat || 0}</span> &nbsp; Wanted: <span className="text-white font-bold">{heat?.wantedLevel || 0}</span></p>
        </div>
        {ent?.result?.entanglement && (
          <div className="border-t border-neutral-800 pt-2 mt-2 text-neutral-400">
            <p className="text-[10px] font-black uppercase text-neutral-600 mb-1">Entanglement</p>
            <p className="text-white font-bold">{ent.result.entanglement.name}</p>
            {ent.notes && <p className="text-neutral-500 text-[10px] mt-0.5">{ent.notes}</p>}
          </div>
        )}
        {(da?.players || []).length > 0 && (
          <div className="border-t border-neutral-800 pt-2 mt-2">
            <p className="text-[10px] font-black uppercase text-neutral-600 mb-1">Downtime</p>
            {da.players.map((player, pi) => {
              const entries = (da.entries || []).filter(e => e.key?.startsWith(`${pi}-`));
              return entries.map(e => (
                <p key={e.key} className="text-neutral-400">{player} — {e.activityId || "—"}{e.notes ? ` → ${e.notes}` : ""}</p>
              ));
            })}
          </div>
        )}
        <div className="border-t border-neutral-800 pt-2 mt-2 text-neutral-500">
          <p>Rolls this session: <span className="text-white font-bold">{session.rollLog?.length || 0}</span></p>
        </div>
      </SectionCard>
      <div className="flex gap-2">
        <Btn onClick={copyRecap} variant="ghost" className="flex-1"><Copy size={12} className="inline mr-1" />Copy Recap</Btn>
        <Btn onClick={onEnd} variant="danger" className="flex-1"><Archive size={12} className="inline mr-1" />End &amp; Archive</Btn>
      </div>
    </PhaseContainer>
  );
}

// ─── MAIN VIEW ───────────────────────────────────────────────────────────────

export default function ScoreRunnerView() {
  const { session, setSession, patch, advance, back, addRoll, clearSession } = useScoreSession();

  const beginSession = ({ mode, scoreName, setupNotes }) => {
    const s = DEFAULT_SESSION();
    const seq = PHASE_SEQUENCES[mode];
    setSession({ ...s, mode, scoreName, setupNotes, phase: seq[0] });
  };

  const endSession = () => {
    if (window.confirm("Archive this session and start fresh? This cannot be undone.")) {
      clearSession();
    }
  };

  // If no active session or session with no phase, show new session screen
  if (!session || !session.phase) {
    return (
      <div className="w-full min-h-full bg-[#09090b] px-3 py-4">
        <NewSessionScreen
          onBegin={beginSession}
          existingSession={session?.phase ? session : null}
          onResume={() => {}}
          onDiscard={clearSession}
        />
      </div>
    );
  }

  const renderPhase = () => {
    const props = { session, patch, advance, back, addRoll };
    switch (session.phase) {
      case "free_play":                return <FreePlayPhase {...props} />;
      case "personal_business":        return <PersonalBusinessPhase {...props} />;
      case "planning_meeting":         return <PlanningMeetingPhase {...props} />;
      case "score_plan":               return <ScorePlanPhase {...props} />;
      case "score_engagement":         return <EngagementRollPhase {...props} />;
      case "score_active":             return <ScoreActivePhase {...props} />;
      case "downtime_payoff":
      case "aftermath_payoff":         return <DowntimePayoffPhase {...props} />;
      case "downtime_heat":
      case "aftermath_heat":           return <DowntimeHeatPhase {...props} />;
      case "downtime_entanglements":   return <DowntimeEntanglementsPhase {...props} />;
      case "downtime_activities":      return <DowntimeActivitiesPhase {...props} />;
      case "aftermath_harm":           return <AftermathHarmPhase {...props} />;
      case "aftermath_unwind":         return <AftermathUnwindPhase {...props} />;
      case "recap":                    return <RecapPhase session={session} onEnd={endSession} />;
      default:                         return <p className="text-neutral-500 text-sm p-4">Unknown phase: {session.phase}</p>;
    }
  };

  return (
    <div className="w-full min-h-full bg-[#09090b] flex flex-col">
      <PhaseStrip session={session} onBack={back} />
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <style>{`
          @keyframes dieReveal { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
          .hide-scroll::-webkit-scrollbar{width:4px}
          .hide-scroll::-webkit-scrollbar-thumb{background:#27272a;border-radius:10px}
        `}</style>
        {renderPhase()}
      </div>
    </div>
  );
}
