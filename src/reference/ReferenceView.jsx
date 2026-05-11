/**
 * reference/ReferenceView.jsx — Rules reference browser.
 *
 * Houses: category/tab nav, rule tile grid, RuleModal, BladesReader link.
 * Ported from App.jsx reference sections. Logic unchanged.
 */

import React, { useState, useMemo } from 'react';
import { DB } from '../database.js';
import { RuleTile, RuleModal } from './RuleModal.jsx';
import { ALL_SOURCES } from '../gamedata.jsx';
import BladesReader from '../BladesReader.jsx';
import { Star, Search, BookOpen } from 'lucide-react';

const BITD_CATS = [
  { id: 'Actions',        label: 'Actions',          cat: 'Player',      sub: 'Actions' },
  { id: 'Rolls',          label: 'Rolls',             cat: 'Player',      sub: 'Rolls' },
  { id: 'Pos & Effect',   label: 'Position & Effect', cat: 'Player',      sub: 'Pos & Effect' },
  { id: 'Downtime',       label: 'Downtime',          cat: 'Player',      sub: 'Downtime' },
  { id: 'Teamwork',       label: 'Teamwork',          cat: 'Player',      sub: 'Teamwork' },
  { id: 'Consequences',   label: 'Consequences',      cat: 'Player',      sub: 'Consequences' },
  { id: 'Playbooks',      label: 'Playbooks',         cat: 'Player',      sub: 'Playbooks' },
  { id: 'Standard Items', label: 'Items',             cat: 'Player',      sub: 'Standard Items' },
  { id: 'Heritage',       label: 'Heritage',          cat: 'Player',      sub: 'Heritage' },
  { id: 'Background',     label: 'Background',        cat: 'Player',      sub: 'Background' },
  { id: 'Trauma',         label: 'Trauma',            cat: 'Player',      sub: 'Trauma' },
  { id: 'Crew Types',     label: 'Crew Types',        cat: 'Crew',        sub: 'Playbooks' },
  { id: 'Cohorts',        label: 'Cohorts',           cat: 'Crew',        sub: 'Cohorts' },
  { id: 'Entanglements',  label: 'Entanglements',     cat: 'Storyteller', sub: 'Entanglements' },
  { id: 'Factions',       label: 'Factions',          cat: 'World',       sub: 'Factions' },
  { id: 'Setting',        label: 'Setting',           cat: 'World',       sub: 'Setting' },
  { id: 'GM Rules',       label: 'GM Rules',          cat: 'Storyteller', sub: 'Rules' },
];

export default function ReferenceView({ ruleset, visibleSources, params }) {
  const [tab, setTab]         = useState(BITD_CATS[0].id);
  const [modal, setModal]     = useState(null);
  const [q, setQ]             = useState(params?.query || '');
  const [favorites, setFavs]  = useState(() => { try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; } });
  const [showFavs, setShowFavs] = useState(false);
  const [showReader, setShowReader] = useState(null); // 'b68' | 'bitd' | null

  const toggleFav = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const activeTab = BITD_CATS.find(c => c.id === tab);

  const rules = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return DB.filter(r => {
      if (!visibleSources.includes(r.source)) return false;
      if (ql) return ['title','content','tags','preview','sub','sub-subcategory'].some(k => r[k]?.toLowerCase().includes(ql));
      if (showFavs) return favorites.includes(r.id);
      if (!activeTab) return false;
      return r.category?.toLowerCase() === activeTab.cat.toLowerCase()
          && r.subcategory?.toLowerCase() === activeTab.sub.toLowerCase();
    });
  }, [q, tab, visibleSources, showFavs, favorites, activeTab]);

  if (showReader) {
    const src = showReader === 'b68' ? '/blades_book/blades68_reference.html' : '/blades_book/bitd_reference.html';
    return <BladesReader src={src} onExit={() => setShowReader(null)} />;
  }

  const tabStyle = (id) => ({
    padding: '7px 14px', borderRadius: 3, border: '1px solid',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'all 0.15s',
    background:   tab === id && !showFavs ? 'rgba(255,255,255,0.08)' : 'transparent',
    borderColor:  tab === id && !showFavs ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
    color:        tab === id && !showFavs ? 'var(--paper)' : 'var(--muted)',
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search + tab strip */}
      <div style={{ flexShrink: 0, padding: '16px 24px 0', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search rules, tags, factions…"
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3,
              paddingLeft: 36, paddingRight: q ? 36 : 14, paddingTop: 10, paddingBottom: 10,
              color: 'var(--paper)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>×</button>
          )}
        </div>

        {/* Tab strip — only shown when not searching */}
        {!q && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' }}>
            <button onClick={() => { setShowFavs(true); }} style={{ ...tabStyle('__favs'), background: showFavs ? 'rgba(251,191,36,0.1)' : 'transparent', borderColor: showFavs ? '#fbbf24' : 'rgba(255,255,255,0.07)', color: showFavs ? '#fbbf24' : 'var(--muted)' }}>
              <Star size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} fill={showFavs ? 'currentColor' : 'none'} />
              Favorites
            </button>
            {BITD_CATS.map(c => (
              <button key={c.id} onClick={() => { setTab(c.id); setShowFavs(false); }} style={tabStyle(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 60px' }}>
        {rules.length > 0 ? (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {rules.map((r, i) => (
              <RuleTile key={r.id} rule={r} index={i} onClick={setModal} isFavorite={favorites.includes(r.id)} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: 'var(--dim)' }}>
            <Search size={28} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14 }}>
              {q ? `No results for "${q}"` : showFavs ? 'No favorites yet.' : 'No entries here.'}
            </p>
          </div>
        )}

        {/* Full reader links */}
        <div style={{ marginTop: 40, display: 'flex', gap: 10 }}>
          <button onClick={() => setShowReader('bitd')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 3, border: '1px solid rgba(224,74,58,.3)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
            <BookOpen size={13} /> READ BLADES IN THE DARK
          </button>
          <button onClick={() => setShowReader('b68')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 3, border: '1px solid rgba(59,130,246,.3)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>
            <BookOpen size={13} /> READ BLADES '68
          </button>
        </div>
      </div>

      {modal && <RuleModal rule={modal} onClose={() => setModal(null)} isFavorite={favorites.includes(modal.id)} toggleFavorite={toggleFav} />}
    </div>
  );
}
