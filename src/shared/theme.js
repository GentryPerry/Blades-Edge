/**
 * shared/theme.js — Design tokens for Blades Edge.
 *
 * Single source of truth for colors, fonts, animation classes.
 * Both rulesets share the same structural tokens; accent colors differ.
 *
 * Ruleset accent derivation:
 *   BitD Core  → red/crimson  (#E04A3A family)
 *   Blades '68 → amber/gold   (#D9A441 family)
 */

// ─── CSS custom properties injected once into the document ───────────────────

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,400;1,6..72,600;1,6..72,800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
  /* Surfaces */
  --bg0: #0F0D0C;
  --bg1: #13110F;
  --bg-card: #15110F;
  --bg-card-hi: #1B1614;
  --bg-sidebar: #0B0908;

  /* Typography */
  --paper: #F2E7D6;
  --muted: rgba(242,231,214,0.45);
  --dim:   rgba(242,231,214,0.25);

  /* Borders */
  --border:     rgba(255,255,255,0.06);
  --border-mid: rgba(255,255,255,0.12);

  /* Fonts */
  --font-serif: 'Newsreader', Georgia, serif;
  --font-sans:  'Inter', system-ui, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Mono', monospace;

  /* Animations */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── BitD Core accent (default) ─────────────────── */
[data-ruleset="bitd"], :root {
  --accent:       #E04A3A;
  --accent-soft:  #F08A6E;
  --accent-deep:  #8E1F1A;
  --rule:         rgba(224,74,58,0.25);
}

/* ── Blades '68 accent ──────────────────────────── */
[data-ruleset="b68"] {
  --accent:       #D9A441;
  --accent-soft:  #F2C76A;
  --accent-deep:  #7A5410;
  --rule:         rgba(217,164,65,0.30);
}

/* ── GM Flow ambient ─────────────────────────────── */
[data-gmmode="true"] .gm-ambient {
  background: radial-gradient(120% 80% at 50% -20%, rgba(127,29,29,0.15) 0%, transparent 60%);
}

/* ── Animations ─────────────────────────────────── */
@keyframes fadeIn    { from { opacity: 0 }                              to { opacity: 1 } }
@keyframes scaleIn   { from { opacity: 0; transform: scale(0.95) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
@keyframes slideUp   { from { opacity: 0; transform: translateY(15px) }  to { opacity: 1; transform: translateY(0) } }

.animate-fade-in  { animation: fadeIn  0.2s ease-out forwards }
.animate-scale-in { animation: scaleIn 0.25s var(--ease-spring) forwards }
.animate-slide-up { animation: slideUp 0.3s var(--ease-spring) forwards; opacity: 0 }

/* ── Scrollbar ───────────────────────────────────── */
::-webkit-scrollbar       { width: 4px }
::-webkit-scrollbar-track { background: transparent }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px }

/* ── Noise texture overlay ───────────────────────── */
.be-noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
}
.be-noise::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(120% 60% at 50% -10%, var(--accent, #E04A3A)10 0%, var(--accent, #E04A3A)04 30%, transparent 60%);
  opacity: 0.8;
}
.be-noise svg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0.055; mix-blend-mode: overlay; pointer-events: none;
}

/* ── Tappable rule terms ─────────────────────────── */
.rule-term {
  color: var(--accent-soft);
  border-bottom: 1px dotted rgba(240,138,110,0.4);
  cursor: pointer;
  font-weight: 600;
  transition: color 0.15s;
}
.rule-term:hover { color: var(--accent) }

/* ── Card base ───────────────────────────────────── */
.be-card {
  background: var(--bg-card);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px;
  padding: 18px;
}

/* ── Section label ───────────────────────────────── */
.be-section-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--accent);
  margin-bottom: 10px;
}

/* ── Step button (tracker +/-) ───────────────────── */
.be-step-btn {
  height: 28px;
  width: 28px;
  border-radius: 2px;
  border: 1px solid var(--border-mid);
  background: var(--bg-card-hi);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 16px;
  transition: background 0.1s, color 0.1s;
}
.be-step-btn:hover {
  background: rgba(255,255,255,0.08);
  color: var(--paper);
}
`;

// ─── Crew type → ruleset mapping ─────────────────────────────────────────────

export const CREW_RULESET = {
  bitd: ['Bravos', 'Assassins', 'Hawkers', 'Shadows', 'Smugglers', 'Cult', 'Hunters'],
  b68:  ['Hit Squad', 'Dealers', 'Militants', 'Racers', 'Utopians'],
};

export function deriveRuleset(crewType) {
  if (CREW_RULESET.bitd.includes(crewType)) return 'bitd';
  if (CREW_RULESET.b68.includes(crewType))  return 'b68';
  return 'bitd'; // default
}

// ─── Source accent colors (reference compendium) ─────────────────────────────

export function accentColor(src = '') {
  const s = src.toLowerCase();
  if (s.includes('deep cut')) return { bar: '#991b1b', title: '#fca5a5', badge: 'rgba(127,29,29,0.7)', badgeTxt: '#fca5a5', dot: '#ef4444' };
  if (s.includes('b68') || s.includes('68')) return { bar: '#1d4ed8', title: '#93c5fd', badge: 'rgba(30,58,138,0.7)', badgeTxt: '#93c5fd', dot: '#3b82f6' };
  return { bar: '#404040', title: '#f5f5f5', badge: 'rgba(38,38,38,0.9)', badgeTxt: '#a3a3a3', dot: '#737373' };
}
