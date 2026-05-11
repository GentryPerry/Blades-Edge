/**
 * crew/CrewView.jsx — Crew screen shell.
 *
 * Owns: crew list, selected crew, join/create/leave flows.
 * Renders: crew picker list or the existing CrewManager sheet.
 *
 * CrewManager.jsx internals preserved. This shell replaces direct
 * PocketBase calls with api/client.js crews.* functions.
 */

import React, { useState, useEffect } from 'react';
import { crews as crewApi } from '../api/client.js';
import CrewManager from '../CrewManager.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

function loadLocal()    { try { return JSON.parse(localStorage.getItem('crews_v2') || '[]'); } catch { return []; } }
function saveLocal(arr) { try { localStorage.setItem('crews_v2', JSON.stringify(arr)); } catch {} }

export default function CrewView({ userId, params, navigate, onCrewChange }) {
  const [crewList, setCrewList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [useLocal, setUseLocal] = useState(false);

  useEffect(() => {
    crewApi.list()
      .then(data => { setCrewList(data); setLoading(false); })
      .catch(() => {
        setCrewList(loadLocal());
        setUseLocal(true);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => { if (useLocal) saveLocal(crewList); }, [crewList, useLocal]);

  // Notify parent when active crew changes (drives topbar + ruleset)
  const handleCrewChange = (crew) => {
    if (onCrewChange) onCrewChange(crew ? { name: crew.name, type: crew.type, tier: crew.tier } : { name: null, type: null, tier: null });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 36px', textAlign: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--muted)' }}>
        Loading crews…
      </div>
    );
  }

  return (
    <ErrorBoundary label="CrewManager">
      <CrewManager
        userId={userId}
        onCrewSelect={handleCrewChange}
      />
    </ErrorBoundary>
  );
}
