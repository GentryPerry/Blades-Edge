/**
 * App.jsx — Root application shell for Blades Edge v2.
 *
 * Responsibilities (and only these):
 *   1. Auth gate — render AuthScreen until user is logged in
 *   2. Screen routing via useAppRouter
 *   3. Overlay management (search, dice)
 *   4. Layout shell (sidebar + topbar + content area)
 *   5. Inject global CSS tokens once
 */

import React, { useState, useEffect } from 'react';
import { useAuth }        from './auth/useAuth.js';
import AuthScreen         from './auth/AuthScreen.jsx';
import { useAppRouter, SCREENS } from './nav/useAppRouter.js';
import Sidebar            from './nav/Sidebar.jsx';
import TopBar             from './nav/TopBar.jsx';
import { SearchOverlay, DiceOverlay } from './shared/Overlays.jsx';
import { GLOBAL_CSS, deriveRuleset }  from './shared/theme.js';
import ErrorBoundary      from './ErrorBoundary.jsx';

import CharacterView  from './character/CharacterView.jsx';
import CrewView       from './crew/CrewView.jsx';
import ReferenceView  from './reference/ReferenceView.jsx';
import GmFlowView     from './gmflow/GmFlowView.jsx';

const EMPTY_CREW = { name: null, type: null, tier: null };

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const router = useAppRouter(SCREENS.CHARACTER);

  const [activeCrew, setActiveCrew] = useState(EMPTY_CREW);
  const ruleset = deriveRuleset(activeCrew.type);

  const [searchOpen, setSearchOpen] = useState(false);
  const [diceOpen,   setDiceOpen]   = useState(false);
  const [visibleSources] = useState(['BitD Core', 'Deep Cuts', 'B68']);

  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setDiceOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#0F0D0C', display: 'grid', placeItems: 'center' }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', color: '#E04A3A' }}>BLADES · EDGE</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <AuthScreen onLogin={login} onRegister={register} />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', background: 'var(--bg0)', color: 'var(--paper)', position: 'relative' }}
      data-ruleset={ruleset}
      data-gmmode={router.gmMode ? 'true' : 'false'}
    >
      <style>{GLOBAL_CSS}</style>

      <div className="be-noise" aria-hidden="true">
        <svg><filter id="be-noise"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0.7 0"/></filter><rect width="100%" height="100%" filter="url(#be-noise)"/></svg>
      </div>

      <Sidebar
        screen={router.screen}
        gmMode={router.gmMode}
        toggleGmMode={router.toggleGmMode}
        navigate={router.navigate}
        user={user}
        crewName={activeCrew.name}
        crewType={activeCrew.type}
        ruleset={activeCrew.type ? ruleset : null}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <TopBar
          crewName={activeCrew.name}
          crewType={activeCrew.type}
          tier={activeCrew.tier}
          onSearch={() => setSearchOpen(true)}
          onDice={() => setDiceOpen(true)}
          onLogout={logout}
        />

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
          {router.screen === SCREENS.CHARACTER && (
            <ErrorBoundary label="Character">
              <CharacterView userId={user.id} params={router.params} navigate={router.goCharacter} onCrewChange={setActiveCrew} />
            </ErrorBoundary>
          )}
          {router.screen === SCREENS.CREW && (
            <ErrorBoundary label="Crew">
              <CrewView userId={user.id} params={router.params} navigate={router.goCrew} onCrewChange={setActiveCrew} />
            </ErrorBoundary>
          )}
          {router.screen === SCREENS.REFERENCE && (
            <ErrorBoundary label="Reference">
              <ReferenceView ruleset={ruleset} visibleSources={visibleSources} params={router.params} />
            </ErrorBoundary>
          )}
          {router.screen === SCREENS.GMFLOW && router.gmMode && (
            <ErrorBoundary label="GM Flow">
              <GmFlowView userId={user.id} ruleset={ruleset} activeCrew={activeCrew} params={router.params} />
            </ErrorBoundary>
          )}
        </div>
      </main>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} sources={visibleSources} />}
      {diceOpen   && <DiceOverlay  onClose={() => setDiceOpen(false)} />}
    </div>
  );
}
