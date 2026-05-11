/**
 * shared/Overlays.jsx — Global overlays: search (⌘K) and dice roller.
 *
 * Extracted from App.jsx. Logic unchanged.
 * DiceOverlay replaces the separate diceroller.jsx for in-app modal use;
 * the original diceroller.jsx is kept for the standalone dice screen.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DB } from '../database.js';
import { RuleModal } from '../reference/RuleModal.jsx';

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="6.2"/><path d="M16 16l4.2 4.2"/>
  </svg>
);

// ─── ⌘K Search overlay ───────────────────────────────────────────────────────

export function SearchOverlay({ onClose, sources }) {
  const [q, setQ]         = useState('');
  const [modal, setModal] = useState(null);
  const inputRef          = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return DB.filter(r => sources.includes(r.source)).slice(0, 12);
    return DB.filter(r =>
      sources.includes(r.source) &&
      ['title','content','tags','preview','sub','sub-subcategory'].some(k => r[k]?.toLowerCase().includes(ql))
    ).slice(0, 20);
  }, [q, sources]);

  if (modal) return <RuleModal rule={modal} onClose={() => setModal(null)} />;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 90, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', left: '50%', top: 80, transform: 'translateX(-50%)',
        width: 600, maxWidth: '92vw', maxHeight: '70vh',
        background: 'var(--bg-card)', border: '1px solid rgba(224,74,58,.4)',
        borderRadius: 4, boxShadow: '0 30px 80px rgba(0,0,0,.6)',
        zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(224,74,58,.2)' }}>
          <SearchIcon />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search the reference…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--paper)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18 }}
          />
          <span onClick={onClose} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', border: '1px solid var(--border-mid)', color: 'var(--muted)', cursor: 'pointer', borderRadius: 2 }}>ESC</span>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {results.map(r => (
            <button key={r.id} onClick={() => { onClose(); setModal(r); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 20px',
              border: 'none', cursor: 'pointer', background: 'transparent',
              borderBottom: '1px dotted rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, color: 'var(--paper)' }}>{r.title}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em' }}>OPEN ↗</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{r.preview}</div>
            </button>
          ))}
          {results.length === 0 && (
            <div style={{ padding: '30px 20px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>
              No results for "{q}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Dice roller overlay ──────────────────────────────────────────────────────

const ROLL_TYPES = ['Action', 'Resistance', 'Engagement', 'Fortune'];

export function DiceOverlay({ onClose, initialPool = 2 }) {
  const [pool, setPool] = useState(initialPool);
  const [type, setType] = useState('Action');
  const [last, setLast] = useState(null);

  const roll = () => {
    const n    = Math.max(0, pool);
    const dice = Array.from({ length: Math.max(1, n) }, () => Math.floor(Math.random() * 6) + 1);
    const sixes = dice.filter(d => d === 6).length;
    const hi    = n === 0 ? Math.min(...dice) : Math.max(...dice);
    let outcome;
    if (n === 0)        outcome = hi === 6 ? 'Success' : hi >= 4 ? 'Partial — with consequence' : 'Failure';
    else if (sixes >= 2) outcome = 'Critical — increased effect!';
    else if (hi === 6)   outcome = 'Success';
    else if (hi >= 4)    outcome = 'Partial — with consequence';
    else                 outcome = 'Failure';
    setLast({ dice, outcome, pool: n, type });
  };

  const btnStyle = { flex: 1, padding: '7px 0', borderRadius: 2, cursor: 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 90, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 440, maxWidth: '92vw',
        background: 'var(--bg-card)', border: '1px solid rgba(224,74,58,.4)',
        borderRadius: 4, boxShadow: '0 30px 80px rgba(0,0,0,.6)',
        padding: 24, zIndex: 100, color: 'var(--paper)', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--accent)' }}>DICE ROLLER</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 18 }}>Roll the dice</div>

        {/* Roll type */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {ROLL_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              ...btnStyle,
              background: t === type ? 'rgba(224,74,58,.18)' : 'transparent',
              border: `1px solid ${t === type ? 'var(--accent)' : 'rgba(255,255,255,.14)'}`,
              color: t === type ? 'var(--accent-soft)' : 'rgba(255,255,255,.65)',
            }}>{t}</button>
          ))}
        </div>

        {/* Pool */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15 }}>Pool</span>
          <button onClick={() => setPool(p => Math.max(0, p - 1))} className="be-step-btn">−</button>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 800, minWidth: 56, textAlign: 'center' }}>{pool}d</span>
          <button onClick={() => setPool(p => Math.min(8, p + 1))} className="be-step-btn">+</button>
          {pool === 0 && <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--accent-soft)' }}>Roll 2, take lowest.</span>}
        </div>

        <button onClick={roll} style={{
          width: '100%', padding: '13px 0', borderRadius: 2,
          background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase',
          boxShadow: '0 12px 28px -8px var(--accent)',
        }}>
          Roll {type}
        </button>

        {last && (
          <div style={{ marginTop: 20, padding: 16, border: '1px solid rgba(224,74,58,.4)', borderRadius: 3, background: 'var(--bg-card-hi)' }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              {last.dice.map((d, i) => (
                <div key={i} style={{
                  width: 44, height: 44, borderRadius: 4, display: 'grid', placeItems: 'center',
                  background: d === 6 ? 'var(--accent)' : 'transparent',
                  border: `1.5px solid ${d === 6 ? 'var(--accent)' : d >= 4 ? 'var(--accent-soft)' : 'rgba(255,255,255,.2)'}`,
                  color: d === 6 ? '#fff' : d >= 4 ? 'var(--accent-soft)' : 'rgba(255,255,255,.5)',
                  fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800,
                  boxShadow: d === 6 ? '0 0 12px var(--accent)' : 'none',
                }}>{d}</div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18 }}>{last.outcome}</div>
          </div>
        )}
      </div>
    </>
  );
}
