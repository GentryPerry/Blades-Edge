/**
 * nav/Sidebar.jsx — Left rail navigation for Blades Edge.
 *
 * Extracted from the monolithic App.jsx sidebar.
 * Receives screen/gmMode state and navigate callbacks via props.
 * No data fetching, no localStorage — pure nav UI.
 */

import React from 'react';
import { SCREENS } from './useAppRouter.js';

const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8.5" r="3.2"/>
    <path d="M5 19.5c.8-3.4 3.8-5.2 7-5.2s6.2 1.8 7 5.2"/>
  </svg>
);
const CrewIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="2.6"/><circle cx="16" cy="10" r="2.2"/>
    <path d="M3.5 18.5c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4M14.5 14.5c1.5 0 4 1 5 4"/>
  </svg>
);
const BookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 5.2C4 4.5 4.5 4 5.2 4H11v15.5H5.2A1.2 1.2 0 014 18.3V5.2zM20 5.2A1.2 1.2 0 0018.8 4H13v15.5h5.8A1.2 1.2 0 0020 18.3V5.2z"/>
  </svg>
);
const CrownIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8l3.8 4.5L12 6l5.2 6.5L21 8v9.8a1.2 1.2 0 01-1.2 1.2H4.2A1.2 1.2 0 013 17.8V8z"/>
  </svg>
);
const OrnamentIcon = () => (
  <svg viewBox="0 0 80 12" width="40" height="6" fill="none" stroke="var(--accent)" strokeWidth="1">
    <path d="M2 6h26"/><path d="M52 6h26"/>
    <circle cx="40" cy="6" r="2.6" fill="var(--accent)" stroke="none"/>
  </svg>
);

const NAV_ITEMS = [
  { screen: SCREENS.CHARACTER, label: 'Character', Icon: UserIcon },
  { screen: SCREENS.CREW,      label: 'Crew',      Icon: CrewIcon  },
  { screen: SCREENS.REFERENCE, label: 'Reference', Icon: BookIcon  },
];

export default function Sidebar({ screen, gmMode, toggleGmMode, navigate, user, crewName, crewType, ruleset }) {
  const items = gmMode
    ? [{ screen: SCREENS.GMFLOW, label: 'GM Flow', Icon: CrownIcon }, ...NAV_ITEMS.slice(1)]
    : NAV_ITEMS;

  return (
    <aside style={{
      width: 232, flexShrink: 0, height: '100%',
      background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2,
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', color: 'var(--accent)' }}>BLADES · EDGE</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 800, fontStyle: 'italic', marginTop: 5, color: 'var(--paper)', letterSpacing: '-0.01em' }}>
          {user?.name || user?.email?.split('@')[0] || 'Scoundrel'}
        </div>
        {crewName && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            {crewName}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {items.map(({ screen: s, label, Icon }) => {
          const active = screen === s;
          return (
            <button key={s} onClick={() => navigate(s)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 11px', borderRadius: 3, marginBottom: 2,
              background: active ? `linear-gradient(90deg, rgba(224,74,58,.14), rgba(224,74,58,.04))` : 'transparent',
              border: 'none', cursor: 'pointer', position: 'relative',
              color: active ? 'var(--paper)' : 'rgba(255,255,255,0.65)',
              fontSize: 14, fontWeight: active ? 600 : 500,
              fontFamily: 'var(--font-serif)', letterSpacing: '-0.005em',
              textAlign: 'left', transition: 'color 0.15s',
            }}>
              {active && (
                <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
              )}
              <span style={{ color: active ? 'var(--accent)' : 'rgba(255,255,255,0.4)', display: 'grid', placeItems: 'center' }}>
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Ruleset chip */}
      {ruleset && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--dim)', marginBottom: 5 }}>RULESET</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--paper)' }}>
              {ruleset === 'b68' ? "Blades '68" : 'Blades in the Dark'}
            </span>
          </div>
          {crewType && (
            <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 3 }}>via crew type: {crewType}</div>
          )}
        </div>
      )}

      {/* Ornament divider */}
      <div style={{ padding: '6px 16px', display: 'flex', justifyContent: 'center', opacity: 0.4 }}>
        <OrnamentIcon />
      </div>

      {/* GM Mode toggle */}
      <div style={{ padding: '10px 14px 16px', borderTop: '1px solid var(--border)' }}>
        <button onClick={toggleGmMode} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 3, cursor: 'pointer',
          background: gmMode ? 'var(--accent)' : 'transparent',
          border: `1px solid ${gmMode ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`,
          color: gmMode ? '#fff' : 'rgba(255,255,255,0.75)',
          fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CrownIcon /> GM Mode
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.8 }}>
            {gmMode ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
    </aside>
  );
}
