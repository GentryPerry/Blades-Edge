/**
 * nav/TopBar.jsx — Application header bar.
 *
 * Shows crew context, search trigger, dice roller trigger, and logout.
 * Extracted from App.jsx monolith.
 */

import React from 'react';

const SearchIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="6.2"/><path d="M16 16l4.2 4.2"/>
  </svg>
);

const DiceIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="4" width="16" height="16" rx="2.5"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
    <circle cx="15" cy="9" r="1" fill="currentColor"/>
    <circle cx="9" cy="15" r="1" fill="currentColor"/>
    <circle cx="15" cy="15" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

export default function TopBar({ crewName, crewType, tier, onSearch, onDice, onLogout }) {
  const btnStyle = {
    height: 33, padding: '0 12px', borderRadius: 3,
    border: '1px solid var(--border-mid)', background: 'transparent',
    color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
    fontFamily: 'var(--font-sans)', fontSize: 12,
    display: 'flex', alignItems: 'center', gap: 7,
    transition: 'border-color 0.15s',
  };

  return (
    <header style={{
      height: 54, flexShrink: 0, padding: '0 26px',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', zIndex: 2,
      background: 'linear-gradient(180deg, rgba(21,17,15,.9), transparent)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {crewName && (
          <>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, fontWeight: 600, color: 'var(--paper)' }}>
              {crewName}
            </span>
            <span style={{ fontSize: 11, color: 'var(--dim)' }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              {crewType}
            </span>
            {tier != null && (
              <span style={{ padding: '3px 8px', border: '1px solid rgba(224,74,58,.4)', borderRadius: 2, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)' }}>
                TIER {tier}
              </span>
            )}
          </>
        )}
        {!crewName && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--accent)' }}>
            BLADES · EDGE
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={btnStyle} onClick={onDice} title="Dice roller">
          <DiceIcon />
          Roll dice
        </button>

        <button style={{ ...btnStyle, minWidth: 200, justifyContent: 'space-between' }} onClick={onSearch}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}><SearchIcon /></span>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)' }}>Search the reference…</span>
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 5px', border: '1px solid var(--border-mid)', color: 'var(--muted)', borderRadius: 2 }}>⌘K</span>
        </button>

        {onLogout && (
          <button onClick={onLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--dim)', padding: '4px 8px', fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}>
            LOGOUT
          </button>
        )}
      </div>
    </header>
  );
}
