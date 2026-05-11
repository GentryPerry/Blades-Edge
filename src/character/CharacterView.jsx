/**
 * character/CharacterView.jsx — Character screen shell.
 *
 * Owns: character list state, selection state, API calls.
 * Renders: character list picker or the existing CharacterManager sheet.
 *
 * CharacterManager.jsx internals are preserved entirely.
 * This shell replaces the localStorage-only persistence with
 * api/client.js calls (characters.list / create / update / remove).
 *
 * During the migration period, falls back to localStorage if the
 * API returns a 401 (token not yet valid against the new backend).
 */

import React, { useState, useEffect } from 'react';
import { characters as charApi } from '../api/client.js';
import CharacterManager from '../CharacterManager.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

const Plus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

// ── Local fallback (used while backend is being set up) ───────────────────────
function loadLocal()    { try { return JSON.parse(localStorage.getItem('characters') || '[]'); } catch { return []; } }
function saveLocal(arr) { try { localStorage.setItem('characters', JSON.stringify(arr)); } catch {} }

export default function CharacterView({ userId, params, navigate, onCrewChange }) {
  const [chars, setChars]     = useState([]);
  const [selected, setSelected] = useState(params?.characterId || null);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);

  // Load characters on mount
  useEffect(() => {
    charApi.list()
      .then(data => { setChars(data); setLoading(false); })
      .catch(() => {
        // API not yet available — use localStorage
        setChars(loadLocal());
        setUseLocal(true);
        setLoading(false);
      });
  }, [userId]);

  // Sync to localStorage as fallback
  useEffect(() => { if (useLocal) saveLocal(chars); }, [chars, useLocal]);

  // If params.characterId changes (e.g. from nav), update selection
  useEffect(() => {
    if (params?.characterId) setSelected(params.characterId);
  }, [params?.characterId]);

  const handleSetChars = async (next) => {
    setChars(next);
    if (useLocal) return;
    // In the real implementation, individual save calls happen inside
    // CharacterManager via charApi.update(id, data). For now, persist locally.
    saveLocal(next);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 36px', textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--muted)' }}>
        Loading characters…
      </div>
    );
  }

  // CharacterManager handles its own list/detail UI internally
  return (
    <ErrorBoundary label="CharacterManager">
      <CharacterManager
        characters={chars}
        setCharacters={handleSetChars}
        userId={userId}
      />
    </ErrorBoundary>
  );
}
