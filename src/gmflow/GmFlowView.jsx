/**
 * gmflow/GmFlowView.jsx — GM Flow interactive session guide.
 *
 * New feature (not in original codebase).
 * Persistent state: saved to api/gmFlow.save() on every change,
 * falls back to localStorage if backend not yet available.
 *
 * Phase structure is defined in gmflow.data.js (imported below).
 * Tracker values that map to Crew sheet fields (heat, rep, wanted)
 * are synced via the parent's activeCrew state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { gmFlow as gmFlowApi } from '../api/client.js';

// ── Phase data ────────────────────────────────────────────────────────────────

const BITD_PHASES = [
  { k: 'free', label: 'Free Play', sub: 'Roleplay & info',
    steps: [
      { id: 'free_scene',   label: 'Set the scene' },
      { id: 'free_info',    label: 'Gather information rolls' },
      { id: 'free_advance', label: 'Advance clocks (off-screen)' },
    ], refs: ['Fortune Roll', 'Position & Effect'] },
  { k: 'score', label: 'The Score', sub: 'Engage · act · finish',
    steps: [
      { id: 'sc_target',  label: 'Choose target & plan' },
      { id: 'sc_load',    label: 'Set loadout' },
      { id: 'sc_engage',  label: 'Roll Engagement', roll: true },
      { id: 'sc_play',    label: 'Action rolls & consequences' },
      { id: 'sc_done',    label: 'Mark score complete' },
    ], refs: ['Engagement Roll', 'The Action Roll', 'Consequences'] },
  { k: 'downtime', label: 'Downtime', sub: 'Payoff & entanglements',
    steps: [
      { id: 'dt_payoff',   label: 'Payoff (rep + coin)' },
      { id: 'dt_heat',     label: 'Heat & wanted level' },
      { id: 'dt_entangle', label: 'Entanglements', table: true },
      { id: 'dt_acts',     label: 'Each PC: 2 downtime activities' },
    ], refs: ['Heat', 'Entanglements'] },
];

const B68_PHASES = [
  { k: 'pb', label: 'Personal Business', sub: 'Recover & scheme',
    steps: [
      { id: 'pb_indulge',  label: 'Indulge / unwind' },
      { id: 'pb_recover',  label: 'Recover harm' },
      { id: 'pb_cohort',   label: 'Cohort actions' },
    ], refs: ['Stacks', 'Keys'] },
  { k: 'plan', label: 'Planning Meeting', sub: 'Pick the job',
    steps: [
      { id: 'plan_target', label: 'Choose target & opportunity' },
      { id: 'plan_shots',  label: 'Called shots (optional)' },
      { id: 'plan_assign', label: 'Cohort assignments' },
    ], refs: ['Score Rolodex'] },
  { k: 'score', label: 'The Score', sub: 'Run the op',
    steps: [
      { id: 'sc_load',    label: 'Set loadout' },
      { id: 'sc_engage',  label: 'Roll Engagement', roll: true },
      { id: 'sc_play',    label: 'Action rolls & harm' },
      { id: 'sc_finish',  label: 'Mark completion' },
    ], refs: ['Engagement Roll', 'The Action Roll'] },
  { k: 'aftermath', label: 'Aftermath', sub: 'Pay & price',
    steps: [
      { id: 'af_pay',     label: 'Payout (stacks + rep)' },
      { id: 'af_heat',    label: 'Heat update' },
      { id: 'af_faction', label: 'Faction status changes' },
      { id: 'af_unwind',  label: 'Unwind scene' },
    ], refs: ['Heat', 'Trouble Engine'] },
];

const ENTANGLEMENTS = [
  'Gang Trouble','Gang Trouble','Gang Trouble','The Bluecoats','Usual Suspects',
  'Cooperation','Cooperation','Demonic Notice','Demonic Notice','Reprisals','Reprisals','Reprisals',
];

function outcomeOf(dice) {
  const sixes = dice.filter(d => d === 6).length;
  const hi    = Math.max(...dice);
  if (sixes >= 2) return 'Critical — great position, great effect.';
  if (hi === 6)   return 'Full success — controlled engagement.';
  if (hi >= 4)    return 'Partial — risky position. Pay a price.';
  return 'Failure — desperate position.';
}

const EMPTY_STATE = {
  phase: null,   // set to phases[0].k on first render
  checks: {},
  notes: {},
  trackers: { heat: 0, rep: 0, wanted: 0, vault: 0 },
  rolls: [],
};

function loadLocal(userId) {
  try { return JSON.parse(localStorage.getItem(`gm_flow_${userId}`) || 'null'); } catch { return null; }
}
function saveLocal(userId, state) {
  try { localStorage.setItem(`gm_flow_${userId}`, JSON.stringify(state)); } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GmFlowView({ userId, ruleset, activeCrew, params }) {
  const phases = ruleset === 'b68' ? B68_PHASES : BITD_PHASES;

  const [flowState, setFlowStateRaw] = useState(null);
  const [loading, setLoading]        = useState(true);
  const [useLocal, setUseLocal]      = useState(false);

  // Load persisted state
  useEffect(() => {
    const crewId = activeCrew?.id || null;
    gmFlowApi.get(crewId)
      .then(data => { setFlowStateRaw(data || { ...EMPTY_STATE, phase: phases[0].k }); setLoading(false); })
      .catch(() => {
        const local = loadLocal(userId);
        setFlowStateRaw(local || { ...EMPTY_STATE, phase: phases[0].k });
        setUseLocal(true);
        setLoading(false);
      });
  }, [userId, ruleset]);

  // Save on every change
  const setFlowState = useCallback((next) => {
    setFlowStateRaw(next);
    if (useLocal) {
      saveLocal(userId, next);
    } else {
      const crewId = activeCrew?.id || null;
      gmFlowApi.save(crewId, next).catch(() => saveLocal(userId, next));
    }
  }, [useLocal, userId, activeCrew]);

  if (loading || !flowState) {
    return <div style={{ padding: 60, textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--muted)' }}>Loading GM Flow…</div>;
  }

  const activePhase  = phases.find(p => p.k === flowState.phase) || phases[0];
  const toggle       = (id) => setFlowState({ ...flowState, checks: { ...flowState.checks, [id]: !flowState.checks[id] } });
  const setNote      = (k, v) => setFlowState({ ...flowState, notes: { ...flowState.notes, [k]: v } });
  const setTracker   = (k, v) => setFlowState({ ...flowState, trackers: { ...flowState.trackers, [k]: Math.max(0, v) } });
  const pushRoll     = (label, dice, outcome) => setFlowState({ ...flowState, rolls: [{ label, dice, outcome, t: Date.now() }, ...flowState.rolls].slice(0, 12) });
  const phaseProgress = (p) => { const done = p.steps.filter(s => flowState.checks[s.id]).length; return { done, total: p.steps.length, pct: Math.round(done / p.steps.length * 100) }; };

  const doEngagement = () => {
    const dice = [Math.ceil(Math.random()*6), Math.ceil(Math.random()*6)];
    pushRoll('Engagement', dice, outcomeOf(dice));
  };
  const doEntangle = () => {
    const r = Math.ceil(Math.random() * 12);
    pushRoll('Entanglement', [r], `Roll ${r}: ${ENTANGLEMENTS[r-1]}`);
  };

  return (
    <div style={{ padding: '28px 36px 60px', maxWidth: 1100, margin: '0 auto', color: 'var(--paper)', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--accent)' }}>
          GM FLOW · {ruleset === 'b68' ? '4-PHASE LOOP' : '3-PHASE LOOP'}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1 }}>
          Running the session
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', marginTop: 7 }}>
          State persists across sessions. Trackers sync to the Crew sheet.
        </div>
      </div>

      {/* Phase tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {phases.map(p => {
          const isActive = p.k === flowState.phase;
          const prog     = phaseProgress(p);
          return (
            <button key={p.k} onClick={() => setFlowState({ ...flowState, phase: p.k })} style={{
              flex: '1 1 160px', textAlign: 'left', cursor: 'pointer',
              padding: '12px 14px', borderRadius: 3,
              background: isActive ? `linear-gradient(180deg, rgba(224,74,58,.16), rgba(224,74,58,.04))` : 'var(--bg-card)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,.08)'}`,
              color: 'var(--paper)', transition: 'all 0.2s',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isActive ? 'var(--accent)' : 'var(--muted)', letterSpacing: '0.16em', marginBottom: 3 }}>{p.sub.toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700 }}>{p.label}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--dim)', marginTop: 4 }}>{prog.done}/{prog.total}</div>
              <div style={{ marginTop: 6, height: 2, background: 'rgba(255,255,255,.07)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ width: prog.pct + '%', height: '100%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)', transition: 'width 0.3s' }} />
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        {/* Left: checklist + refs + notes */}
        <div>
          <div className="be-section-label">{activePhase.label.toUpperCase()} · CHECKLIST</div>
          <div className="be-card">
            {activePhase.steps.map((s, i) => {
              const done = flowState.checks[s.id];
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < activePhase.steps.length - 1 ? '1px dotted rgba(255,255,255,.08)' : 'none' }}>
                  <button onClick={() => toggle(s.id)} style={{
                    width: 22, height: 22, borderRadius: 2, cursor: 'pointer', flexShrink: 0,
                    background: done ? 'var(--accent)' : 'transparent',
                    border: `1.5px solid ${done ? 'var(--accent)' : 'rgba(255,255,255,.25)'}`,
                    display: 'grid', placeItems: 'center', color: '#fff', transition: 'all 0.15s',
                  }}>
                    {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: done ? 'var(--dim)' : 'var(--paper)', textDecoration: done ? 'line-through' : 'none' }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em', marginTop: 2 }}>STEP {String(i+1).padStart(2,'0')}</div>
                  </div>
                  {s.roll && (
                    <button onClick={doEngagement} style={{ height: 28, padding: '0 10px', borderRadius: 2, cursor: 'pointer', background: 'var(--bg-card-hi)', color: 'var(--accent-soft)', border: '1px solid rgba(224,74,58,.4)', fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                      ⚄ Roll 2d
                    </button>
                  )}
                  {s.table && (
                    <button onClick={doEntangle} style={{ height: 28, padding: '0 10px', borderRadius: 2, cursor: 'pointer', background: 'var(--bg-card-hi)', color: 'var(--accent-soft)', border: '1px solid rgba(224,74,58,.4)', fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                      ⚄ Roll table
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="be-section-label" style={{ marginTop: 20 }}>REFERENCE CALLOUTS</div>
          <div className="be-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {activePhase.refs.map(r => (
              <span key={r} style={{ padding: '6px 12px', border: '1px solid rgba(224,74,58,.25)', borderRadius: 2, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--accent-soft)', cursor: 'pointer' }}>{r}</span>
            ))}
            <p style={{ width: '100%', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>Tap any term to surface the rule.</p>
          </div>

          <div className="be-section-label" style={{ marginTop: 20 }}>SESSION NOTES · {activePhase.label.toUpperCase()}</div>
          <textarea
            value={flowState.notes[activePhase.k] || ''}
            onChange={e => setNote(activePhase.k, e.target.value)}
            placeholder={`Notes for ${activePhase.label}…`}
            style={{ width: '100%', minHeight: 100, padding: 14, borderRadius: 3, background: 'var(--bg-card)', color: 'var(--paper)', border: '1px solid rgba(255,255,255,.07)', outline: 'none', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* Right: trackers + roll history */}
        <div>
          <div className="be-section-label">LIVE TRACKERS · SYNCED</div>
          <div className="be-card">
            {[['heat','Heat',9],['rep','Rep',12],['wanted','Wanted',4],['vault','Vault',null]].map(([k,label,max], i) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 3 ? '1px dotted rgba(255,255,255,.08)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--paper)' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setTracker(k, flowState.trackers[k] - 1)} className="be-step-btn">−</button>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 800, minWidth: 28, textAlign: 'center' }}>{flowState.trackers[k]}</span>
                  <button onClick={() => setTracker(k, max ? Math.min(max, flowState.trackers[k] + 1) : flowState.trackers[k] + 1)} className="be-step-btn">+</button>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--dim)', textAlign: 'right' }}>{max ? `/${max}` : '—'}</span>
              </div>
            ))}
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--dim)', marginTop: 10 }}>Updates mirror to the Crew sheet.</p>
          </div>

          <div className="be-section-label" style={{ marginTop: 20 }}>ROLL HISTORY</div>
          <div className="be-card">
            {flowState.rolls.length === 0
              ? <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)' }}>No rolls yet this session.</div>
              : flowState.rolls.slice(0, 8).map((r, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: i < Math.min(flowState.rolls.length, 8) - 1 ? '1px dotted rgba(255,255,255,.07)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.16em' }}>{r.label.toUpperCase()}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {r.dice.map((d, j) => (
                        <div key={j} style={{ width: 20, height: 20, display: 'grid', placeItems: 'center', background: 'var(--bg-card-hi)', border: `1px solid ${d === 6 ? 'var(--accent)' : 'rgba(255,255,255,.18)'}`, borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: d === 6 ? 'var(--accent-soft)' : 'rgba(255,255,255,.6)' }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>{r.outcome}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
