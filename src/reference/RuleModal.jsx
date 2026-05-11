/**
 * reference/RuleModal.jsx — Inline rule popover and tile card.
 *
 * Extracted verbatim from App.jsx. Zero logic changes — just moved
 * to the correct module and imports updated to use shared/theme.js.
 */

import React, { useEffect, useRef } from 'react';
import { X, Star } from 'lucide-react';
import { accentColor } from '../shared/theme.js';

// ─── Source badge ─────────────────────────────────────────────────────────────

export function SrcBadge({ source, page }) {
  const a = accentColor(source);
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: a.badge, color: a.badgeTxt }}>
      {source}{page ? <span style={{ opacity: 0.6 }}> · p.{page}</span> : null}
    </span>
  );
}

// ─── Rule modal ───────────────────────────────────────────────────────────────

export function RuleModal({ rule, onClose, isFavorite, toggleFavorite }) {
  const a         = accentColor(rule?.source);
  const closeRef  = useRef(null);
  const subLabel  = rule?.['sub-subcategory'] || rule?.sub;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!rule) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      className="animate-fade-in"
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="rule-title"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', borderRadius: 8, overflow: 'hidden',
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.6), 0 0 40px ${a.bar}18`,
          background: 'var(--bg-card)', width: '80%', maxWidth: 520, maxHeight: '85vh',
          border: `1px solid ${a.bar}40`, display: 'flex', flexDirection: 'column',
        }}
        className="animate-scale-in"
      >
        {/* Color bar */}
        <div style={{ height: 4, background: a.bar, flexShrink: 0, boxShadow: `0 0 16px ${a.bar}80` }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {subLabel && <span style={{ display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{subLabel}</span>}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h2 id="rule-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 800, lineHeight: 1.2, color: a.title, margin: 0 }}>{rule.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {toggleFavorite && (
                <button onClick={() => toggleFavorite(rule.id)} style={{ padding: 6, borderRadius: '50%', background: isFavorite ? 'rgba(251,191,36,0.1)' : 'var(--bg-card-hi)', border: 'none', cursor: 'pointer', color: isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.4)', display: 'grid', placeItems: 'center' }}>
                  <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
              <button ref={closeRef} onClick={onClose} style={{ padding: 6, borderRadius: '50%', background: 'var(--bg-card-hi)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'grid', placeItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          </div>
          {rule.preview && <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 8, lineHeight: 1.5 }}>{rule.preview}</p>}
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap', margin: 0 }}>{rule.content}</p>
          {rule.tags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {rule.tags.split(',').map(t => (
                <span key={t.trim()} style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: 99, fontSize: 11, background: 'var(--bg-card-hi)' }}>#{t.trim()}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
          <SrcBadge source={rule.source} page={rule.page} />
        </div>
      </div>
    </div>
  );
}

// ─── Rule tile card ───────────────────────────────────────────────────────────

export function RuleTile({ rule, onClick, index, isFavorite }) {
  const a        = accentColor(rule.source);
  const subLabel = rule['sub-subcategory'] || rule.sub;

  return (
    <button
      type="button"
      onClick={() => onClick(rule)}
      style={{
        textAlign: 'left', borderRadius: 8, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer', position: 'relative',
        animationDelay: `${index * 30}ms`,
        transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      className="animate-slide-up"
      onMouseEnter={e => {
        e.currentTarget.style.transform    = 'translateY(-3px) scale(1.005)';
        e.currentTarget.style.boxShadow   = '0 8px 28px rgba(0,0,0,0.45)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = '';
        e.currentTarget.style.boxShadow   = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      {isFavorite && (
        <Star size={13} style={{ position: 'absolute', top: 11, right: 11, color: '#fbbf24', zIndex: 1 }} fill="currentColor" />
      )}
      {/* Color bar */}
      <div style={{ height: 3, background: a.bar, flexShrink: 0, boxShadow: `0 0 8px ${a.bar}80` }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 110 }}>
        {subLabel && <span style={{ display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', paddingRight: 20 }}>{subLabel}</span>}
        <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 15, lineHeight: 1.25, marginBottom: 6, color: a.title, paddingRight: 20, margin: '0 0 6px' }}>{rule.title}</h3>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.45, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', margin: 0 }}>{rule.preview}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.dot, boxShadow: `0 0 4px ${a.dot}`, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
            {rule.source}{rule.page ? ` · p.${rule.page}` : ''}
          </span>
        </div>
      </div>
    </button>
  );
}
