/**
 * nav/useAppRouter.js — Explicit screen routing for Blades Edge.
 *
 * Replaces the 6-variable implicit router (tab, role, activeCatId,
 * showFavorites, showReader, showBitDReader) in the original App.jsx
 * with a single `screen` value and a typed `params` object.
 *
 * Valid screens:
 *   'character'   — character list or open character sheet
 *   'crew'        — crew list or open crew sheet
 *   'reference'   — rules reference browser
 *   'gmflow'      — GM flow guide (only visible when gmMode is on)
 *
 * params shape per screen:
 *   character:  { characterId?: string, tab?: 'sheet'|'playbook'|'identity'|'notes' }
 *   crew:       { crewId?: string, tab?: 'sheet'|'upgrades'|'cohorts'|'claims'|'members' }
 *   reference:  { tab?: string, section?: string, query?: string }
 *   gmflow:     { phase?: string }
 */

import { useState, useCallback } from 'react';

export const SCREENS = {
  CHARACTER: 'character',
  CREW:      'crew',
  REFERENCE: 'reference',
  GMFLOW:    'gmflow',
};

export function useAppRouter(initialScreen = SCREENS.CHARACTER) {
  const [screen, setScreenRaw] = useState(initialScreen);
  const [params, setParams]    = useState({});
  const [gmMode, setGmMode]    = useState(false);

  const navigate = useCallback((nextScreen, nextParams = {}) => {
    setScreenRaw(nextScreen);
    setParams(nextParams);
  }, []);

  const toggleGmMode = useCallback(() => {
    setGmMode(prev => {
      const next = !prev;
      // Auto-switch: entering GM mode → gmflow, leaving → character
      if (next && screen !== SCREENS.GMFLOW) {
        setScreenRaw(SCREENS.GMFLOW);
        setParams({});
      } else if (!next && screen === SCREENS.GMFLOW) {
        setScreenRaw(SCREENS.CHARACTER);
        setParams({});
      }
      return next;
    });
  }, [screen]);

  // Convenience navigators
  const goCharacter  = useCallback((characterId, tab) => navigate(SCREENS.CHARACTER, { characterId, tab }), [navigate]);
  const goCrew       = useCallback((crewId, tab)       => navigate(SCREENS.CREW,      { crewId, tab }),       [navigate]);
  const goReference  = useCallback((section, query)    => navigate(SCREENS.REFERENCE, { section, query }),    [navigate]);
  const goGmFlow     = useCallback((phase)              => navigate(SCREENS.GMFLOW,    { phase }),             [navigate]);

  return {
    screen,
    params,
    gmMode,
    navigate,
    toggleGmMode,
    goCharacter,
    goCrew,
    goReference,
    goGmFlow,
  };
}
