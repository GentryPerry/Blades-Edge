import React, { useState, useEffect, useRef } from 'react';
import PocketBase from 'pocketbase';
import {
  ChevronDown, ChevronRight, Swords, Shield, Dices, Moon, User,
  Menu, X, Users, Target, Globe, Search, BookOpen, Package, Star, Skull, Settings, Zap,
  Clock, Trash2, Plus, Minus, ArrowLeft, PlusCircle, ZapOff, FileText
} from "lucide-react";
import { DB } from "./database";
import { PLAYBOOKS, XP_TRIGGERS, ITEMS_LISTS, PLAYBOOK_ITEMS } from "./gamedata.jsx";


const Check = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// PLAYBOOKS, XP_TRIGGERS, ITEMS_LISTS, PLAYBOOK_ITEMS imported from gamedata.jsx above


const STYLES = `
/* ── Character backdrop: override bg tokens + frost all cards ── */
.has-char-bg {
  --bg0: rgba(9,  9,  11, 0.55);
  --bg2: rgba(15, 15, 17, 0.70);
  --bg3: rgba(31, 31, 31, 0.65);
  --border: rgba(39,39,42,0.60);
}
.has-char-bg .rounded-xl,
.has-char-bg .rounded-2xl {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

@keyframes daggerSpin {
  0%   { transform: rotate(0deg)   scale(1);    filter: drop-shadow(0 0 6px rgba(239,68,68,0.0)); }
  25%  { transform: rotate(90deg)  scale(1.08); filter: drop-shadow(0 0 10px rgba(239,68,68,0.5)); }
  50%  { transform: rotate(180deg) scale(1);    filter: drop-shadow(0 0 6px rgba(239,68,68,0.0)); }
  75%  { transform: rotate(270deg) scale(1.08); filter: drop-shadow(0 0 10px rgba(239,68,68,0.5)); }
  100% { transform: rotate(360deg) scale(1);    filter: drop-shadow(0 0 6px rgba(239,68,68,0.0)); }
}
@keyframes daggerPulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%       { opacity: 0.35; transform: scale(1.3); }
}
.dagger-spin { animation: daggerSpin 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.dagger-glow { animation: daggerPulse 1.4s ease-in-out infinite; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tickPop { 
  0% { transform: scale(1); } 
  40% { transform: scale(1.5); } 
  70% { transform: scale(0.85); } 
  100% { transform: scale(1); } 
}
@keyframes untickShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
@keyframes dieSpinReel { from { transform: translateY(0); } to { transform: translateY(-50px); } }
@keyframes dieSlam { 0%{opacity:0;transform:scale(1.3) translateY(-14px);filter:blur(3px)} 45%{opacity:1;transform:scale(0.91) translateY(5px);filter:blur(0)} 68%{transform:scale(1.04) translateY(-2px)} 85%{transform:scale(0.985) translateY(1px)} 100%{transform:scale(1) translateY(0)} }
@keyframes table-shake { 0%,100%{transform:translate(0,0)} 15%{transform:translate(-3px,2px)} 35%{transform:translate(3px,-2px)} 55%{transform:translate(-2px,3px)} 75%{transform:translate(2px,-1px)} }
.table-shake { animation: table-shake 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
@keyframes dieReveal { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
@keyframes floatBubble {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.7) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes searchSlide {
  from { opacity: 0; width: 0; transform: scaleX(0); }
  to { opacity: 1; width: 200px; transform: scaleX(1); }
}
.tick-pop { animation: tickPop 0.25s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
.untick-shake { animation: untickShake 0.2s ease; }
.shake-it { animation: shake 0.1s infinite; }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.float-bubble { animation: floatBubble 3s ease-in-out infinite; }
.pop-in { animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.search-slide { animation: searchSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: right; }
.markdown-content strong { color: #f3f4f6; }
.hide-scroll::-webkit-scrollbar { width: 6px; }
.hide-scroll::-webkit-scrollbar-track { background: transparent; }
.hide-scroll::-webkit-scrollbar-thumb { background-color: #27272a; border-radius: 10px; }
.key-tick { transform: skewX(-15deg); }
.damage-pill { border-radius: 999px; transform: skewX(-15deg); width: 14px; height: 20px; }
.screen-scroll { overflow-y: auto; overflow-x: hidden; }
.screen-scroll::-webkit-scrollbar { width: 4px; }
.screen-scroll::-webkit-scrollbar-track { background: transparent; }
.screen-scroll::-webkit-scrollbar-thumb { background-color: #27272a; border-radius: 10px; }
`;

// ─── DAGGER LOADING SCREEN ────────────────────────────────────────────────────
const LoadingDagger = ({ message = "Loading...", error = null, onRetry = null }) => (
  <div className="flex flex-col items-center justify-center py-32 animate-fade-in select-none" style={{ minHeight: 320 }}>
    <style>{STYLES}</style>
    <div className="relative flex items-center justify-center mb-6" style={{ width: 96, height: 96 }}>
      {/* Glow ring behind the dagger */}
      <div className="dagger-glow absolute rounded-full"
        style={{ width: 80, height: 80, background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)' }} />
      {/* Spinning dagger image */}
      {error ? (
        <span className="text-5xl">⚠️</span>
      ) : (
        <img
          src="/blades-icon.png"
          alt="Loading"
          className="dagger-spin relative z-10"
          style={{ width: 56, height: 56, objectFit: 'contain' }}
        />
      )}
    </div>
    <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">
      {error ? 'Connection Failed' : message}
    </p>
    {error && (
      <p className="text-[11px] text-neutral-600 mb-4 text-center max-w-xs">{error}</p>
    )}
    {error && onRetry && (
      <button onClick={onRetry}
        className="mt-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 rounded-lg transition-colors">
        Try Again
      </button>
    )}
  </div>
);

const Tracker = ({ value, max, onChange, type = "dot", slant = false }) => {
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [animType, setAnimType] = useState("pop");
  const handleClick = (i) => {
    const newVal = value === i + 1 ? i : i + 1;
    const filling = newVal > value;
    setAnimType(filling ? "tick-pop" : "untick-shake");
    setAnimatingIndex(i);
    setTimeout(() => setAnimatingIndex(null), 300);
    onChange(newVal);
  };
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < value;
        return (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`tracker-dot ${slant ? 'key-tick w-2 h-4' : 'w-3 h-3'}
              ${type === "box" ? "rounded-[2px]" : "rounded-full"} border
              ${isFilled
                ? "bg-red-600 border-red-600 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                : "bg-transparent border-neutral-600 hover:border-neutral-400"
              }
              ${animatingIndex === i ? animType : ""}`}
            aria-label={`Set to ${i + 1}`}
          />
        );
      })}
    </div>
  );
};

const LoadoutBoxes = ({ max, checked, onChange }) => {
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [animType, setAnimType] = useState("tick-pop");
  const handleClick = (e, i) => {
    e.preventDefault();
    const newVal = checked === i + 1 ? i : i + 1;
    const filling = newVal > checked;
    setAnimType(filling ? "tick-pop" : "untick-shake");
    setAnimatingIndex(i);
    setTimeout(() => setAnimatingIndex(null), 300);
    onChange(newVal);
  };
  if (max === 0) return null;
  return (
    <div className="flex gap-[1px] items-center bg-[var(--bg0)] p-[2px] rounded border border-neutral-800 shrink-0">
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < checked;
        return (
          <button
            key={i}
            onClick={(e) => handleClick(e, i)}
            className={`w-[11px] h-[11px] transition-colors border 
              ${isFilled ? "bg-red-600 border-red-600" : "bg-transparent border-neutral-600 hover:border-neutral-400"} 
              ${i === 0 && max > 1 ? 'rounded-l-[2px]' : i === max - 1 && max > 1 ? 'rounded-r-[2px]' : 'rounded-[2px]'}
              ${animatingIndex === i ? animType : ""}`}
            aria-label={`Set to ${i + 1}`}
          />
        );
      })}
    </div>
  );
};

const ClockSVG = ({ segments, filled, className = "w-24 h-24" }) => {
  const radius = 48;
  const center = 50;
  const paths = [];
  const ratio = filled / segments;
  let fillColor = "#71717a"; 
  if (ratio === 1) fillColor = "#ef4444"; 
  else if (ratio >= 0.5) fillColor = "#f97316"; 
  for (let i = 0; i < segments; i++) {
    const startAngle = (i * 360) / segments - 90;
    const endAngle = ((i + 1) * 360) / segments - 90;
    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");
    paths.push(
      <path key={i} d={pathData} fill={i < filled ? fillColor : "transparent"} stroke="var(--border)" strokeWidth="2" />
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={`${className} block mx-auto drop-shadow-md`}>
       <circle cx="50" cy="50" r="48" fill="var(--bg1)" stroke="var(--border)" strokeWidth="2" />
       {paths}
    </svg>
  );
};

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
};

const DieFace = ({ value, spinning, isBest, isBargain, size = 56 }) => {
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];
  const getOutcomeStyles = () => {
    const defaults = { pip: 'var(--text-muted)', border: 'var(--border)', bg: 'var(--bg2)', shadow: 'none' };
    if (spinning || !isBest) return defaults;
    if (value === 6) return { pip: '#22c55e', border: '#14532d', bg: '#0a1a0a', shadow: '0 0 15px rgba(34,197,94,0.2)' };
    else if (value >= 4) return { pip: '#f97316', border: '#9a3412', bg: '#1c0c03', shadow: '0 0 15px rgba(249,115,22,0.15)' };
    return defaults;
  };
  const outcome = getOutcomeStyles();
  return (
    <div style={{
      width: size, height: size,
      background: outcome.bg,
      border: `1px solid ${spinning ? (isBargain ? '#ef4444' : 'var(--border)') : outcome.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: outcome.shadow,
    }}>
      {spinning ? (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%',
          animation: `dieSpinReel 0.08s linear infinite`,
          display: 'flex', flexDirection: 'column',
        }}>
          {[1, 5, 2, 6, 3, 4, 1].map((v, i) => (
            <div key={i} style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg viewBox="0 0 100 100" width={size * 0.7} height={size * 0.7}>
                {PIP_LAYOUTS[v].map(([cx, cy], idx) => (
                  <circle key={idx} cx={cx} cy={cy} r={10} fill={isBargain ? "#450a0a" : "#333"} />
                ))}
              </svg>
            </div>
          ))}
        </div>
      ) : (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {pips.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={10} fill={outcome.pip} />
          ))}
        </svg>
      )}
    </div>
  );
};

const DiceModal = ({ onClose }) => {
  const [poolSize, setPoolSize] = useState(2);
  const [devilsBargain, setDevilsBargain] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [bestIndices, setBestIndices] = useState([]);
  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setOutcome(null);
    setResults([]);
    setBestIndices([]);
    const isZeroPool = poolSize === 0 && !devilsBargain;
    const actualDiceCount = isZeroPool ? 2 : (poolSize + (devilsBargain ? 1 : 0));
    setTimeout(() => {
      const rolled = Array.from({ length: actualDiceCount }, () => Math.floor(Math.random() * 6) + 1);
      setResults(rolled);
      const sixes = rolled.filter(v => v === 6).length;
      let finalValue;
      let highlighted;
      if (isZeroPool) {
        finalValue = Math.min(...rolled);
        highlighted = [rolled.indexOf(finalValue)];
      } else if (sixes >= 2) {
        finalValue = 6;
        highlighted = rolled.reduce((acc, v, i) => { if (v === 6) acc.push(i); return acc; }, []);
      } else {
        finalValue = Math.max(...rolled);
        highlighted = [rolled.indexOf(finalValue)];
      }
      setBestIndices(highlighted);
      let out;
      if (sixes >= 2 && !isZeroPool) out = { label: "CRITICAL", sub: "Exceptional result!", color: "#ef4444" };
      else if (finalValue === 6) out = { label: "SUCCESS", sub: "Full effect.", color: "#22c55e" };
      else if (finalValue >= 4) out = { label: "PARTIAL", sub: "Success with a consequence.", color: "#f97316" };
      else out = { label: "FAILURE", sub: "Things go wrong.", color: "#6b7280" };
      setOutcome(out);
      setRolling(false);
      if (devilsBargain) setDevilsBargain(false);
    }, 1000);
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`w-full max-w-md flex flex-col items-center gap-6 py-8 px-6 rounded-3xl border shadow-2xl transition-colors duration-500 relative animate-scale-in ${rolling && devilsBargain ? 'bg-[#1a0a0a] border-red-900/50' : 'bg-[var(--bg0)] border-neutral-800'}`} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white p-2 bg-neutral-900 rounded-full transition-colors">
          <X size={16} />
        </button>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Quick Tool</p>
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Action Roll</h2>
        </div>
        <div className="flex items-center gap-6 bg-[var(--bg2)] border border-neutral-800 rounded-2xl px-8 py-4 shadow-inner">
          <button onClick={() => setPoolSize(p => Math.max(0, p - 1))} disabled={rolling} className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-neutral-700 text-white text-xl hover:bg-neutral-800 transition-colors">−</button>
          <div className="text-center w-20">
            <span className="text-4xl font-black text-white">{poolSize}</span>
            <p className="text-[9px] font-black uppercase text-neutral-500 mt-1">
              {poolSize === 0 && !devilsBargain ? "2d6 LOW" : "BASE DICE"}
            </p>
          </div>
          <button onClick={() => setPoolSize(p => Math.min(10, p + 1))} disabled={rolling} className="w-10 h-10 rounded-xl bg-[var(--bg3)] border border-neutral-700 text-white text-xl hover:bg-neutral-800 transition-colors">+</button>
        </div>
        <button 
          onClick={() => setDevilsBargain(!devilsBargain)}
          disabled={rolling}
          className={`group flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-300 ${devilsBargain ? 'bg-red-950/20 border-red-900 text-red-500 shadow-[0_0_15px_rgba(153,27,27,0.2)]' : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 opacity-60 hover:opacity-100'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${devilsBargain ? 'bg-red-600 border-red-400' : 'border-neutral-700'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Devil's Bargain (+1d)</span>
        </button>
        <div className={`flex gap-3 justify-center flex-wrap min-h-[60px] items-center ${rolling ? 'table-shake' : ''}`}
          style={{ '--die-size': '50px' }}>
          {Array.from({ length: (poolSize === 0 && !devilsBargain) ? 2 : (poolSize + (devilsBargain ? 1 : 0)) }).map((_, i) => (
            <div key={i} style={{ animation: !rolling && results[i] ? `dieSlam 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 65}ms both` : 'none' }}>
              <DieFace value={results[i] || 1} spinning={rolling} isBest={bestIndices.includes(i)} isBargain={devilsBargain} size={50} />
            </div>
          ))}
        </div>
        <div className="text-center min-h-[4rem] flex flex-col justify-center w-full relative">
          {outcome && !rolling && (
            <div className="animate-spring-in relative overflow-hidden rounded-xl py-3 border border-neutral-800 shadow-sm"
              style={{ background:"var(--bg2)" }}>
              <div className="absolute inset-0 pointer-events-none rounded-xl"
                style={{ background:`radial-gradient(ellipse at center, ${outcome.color}18 0%, transparent 70%)` }} />
              <div className="text-2xl font-black tracking-tighter uppercase relative z-10"
                style={{ color: outcome.color, textShadow:`0 0 24px ${outcome.color}50` }}>
                {outcome.label}
              </div>
              <div className="text-neutral-500 text-[11px] font-medium relative z-10">{outcome.sub}</div>
            </div>
          )}
        </div>
        <button
          onClick={roll}
          disabled={rolling}
          className={`roll-btn ${devilsBargain ? 'roll-btn-bargain' : ''} w-full py-4 rounded-xl font-black uppercase tracking-widest active:scale-95`}
          style={{
            background: rolling ? 'var(--bg3)' : devilsBargain ? 'linear-gradient(135deg,#dc2626,#991b1b)' : 'linear-gradient(135deg,#ffffff,#e5e5e5)',
            color: rolling ? '#52525b' : '#000',
            boxShadow: !rolling && !devilsBargain ? '0 4px 16px rgba(255,255,255,0.1),inset 0 1px 0 rgba(255,255,255,0.4)' : !rolling ? '0 4px 16px rgba(220,38,38,0.25)' : 'none',
          }}
        >
          {rolling ? 'Calling Fate…' : 'Roll Pool'}
        </button>
      </div>
    </div>
  );
};

// --- MOBILE FLOATING NAV ---
const MobileFloatingNav = ({ sections, activeSection, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const activeInfo = sections.find(s => s.id === activeSection) || sections[0];

  const handleOpen = () => {
    setOpen(true);
    setReady(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  };
  const handleClose = () => { setOpen(false); setReady(false); };
  const handleSelect = (id) => { onSelect(id); handleClose(); };

  const visibleSections = sections.filter(s => s.id !== activeSection).slice().reverse();

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3">
      {open && visibleSections.map((section, idx) => (
        <div
          key={section.id}
          className="flex items-center gap-2"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(10px)',
            transition: `opacity 0.18s ease ${idx * 0.06}s, transform 0.18s cubic-bezier(0.16,1,0.3,1) ${idx * 0.06}s`,
          }}
        >
          <span className="bg-[var(--bg2)] border border-neutral-700 text-neutral-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
            {section.label}
          </span>
          <button
            onClick={() => handleSelect(section.id)}
            className="w-12 h-12 rounded-full bg-[var(--bg3)] border border-neutral-700 shadow-xl flex items-center justify-center text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all active:scale-95"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}
          >
            {section.icon}
          </button>
        </div>
      ))}
      <button
        onClick={() => open ? handleClose() : handleOpen()}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 border-2 ${open ? 'bg-neutral-700 border-neutral-500' : 'bg-red-700 border-red-600 animate-fab-bob'}`}
        style={{
          boxShadow: open
            ? '0 4px 20px rgba(0,0,0,0.8)'
            : '0 4px 28px rgba(220,38,38,0.55), 0 0 0 4px rgba(220,38,38,0.12)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {open ? <X size={22} className="text-white" /> : (activeInfo?.icon ? React.cloneElement(activeInfo.icon, { size: 22, className: "text-white" }) : <Menu size={22} className="text-white" />)}
      </button>
      {open && <div className="fixed inset-0 -z-10" onClick={handleClose} />}
    </div>
  );
};

// --- CURRENCY MODAL ---
const CurrencyModal = ({ activeChar, updateChar, currencyName, stashName, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
    <div className="w-full max-w-sm bg-[var(--bg2)] border border-neutral-700 rounded-t-3xl p-6 pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
      <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-6" />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-3 bg-[var(--bg0)] border border-neutral-800 rounded-xl p-4">
          <span className="font-black uppercase tracking-widest text-neutral-400 text-xs">{currencyName}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => updateChar({coin: Math.max(0, activeChar.coin - 1)})} className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"><Minus size={14}/></button>
            <span className="font-bold text-white w-8 text-center text-2xl">{activeChar.coin}</span>
            <button onClick={() => updateChar({coin: Math.min(4, activeChar.coin + 1)})} className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"><Plus size={14}/></button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 bg-[var(--bg0)] border border-neutral-800 rounded-xl p-4">
          <span className="font-black uppercase tracking-widest text-neutral-400 text-xs">{stashName}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => updateChar({stash: Math.max(0, activeChar.stash - 1)})} className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"><Minus size={14}/></button>
            <span className="font-bold text-white w-8 text-center text-2xl">{activeChar.stash}</span>
            <button onClick={() => updateChar({stash: Math.min(40, activeChar.stash + 1)})} className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"><Plus size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CustomPlaybookSection = ({ char, updateChar }) => {
  const p = char.playbook;
  const c = char.custom || {};
  const updateC = (key, val) => { updateChar({ custom: { ...c, [key]: val } }); };

  if (p === 'Hound' || p === 'Paranormalist') {
    const isHound = p === 'Hound';
    const title = isHound ? "Loyal, Clever Pet" : "Loyal Resonance Entity";
    const expert = isHound ? "Expert: Hunter" : "Expert: Paranormal Assistant";
    return (
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
        <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">{title}</h3>
          <span className="text-[10px] font-bold text-neutral-500 uppercase">Cohort ({expert})</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Name</label>
                <input value={c.petName || ""} onChange={e => updateC('petName', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" placeholder="Pet/Entity Name" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Edges</label>
                  <input value={c.petEdges || ""} onChange={e => updateC('petEdges', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Flaws</label>
                  <input value={c.petFlaws || ""} onChange={e => updateC('petFlaws', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500" />
               </div>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex flex-wrap gap-4 items-center">
                {['Weak', 'Impaired', 'Broken', 'Armor'].map(stat => (
                   <label key={stat} className="flex items-center gap-1.5 cursor-pointer group">
                      <span className="text-[10px] font-bold text-neutral-300">{stat}</span>
                      <div className={`w-3 h-5 border rounded-full transform -skew-x-12 transition-colors ${c['pet'+stat] ? 'bg-red-600 border-red-600' : 'border-neutral-600 group-hover:border-neutral-400'}`}></div>
                      <input type="checkbox" className="hidden" checked={!!c['pet'+stat]} onChange={e => updateC('pet'+stat, e.target.checked)} />
                   </label>
                ))}
             </div>
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Abilities:</label>
                <textarea value={c.petAbilities || ""} onChange={e => updateC('petAbilities', e.target.value)} className="w-full h-16 bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500 resize-none hide-scroll" placeholder="List abilities here..." />
             </div>
          </div>
        </div>
      </div>
    );
  }
  if (p === 'Hull') {
     const questions = ["What was my name and heritage?", "What did I leave unfinished?", "What was my background? Who or what did I love most in life?", "What crime was I sentenced to be Reformed for?"];
     return (
        <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
           <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Hull Traits & Human Memories</h3>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-neutral-500 uppercase">Suspicion</span>
                 <Tracker value={c.hullSuspicion || 0} max={4} onChange={v => updateC('hullSuspicion', v)} type="box" />
              </div>
           </div>
           <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Designation</label>
                 <input value={c.hullDesignation || ""} onChange={e => updateC('hullDesignation', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Owning Faction</label>
                 <input value={c.hullFaction || ""} onChange={e => updateC('hullFaction', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
              </div>
              <div className="col-span-full border-t border-neutral-800 my-2" />
              {questions.map((q, i) => (
                 <div key={i} className="flex gap-4 items-start bg-[var(--bg0)] p-3 rounded-xl border border-neutral-800">
                    <div className="flex-1">
                       <label className="text-[10px] font-black tracking-widest text-neutral-500">{q}</label>
                       <textarea value={(c.hullAns || [])[i] || ""} onChange={e => {
                          const newAns = [...(c.hullAns || Array(4).fill(""))];
                          newAns[i] = e.target.value;
                          updateC('hullAns', newAns);
                       }} className="w-full mt-1 bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500 resize-none h-10 hide-scroll" />
                    </div>
                    <button onClick={() => {
                          const newMem = [...(c.hullMem || Array(4).fill(0))];
                          newMem[i] = (newMem[i] + 1) % 9;
                          updateC('hullMem', newMem);
                    }} className="shrink-0 pt-1 group focus:outline-none">
                       <ClockSVG segments={8} filled={(c.hullMem || [])[i] || 0} className="w-12 h-12 group-hover:scale-105 transition-transform" />
                    </button>
                 </div>
              ))}
           </div>
        </div>
     );
  }
  if (p === 'Intellectual') {
     return (
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
        <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Sparkmind Assistant</h3>
          <span className="text-[10px] font-bold text-neutral-500 uppercase">Cohort (Expert)</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Name</label>
                <input value={c.sparkName || ""} onChange={e => updateC('sparkName', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Edges</label>
                  <input value={c.sparkEdges || ""} onChange={e => updateC('sparkEdges', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Flaws</label>
                  <input value={c.sparkFlaws || ""} onChange={e => updateC('sparkFlaws', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500" />
               </div>
             </div>
             <div className="flex gap-4 items-center">
                {['Weak', 'Impaired', 'Broken'].map(stat => (
                   <label key={stat} className="flex items-center gap-1.5 cursor-pointer group">
                      <span className="text-[10px] font-bold text-neutral-300">{stat}</span>
                      <div className={`w-3 h-5 border rounded-full transform -skew-x-12 transition-colors ${c['spark'+stat] ? 'bg-red-600 border-red-600' : 'border-neutral-600 group-hover:border-neutral-400'}`}></div>
                      <input type="checkbox" className="hidden" checked={!!c['spark'+stat]} onChange={e => updateC('spark'+stat, e.target.checked)} />
                   </label>
                ))}
             </div>
          </div>
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Type</label>
             {['Research (gathering information)', 'Analysis (studying and making)', 'Ingress (system hacking)'].map(type => (
                <label key={type} className="flex items-start gap-2 cursor-pointer group">
                   <div className={`w-3 h-3 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${c.sparkType === type ? 'bg-red-600 border-red-600' : 'border-neutral-600 group-hover:border-neutral-400'}`} />
                   <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">{type}</span>
                   <input type="radio" className="hidden" checked={c.sparkType === type} onChange={() => updateC('sparkType', type)} />
                </label>
             ))}
             <div className="border-t border-neutral-800 my-2" />
             {['Small (portable)', 'Large (immobile, powerful)'].map(size => (
                <label key={size} className="flex items-start gap-2 cursor-pointer group">
                   <div className={`w-3 h-3 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${c.sparkSize === size ? 'bg-red-600 border-red-600' : 'border-neutral-600 group-hover:border-neutral-400'}`} />
                   <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">{size}</span>
                   <input type="radio" className="hidden" checked={c.sparkSize === size} onChange={() => updateC('sparkSize', size)} />
                </label>
             ))}
          </div>
        </div>
      </div>
     );
  }
  if (p === 'Radical') {
     const RADICAL_EXPLOSIVES = ["Smoke", "Incendiary", "Concussive", "Electroplasmic", "Flash", "Gas", "Frag", "Shrapnel"];
     return (
       <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
         <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50 flex justify-between items-center">
            <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Explosives Arsenal</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-neutral-500 uppercase">Bandolier</span>
               <Tracker value={c.radBandolier || 0} max={3} onChange={v => updateC('radBandolier', v)} type="box" slant />
            </div>
         </div>
         <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            {RADICAL_EXPLOSIVES.map(exp => (
               <label key={exp} className="flex items-start gap-2 cursor-pointer group">
                  <div className={`w-3 h-3 mt-0.5 shrink-0 rounded border flex items-center justify-center transition-colors ${(c.radExplosives || []).includes(exp) ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-neutral-600 text-transparent group-hover:border-neutral-400'}`}>
                     {(c.radExplosives || []).includes(exp) && <Check size={10} strokeWidth={4} />}
                  </div>
                  <span className="text-xs leading-tight text-neutral-400 group-hover:text-neutral-200 transition-colors">{exp}</span>
                  <input type="checkbox" className="hidden" checked={(c.radExplosives || []).includes(exp)} onChange={(e) => {
                     const arr = c.radExplosives || [];
                     if(e.target.checked) updateC('radExplosives', [...arr, exp]);
                     else updateC('radExplosives', arr.filter(x => x !== exp));
                  }} />
               </label>
            ))}
         </div>
       </div>
     );
  }
  if (p === 'Operative') {
     return (
       <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
         <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50">
            <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Backing Faction</h3>
         </div>
         <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Faction Name</label>
               <input value={c.opFaction || ""} onChange={e => updateC('opFaction', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Personal Mission</label>
               <input value={c.opMission || ""} onChange={e => updateC('opMission', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Prestige Ability</label>
               <input value={c.opPrestige || ""} onChange={e => updateC('opPrestige', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
            </div>
         </div>
       </div>
     );
  }
  if (p === 'Swinger') {
     return (
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
        <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Two-Seat Autopod</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Name / Make</label>
                <input value={c.autoName || ""} onChange={e => updateC('autoName', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Style</label>
                <input value={c.autoStyle || ""} onChange={e => updateC('autoStyle', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-xs text-neutral-400 outline-none focus:border-red-500" placeholder="Chrome, leather..." />
             </div>
          </div>
          <div className="space-y-3 border-l border-neutral-800 pl-6">
             <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Type</label>
             {['Racing (so fast!)', 'Impressing (so cool!)', 'Surprising (hidden gadgets)'].map(type => (
                <label key={type} className="flex items-start gap-2 cursor-pointer group">
                   <div className={`w-3 h-3 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${c.autoType === type ? 'bg-red-600 border-red-600' : 'border-neutral-600 group-hover:border-neutral-400'}`} />
                   <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">{type}</span>
                   <input type="radio" className="hidden" checked={c.autoType === type} onChange={() => updateC('autoType', type)} />
                </label>
             ))}
          </div>
          <div className="space-y-3 border-l border-neutral-800 pl-6">
             <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Damage</label>
             {['Weak', 'Impaired', 'Broken'].map(stat => (
                   <label key={stat} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-3 h-5 border rounded-full transform -skew-x-12 transition-colors ${c['auto'+stat] ? 'bg-red-600 border-red-600' : 'border-neutral-600 group-hover:border-neutral-400'}`}></div>
                      <span className="text-xs font-bold text-neutral-300 group-hover:text-white">{stat}</span>
                      <input type="checkbox" className="hidden" checked={!!c['auto'+stat]} onChange={e => updateC('auto'+stat, e.target.checked)} />
                   </label>
                ))}
          </div>
        </div>
      </div>
     );
  }
  if (p === 'Veteran') {
     return (
       <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
         <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50">
            <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Used and Discarded</h3>
         </div>
         <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">Permanent Damage</label>
               <p className="text-xs text-neutral-600 mb-2 italic">E.g., a notable scar, a missing eye or limb, nightmares.</p>
               <input value={c.vetDamage || ""} onChange={e => updateC('vetDamage', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
            </div>
            <div>
               <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1">Something That Helps</label>
               <p className="text-xs text-neutral-600 mb-2 italic">E.g., a wheelchair, a prosthetic, medication.</p>
               <input value={c.vetHelps || ""} onChange={e => updateC('vetHelps', e.target.value)} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500" />
            </div>
         </div>
       </div>
     );
  }
  if (p === 'Ghost/Echo') {
     return (
       <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
         <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50">
            <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Echo Irregularities</h3>
         </div>
         <div className="p-4">
            <textarea value={c.ghostIrregularities || ""} onChange={e => updateC('ghostIrregularities', e.target.value)} className="w-full h-20 bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500 resize-none hide-scroll" placeholder="Record your physical/supernatural irregularities here..." />
         </div>
       </div>
     );
  }
  if (p === 'Vampire') {
     const strictures = ["Dayfire", "Slumber", "Forbidden", "Repelled", "Bestial", "Bound"];
     return (
       <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
         <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50">
            <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Strictures</h3>
         </div>
         <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
            {strictures.map(str => (
               <label key={str} className="flex items-start gap-2 cursor-pointer group">
                  <div className={`w-3 h-3 mt-0.5 shrink-0 rounded border flex items-center justify-center transition-colors ${(c.vampStrictures || []).includes(str) ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-neutral-600 text-transparent group-hover:border-neutral-400'}`}>
                     {(c.vampStrictures || []).includes(str) && <Check size={10} strokeWidth={4} />}
                  </div>
                  <span className="text-xs leading-tight text-neutral-400 group-hover:text-neutral-200 transition-colors">{str}</span>
                  <input type="checkbox" className="hidden" checked={(c.vampStrictures || []).includes(str)} onChange={(e) => {
                     const arr = c.vampStrictures || [];
                     if(e.target.checked) updateC('vampStrictures', [...arr, str]);
                     else updateC('vampStrictures', arr.filter(x => x !== str));
                  }} />
               </label>
            ))}
         </div>
       </div>
     );
  }
  if (p === 'Time Traveler') {
     return (
       <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm overflow-hidden animate-fade-in">
         <div className="p-3 border-b border-neutral-800 bg-[var(--bg0)]/50">
            <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Mission Details</h3>
         </div>
         <div className="p-4">
            <textarea value={c.timeMission || ""} onChange={e => updateC('timeMission', e.target.value)} className="w-full h-20 bg-transparent border-b border-neutral-800 pb-1 text-sm text-neutral-300 outline-none focus:border-red-500 resize-none hide-scroll" placeholder="Recall a new detail of your mission with each temporal glitch..." />
         </div>
       </div>
     );
  }
  return null;
};

const defaultChar = (game, playbook) => {
  const pbData = PLAYBOOKS[game]?.[playbook] || { dots: {} };
  return {
    game, name: "", alias: "", playbook, look: "", heritage: "", background: "", vice: "", notes: "",
    stress: 0, trauma: 0,
    xp: { playbook: 0, insight: 0, prowess: 0, resolve: 0 },
    actions: { 
      hunt: pbData.dots.hunt || 0, study: pbData.dots.study || 0, survey: pbData.dots.survey || 0, tinker: pbData.dots.tinker || 0,
      finesse: pbData.dots.finesse || 0, prowl: pbData.dots.prowl || 0, skirmish: pbData.dots.skirmish || 0, wreck: pbData.dots.wreck || 0,
      attune: pbData.dots.attune || 0, command: pbData.dots.command || 0, consort: pbData.dots.consort || 0, sway: pbData.dots.sway || 0
    },
    keys: [
      { text: "", xp: 0, deadlocked: false, deadlockText: "" },
      { text: "", xp: 0, deadlocked: false, deadlockText: "" },
      { text: "", xp: 0, deadlocked: false, deadlockText: "" }
    ],
    harm: { mortal: "", critical: "", major1: "", major2: "", passing1: "", passing2: "" },
    healing: 0, armor: false, specialArmor: 0, coin: 0, stash: 0,
    selectedAbilities: [], loadoutType: "Quiet",
    items: {},
    customItems: [
      { name: "", checked: 0, max: 1 }, { name: "", checked: 0, max: 1 },
      { name: "", checked: 0, max: 1 }, { name: "", checked: 0, max: 1 },
      { name: "", checked: 0, max: 1 }
    ]
  };
};

// =====================
// SECTION SCREENS
// =====================

const AbilitiesScreen = ({ activeChar, updateChar, updateNested }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
    {[
      { key: 'insight', xpKey: 'insight', actions: ['hunt','study','survey','tinker'] },
      { key: 'prowess', xpKey: 'prowess', actions: ['finesse','prowl','skirmish','wreck'] },
      { key: 'resolve', xpKey: 'resolve', actions: ['attune','command','consort','sway'] },
    ].map(({ key, xpKey, actions }) => (
      <div key={key} className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-black uppercase tracking-widest text-neutral-300 text-sm capitalize">{key}</h3>
          <Tracker value={activeChar.xp[xpKey]} max={6} onChange={(v) => updateNested('xp', xpKey, v)} type="box" slant />
        </div>
        {actions.map(act => (
          <div key={act} className="flex items-center justify-between group py-1">
            <span className="text-sm font-bold text-neutral-400 capitalize group-hover:text-white transition-colors">{act}</span>
            <Tracker value={activeChar.actions[act]} max={4} onChange={(v) => updateNested('actions', act, v)} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const TraitsScreen = ({ activeChar, updateChar, isB68, traumaName }) => (
  <div className="space-y-4 h-full screen-scroll pb-4">
    <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Look</label>
          <input value={activeChar.look} onChange={e => updateChar({look: e.target.value})} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-neutral-300 text-sm outline-none focus:border-red-500 transition-colors" placeholder="Description" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Heritage</label>
            <input value={activeChar.heritage} onChange={e => updateChar({heritage: e.target.value})} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-neutral-300 text-sm outline-none focus:border-red-500 transition-colors" placeholder="Akorosi, Skovlan..." />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Background</label>
            <input value={activeChar.background} onChange={e => updateChar({background: e.target.value})} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-neutral-300 text-sm outline-none focus:border-red-500 transition-colors" placeholder="Academic, Labor..." />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Vice / Hookup</label>
          <input value={activeChar.vice} onChange={e => updateChar({vice: e.target.value})} className="w-full bg-transparent border-b border-neutral-800 pb-1 text-neutral-300 text-sm outline-none focus:border-red-500 transition-colors" placeholder="Gambling / Valero" />
        </div>
      </div>
    </div>

    {/* Keys */}
    <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <h3 className="font-black uppercase tracking-widest text-neutral-500 text-[10px]">Keys</h3>
        <h3 className="font-black uppercase tracking-widest text-neutral-500 text-[10px]">{isB68 ? 'Deadlocks' : 'Traumas'}</h3>
      </div>
      {(activeChar.keys || []).map((k, i) => (
        <div key={i} className="flex items-center gap-1.5 w-full">
          <input value={k.text} onChange={e => {
            const newKeys = [...activeChar.keys];
            newKeys[i] = { ...k, text: e.target.value };
            updateChar({ keys: newKeys });
          }} className="flex-1 min-w-0 bg-[var(--bg0)] border border-neutral-800 rounded-l-full px-3 py-1 text-xs text-neutral-300 outline-none focus:border-red-500 transition-colors" placeholder="Key..." />
          <div className="shrink-0 bg-[var(--bg0)] border border-neutral-800 px-2 py-1 flex items-center justify-center">
            <Tracker value={k.xp} max={3} onChange={(v) => {
              const newKeys = [...activeChar.keys];
              newKeys[i] = { ...k, xp: v };
              updateChar({ keys: newKeys });
            }} type="box" slant />
          </div>
          <button type="button" onClick={() => {
            const newKeys = [...activeChar.keys];
            newKeys[i] = { ...k, deadlocked: !k.deadlocked };
            updateChar({ keys: newKeys });
          }} className={`shrink-0 p-1.5 transition-colors ${k.deadlocked ? 'text-red-500' : 'text-neutral-600 hover:text-neutral-400'}`} title="Toggle Deadlock">
            {k.deadlocked ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
          </button>
          <input value={k.deadlockText} onChange={e => {
            const newKeys = [...activeChar.keys];
            newKeys[i] = { ...k, deadlockText: e.target.value };
            updateChar({ keys: newKeys });
          }} className="flex-1 min-w-0 bg-[var(--bg0)] border border-neutral-800 rounded-r-full px-3 py-1 text-xs text-neutral-400 outline-none focus:border-red-500 transition-colors" placeholder={isB68 ? "Deadlock..." : "Trauma..."} disabled={!k.deadlocked} />
        </div>
      ))}
      {(activeChar.keys || []).length < 4 && (
        <button onClick={() => updateChar({ keys: [...(activeChar.keys || []), { text: "", xp: 0, deadlocked: false, deadlockText: "" }] })}
          className="w-full flex items-center justify-center gap-1 py-1.5 mt-1 border border-neutral-800 border-dashed rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30 transition-colors">
          <Plus size={12} /> Add {isB68 ? 'Key / Deadlock' : 'Key / Trauma'}
        </button>
      )}
    </div>
  </div>
);

const SpecialScreen = ({ activeChar, updateChar, updateNested, isB68, traumaName, setModal }) => {
  const toggleAbility = (ability) => {
    const current = activeChar.selectedAbilities || [];
    if (current.includes(ability)) updateChar({ selectedAbilities: current.filter(a => a !== ability) });
    else updateChar({ selectedAbilities: [...current, ability] });
  };
  const openAbilityModal = (abilityName) => {
    const found = DB.find(r => r.title.toLowerCase() === abilityName.toLowerCase() && r.subcategory === "Special Abilities");
    if (found) { setModal(found); }
    else {
      setModal({ id: "custom-" + abilityName, title: abilityName, source: activeChar.game, category: "Player", subcategory: "Special Abilities", "sub-subcategory": activeChar.playbook, preview: "Playbook Special Ability", content: "Detailed description not found in the current compendium database. Please consult your rulebook." });
    }
  };

  return (
    <div className="space-y-4 screen-scroll pb-4 h-full">
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">Special Abilities</h3>
          <Tracker value={activeChar.xp.playbook} max={8} onChange={(v) => updateNested('xp', 'playbook', v)} type="box" slant />
        </div>
        <div className="p-4 space-y-3 bg-[var(--bg0)]/50 rounded-b-xl">
          {(PLAYBOOKS[activeChar.game]?.[activeChar.playbook]?.abilities || []).map(ability => {
            const isChecked = (activeChar.selectedAbilities || []).includes(ability);
            return (
              <div key={ability} className="flex items-start gap-3 group">
                <label className="cursor-pointer">
                  <div className={`w-4 h-4 mt-0.5 shrink-0 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-neutral-600 text-transparent group-hover:border-neutral-400'}`}>
                    {isChecked && <Check size={12} strokeWidth={4} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleAbility(ability)} />
                </label>
                <button onClick={() => openAbilityModal(ability)} className={`text-sm text-left leading-tight transition-colors ${isChecked ? 'text-white font-bold' : 'text-neutral-400 font-medium hover:text-neutral-200'}`}>
                  {ability}
                </button>
              </div>
            );
          })}

          {/* More Special Abilities - now always expanded, no collapsible */}
          <div className="mt-4 border-t border-neutral-800/50 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">More Special Abilities</p>
            <div className="text-xs text-neutral-400 space-y-3 pl-2 pb-2 leading-relaxed">
              <p>• Every time you roll a <strong className="text-white">desperate action</strong> or a <strong className="text-white">zero-dot action</strong>, mark xp in any attribute of your choice.</p>
              <p>• Once per session when you <strong className="text-white">hit a key</strong>, mark 1 xp and mark the key.</p>
              <div>
                <p className="mb-1">At the end of each session, mark 1 xp (or 2 xp if you really smashed it) if:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>You addressed a challenge with <strong className="text-white">{XP_TRIGGERS[activeChar.game]?.[activeChar.playbook] || "your playbook's specific methods"}</strong>.</li>
                  <li>You struggled with issues stemming from a <strong className="text-white">{traumaName.toLowerCase()}</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playbook-specific extras always at the bottom */}
      <CustomPlaybookSection char={activeChar} updateChar={updateChar} />
    </div>
  );
};

const ItemsScreen = ({ activeChar, updateChar, updateNested, isB68 }) => {
  const getMaxLoad = () => {
    if (isB68) return activeChar.loadoutType === 'Loud' ? 6 : 3;
    if (activeChar.loadoutType === 'Heavy') return 6;
    if (activeChar.loadoutType === 'Normal') return 5;
    return 3;
  };
  const maxLoad = getMaxLoad();
  const armorLoad = isB68 ? 3 : 2;
  let currentLoad = 0;
  Object.values(activeChar.items || {}).forEach(v => currentLoad += v);
  (activeChar.customItems || []).forEach(ci => currentLoad += (ci.checked || 0));
  if (activeChar.armor) currentLoad += armorLoad;

  const genericItems = ITEMS_LISTS[activeChar.game] || ITEMS_LISTS["BitD Core"];
  const playbookItems = PLAYBOOK_ITEMS[activeChar.playbook] || [];

  return (
    <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl shadow-sm flex flex-col h-full screen-scroll">
      <div className="p-4 border-b border-neutral-800 shrink-0 flex items-center justify-between sticky top-0 bg-[var(--bg2)] z-10">
        <h3 className="font-black uppercase tracking-widest text-neutral-300 text-xs">
          Items <span className={`ml-2 tracking-normal font-bold ${currentLoad > maxLoad ? 'text-red-400' : 'text-neutral-500'}`}>({currentLoad}/{maxLoad} LOAD)</span>
        </h3>
        {isB68 ? (
          <div className="flex gap-4 pr-1">
            {['Quiet', 'Loud'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-3.5 h-3.5 rotate-45 border flex items-center justify-center transition-colors ${activeChar.loadoutType === type ? 'bg-red-600 border-red-600 text-white' : 'border-neutral-600 group-hover:border-neutral-400'}`}>
                  {activeChar.loadoutType === type && <Check size={10} className="-rotate-45" strokeWidth={3} />}
                </div>
                <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${activeChar.loadoutType === type ? 'text-white' : 'text-neutral-500'}`}>{type === 'Quiet' ? '3 Quiet' : '6 Loud'}</span>
                <input type="radio" className="hidden" checked={activeChar.loadoutType === type} onChange={() => updateChar({loadoutType: type})} />
              </label>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 pr-1">
            {['Light', 'Normal', 'Heavy'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-3.5 h-3.5 rotate-45 border flex items-center justify-center transition-colors ${activeChar.loadoutType === type ? 'bg-red-600 border-red-600 text-white' : 'border-neutral-600 group-hover:border-neutral-400'}`}>
                  {activeChar.loadoutType === type && <Check size={10} className="-rotate-45" strokeWidth={3} />}
                </div>
                <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors ${activeChar.loadoutType === type ? 'text-white' : 'text-neutral-500'}`}>{type}</span>
                <input type="radio" className="hidden" checked={activeChar.loadoutType === type} onChange={() => updateChar({loadoutType: type})} />
              </label>
            ))}
          </div>
        )}
      </div>
      {/* Armor & Resources - above items */}
      <div className="px-5 pt-4 pb-3 border-b border-neutral-800/60">
        <h4 className="font-black uppercase tracking-widest text-neutral-500 text-[10px] mb-3">Armor & Resources</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">Armor</span>
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeChar.armor ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-neutral-600 text-transparent group-hover:border-neutral-400'}`}>
              {activeChar.armor && <Check size={12} strokeWidth={4} />}
            </div>
            <input type="checkbox" className="hidden" checked={activeChar.armor} onChange={(e) => {
              if (e.target.checked && currentLoad + armorLoad > maxLoad) return;
              updateChar({armor: e.target.checked});
            }} />
          </label>
          <div className="flex items-center justify-between group">
            <span className="text-sm font-bold text-neutral-300 group-hover:text-white transition-colors">{isB68 && activeChar.playbook === 'Hound' ? 'Tenacity' : 'Special Armor'}</span>
            <Tracker value={activeChar.specialArmor || 0} max={2} onChange={(v) => updateChar({specialArmor: v})} type="box" />
          </div>
        </div>
      </div>

      <div className="p-5 bg-[var(--bg0)]/50 flex flex-col gap-5">
        {playbookItems.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {playbookItems.map((item, idx) => (
              <div key={'pb'+idx} className="flex items-start gap-2 text-xs text-neutral-300 group">
                <LoadoutBoxes max={item.boxes} checked={(activeChar.items || {})['pb'+idx] || 0} onChange={(v) => {
                  const oldV = (activeChar.items || {})['pb'+idx] || 0;
                  if (v > oldV && currentLoad + (v - oldV) > maxLoad) return;
                  updateNested('items', 'pb'+idx, v);
                }} />
                <span className="leading-tight pt-0.5">{item.name}</span>
              </div>
            ))}
          </div>
        )}
        {playbookItems.length > 0 && <div className="border-t border-neutral-800" />}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {genericItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-xs text-neutral-400 group">
              <LoadoutBoxes max={item.boxes} checked={(activeChar.items || {})[item.id] || 0} onChange={(v) => {
                const oldV = (activeChar.items || {})[item.id] || 0;
                if (v > oldV && currentLoad + (v - oldV) > maxLoad) return;
                updateNested('items', item.id, v);
              }} />
              <span className="leading-tight pt-0.5">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3 pt-4 border-t border-neutral-800 border-dashed">
          {[0,1,2,3,4].map(i => {
            const ci = (activeChar.customItems || [])[i] || { name: "", checked: 0, max: 1 };
            return (
              <div key={'custom'+i} className="flex items-center gap-2">
                <LoadoutBoxes max={ci.max} checked={ci.checked} onChange={(v) => {
                  const oldV = ci.checked || 0;
                  if (v > oldV && currentLoad + (v - oldV) > maxLoad) return;
                  const newCi = [...activeChar.customItems];
                  newCi[i] = { ...newCi[i], checked: v };
                  updateChar({ customItems: newCi });
                }} />
                <input value={ci.name} onChange={e => {
                  const newCi = [...activeChar.customItems];
                  newCi[i] = { ...newCi[i], name: e.target.value };
                  updateChar({ customItems: newCi });
                }} placeholder="Custom item..." className="flex-1 bg-transparent border-b border-neutral-800 hover:border-neutral-600 pb-0.5 text-xs text-neutral-300 outline-none focus:border-red-500 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CombatScreen = ({ activeChar, updateChar, updateNested, isB68, traumaName }) => {
  const isB68Hound = isB68 && activeChar.playbook === 'Hound';

  const getMaxLoad = () => {
    if (isB68) return activeChar.loadoutType === 'Loud' ? 6 : 3;
    if (activeChar.loadoutType === 'Heavy') return 6;
    if (activeChar.loadoutType === 'Normal') return 5;
    return 3;
  };
  const maxLoad = getMaxLoad();
  const armorLoad = isB68 ? 3 : 2;
  let currentLoad = 0;
  Object.values(activeChar.items || {}).forEach(v => currentLoad += v);
  (activeChar.customItems || []).forEach(ci => currentLoad += (ci.checked || 0));
  if (activeChar.armor) currentLoad += armorLoad;

  return (
    <div className="space-y-4 screen-scroll pb-4 h-full">
      {/* Stress */}
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-black uppercase tracking-widest text-neutral-300 text-sm">Stress</h3>
          <Tracker value={activeChar.stress} max={9} onChange={(v) => updateChar({stress: v})} type="box" />
        </div>
      </div>

      {/* Harm + Healing */}
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="flex-1 flex flex-col gap-1.5 border-r border-neutral-800 pr-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1">
              <span className="text-[10px] font-black uppercase text-neutral-500">Harm</span>
            </div>
            <div className="flex border-b border-neutral-800 pb-1 items-center">
              <span className="w-5 text-xs font-bold text-neutral-600">4</span>
              <input value={activeChar.harm.mortal} onChange={e => updateNested('harm', 'mortal', e.target.value)} placeholder="Mortal" className="flex-1 bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-700" />
            </div>
            <div className="flex border-b border-neutral-800 pb-1 items-center">
              <span className="w-5 text-xs font-bold text-neutral-600">3</span>
              <input value={activeChar.harm.critical} onChange={e => updateNested('harm', 'critical', e.target.value)} placeholder="Critical" className="flex-1 bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-700" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex border-b border-neutral-800 pb-1 items-center">
                <span className="w-4 text-xs font-bold text-neutral-600">2</span>
                <input value={activeChar.harm.major1} onChange={e => updateNested('harm', 'major1', e.target.value)} placeholder="Major" className="w-full bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-700" />
              </div>
              <div className="flex-1 flex border-b border-neutral-800 pb-1 items-center">
                <span className="w-4 text-xs font-bold text-neutral-600">2</span>
                <input value={activeChar.harm.major2} onChange={e => updateNested('harm', 'major2', e.target.value)} placeholder="Major" className="w-full bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-700" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex border-b border-neutral-800 pb-1 items-center">
                <span className="w-4 text-xs font-bold text-neutral-600">1</span>
                <input value={activeChar.harm.passing1} onChange={e => updateNested('harm', 'passing1', e.target.value)} placeholder="Passing" className="w-full bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-700" />
              </div>
              <div className="flex-1 flex border-b border-neutral-800 pb-1 items-center">
                <span className="w-4 text-xs font-bold text-neutral-600">1</span>
                <input value={activeChar.harm.passing2} onChange={e => updateNested('harm', 'passing2', e.target.value)} placeholder="Passing" className="w-full bg-transparent text-xs text-neutral-300 outline-none placeholder:text-neutral-700" />
              </div>
            </div>
          </div>
          <div className="w-20 flex flex-col items-center justify-start gap-2">
            <span className="text-[10px] font-black uppercase text-neutral-500">Healing</span>
            <button onClick={() => updateChar({healing: (activeChar.healing + 1) % 5})} className="focus:outline-none group">
              <ClockSVG segments={4} filled={activeChar.healing || 0} className="w-14 h-14 group-hover:scale-105 transition-transform cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      {/* Keys in combat for quick reference */}
      <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-1">
          <h3 className="font-black uppercase tracking-widest text-neutral-500 text-[10px]">Keys</h3>
          <h3 className="font-black uppercase tracking-widest text-neutral-500 text-[10px]">{isB68 ? 'Deadlocks' : 'Traumas'}</h3>
        </div>
        {(activeChar.keys || []).map((k, i) => (
          <div key={i} className="flex items-center gap-1.5 w-full">
            <input value={k.text} onChange={e => {
              const newKeys = [...activeChar.keys];
              newKeys[i] = { ...k, text: e.target.value };
              updateChar({ keys: newKeys });
            }} className="flex-1 min-w-0 bg-[var(--bg0)] border border-neutral-800 rounded-l-full px-3 py-1 text-xs text-neutral-300 outline-none focus:border-red-500 transition-colors" placeholder="Key..." />
            <div className="shrink-0 bg-[var(--bg0)] border border-neutral-800 px-2 py-1 flex items-center justify-center">
              <Tracker value={k.xp} max={3} onChange={(v) => {
                const newKeys = [...activeChar.keys];
                newKeys[i] = { ...k, xp: v };
                updateChar({ keys: newKeys });
              }} type="box" slant />
            </div>
            <button type="button" onClick={() => {
              const newKeys = [...activeChar.keys];
              newKeys[i] = { ...k, deadlocked: !k.deadlocked };
              updateChar({ keys: newKeys });
            }} className={`shrink-0 p-1.5 transition-colors ${k.deadlocked ? 'text-red-500' : 'text-neutral-600 hover:text-neutral-400'}`}>
              {k.deadlocked ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
            </button>
            <input value={k.deadlockText} onChange={e => {
              const newKeys = [...activeChar.keys];
              newKeys[i] = { ...k, deadlockText: e.target.value };
              updateChar({ keys: newKeys });
            }} className="flex-1 min-w-0 bg-[var(--bg0)] border border-neutral-800 rounded-r-full px-3 py-1 text-xs text-neutral-400 outline-none focus:border-red-500 transition-colors" placeholder={isB68 ? "Deadlock..." : "Trauma..."} disabled={!k.deadlocked} />
          </div>
        ))}
      </div>
    </div>
  );
};

// =====================
// MAIN COMPONENT
// =====================
const CharacterManager = ({ 
  userId, 
  pbInstance, 
  characters = [], 
  setCharacters = () => {}, 
  setModal = () => {} 
}) => {
  // Always use the pbInstance passed from App.jsx — it carries the live authenticated authStore.
  const activePb = pbInstance;
  const [activeCharId, setActiveCharId] = useState(null);
  const [viewMode, setViewMode] = useState("sheet");
  const [activeSection, setActiveSection] = useState("abilities");
  const [diceOpen, setDiceOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [compendiumResults, setCompendiumResults] = useState([]);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newGame, setNewGame] = useState("B68");
  const [newPlaybook, setNewPlaybook] = useState("");
  const [isManifesting, setIsManifesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const debounceTimer = useRef(null);
  const pendingUpdates = useRef({});
  const activeChar = characters.find(c => c.id === activeCharId);
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Build the PocketBase thumb URL for a character's avatar
  const getAvatarUrl = (char) => {
    if (!char?.avatar) return null;
    return `${activePb.baseUrl}/api/files/characters/${char.id}/${char.avatar}?thumb=250x250`;
  };

  // Upload a new avatar file for a character
  const uploadAvatar = async (charId, file) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const updated = await activePb.collection('characters').update(charId, fd, { '$autoCancel': false });
      setCharacters(prev => prev.map(c => c.id === charId ? updated : c));
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim() || !activeCharId) { setCompendiumResults([]); return; }
    const lq = searchQuery.toLowerCase();
    const results = (DB || []).filter(r =>
      ["title","content","tags","subcategory","preview"].some(k => r[k]?.toLowerCase().includes(lq))
    ).slice(0, 12);
    setCompendiumResults(results);
  }, [searchQuery, activeCharId]);

  useEffect(() => {
    const loadScoundrels = async () => {
      try {
        const records = await activePb.collection('characters').getFullList({ sort: '-created', '$autoCancel': false });
        setCharacters(records);
      } catch (err) {
        console.error("Could not load characters:", err);
        setLoadError(err.message || 'Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };
    loadScoundrels();
  }, [setCharacters, activePb]);

  const updateChar = (updates) => {
    setCharacters(prev => prev.map(c => c.id === activeCharId ? { ...c, ...updates } : c));
    if (activeCharId) {
      pendingUpdates.current = { ...pendingUpdates.current, ...updates };
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const currentId = activeCharId;
      debounceTimer.current = setTimeout(async () => {
        const payload = { ...pendingUpdates.current };
        pendingUpdates.current = {};
        try {
          await activePb.collection('characters').update(currentId, payload, { '$autoCancel': false });
        } catch (err) {
          console.error("Failed to sync to NAS:", err);
        }
      }, 750);
    }
  };

  const updateNested = (key, subkey, value) => updateChar({ [key]: { ...activeChar[key], [subkey]: value } });

  const startCreate = () => { setIsCreating(true); setNewGame("B68"); setNewPlaybook(""); };

  const finishCreate = async () => {
    if (!newPlaybook || isManifesting) return;
    setIsManifesting(true);
    const template = defaultChar(newGame, newPlaybook);
    try {
      // pbInstance is already authenticated via App.jsx — no manual auth re-save needed.
      const finalUserId = userId || activePb.authStore.record?.id || activePb.authStore.model?.id;
      if (!finalUserId) { console.error("No valid user ID found."); setIsManifesting(false); return; }
      const newRecord = await activePb.collection('characters').create({ ...template, user: finalUserId }, { '$autoCancel': false });
      setCharacters([...characters, newRecord]);
      setActiveCharId(newRecord.id);
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to manifest on NAS:", err);
    } finally {
      setIsManifesting(false);
    }
  };

  const deleteChar = async (id) => {
    if (confirm("Are you sure you want to permanently delete this scoundrel?")) {
      try {
        await activePb.collection('characters').delete(id, { '$autoCancel': false });
        setCharacters(prev => prev.filter(c => c.id !== id));
        if (activeCharId === id) setActiveCharId(null);
      } catch (err) {
        console.error("Failed to delete on NAS:", err);
      }
    }
  };

  // Show dagger spinner while fetching characters, or error state if it failed
  if (loading || loadError) {
    return (
      <LoadingDagger
        message="Summoning scoundrels..."
        error={loadError}
        onRetry={loadError ? () => {
          setLoading(true);
          setLoadError(null);
          activePb.collection('characters').getFullList({ sort: '-created', '$autoCancel': false })
            .then(records => setCharacters(records))
            .catch(err => setLoadError(err.message || 'Could not connect to the server.'))
            .finally(() => setLoading(false));
        } : null}
      />
    );
  }

  // Wizard UI
  if (isCreating) {
    return (
      <div className="space-y-6 animate-fade-in p-4 pb-32 max-w-5xl mx-auto">
        <style>{STYLES}</style>
        <div className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-black uppercase tracking-widest text-neutral-200">New Scoundrel</h2>
            <button onClick={() => setIsCreating(false)} className="text-neutral-500 hover:text-white transition-colors"><X size={20}/></button>
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">1. Choose Your Setting</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {setNewGame("BitD Core"); setNewPlaybook("");}} className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${newGame === "BitD Core" ? "bg-neutral-800 border-neutral-600 text-white" : "bg-[var(--bg0)] border-neutral-800 text-neutral-500 hover:border-neutral-700"}`}>
                Blades in the Dark
              </button>
              <button onClick={() => {setNewGame("B68"); setNewPlaybook("");}} className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${newGame === "B68" ? "bg-blue-900/40 border-blue-500/50 text-blue-200" : "bg-[var(--bg0)] border-neutral-800 text-neutral-500 hover:border-neutral-700"}`}>
                Blades '68
              </button>
            </div>
          </div>
          <div className="space-y-4 animate-fade-in">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500">2. Choose Your Playbook</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(PLAYBOOKS[newGame] || {}).map(playbookName => (
                <button key={playbookName} onClick={() => setNewPlaybook(playbookName)} className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all ${newPlaybook === playbookName ? "bg-red-900/40 border-red-500/50 text-red-200" : "bg-[var(--bg0)] border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}>
                  {playbookName}
                </button>
              ))}
            </div>
          </div>
          <button onClick={finishCreate} disabled={!newPlaybook || isManifesting} className="w-full bg-neutral-200 text-black font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            {isManifesting ? "Manifesting..." : "Manifest Character"}
          </button>
        </div>
      </div>
    );
  }

  // Filter characters by search
  const filteredCharacters = characters.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (c.name || "").toLowerCase().includes(q) || (c.alias || "").toLowerCase().includes(q) || (c.playbook || "").toLowerCase().includes(q);
  });

  // Roster Grid
  if (!activeChar) {
    return (
      <div className="space-y-6 animate-fade-in p-4 pb-32 max-w-5xl mx-auto">
        <style>{STYLES}</style>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black uppercase tracking-widest text-neutral-200">The Roster</h2>
          <div className="flex items-center gap-2">
            {/* Search pop-out */}
            <div className="flex items-center gap-2">
              {searchOpen && (
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="search-slide bg-[var(--bg2)] border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-red-500 transition-colors w-48"
                  onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(""); } }}
                />
              )}
              <button
                onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(""); }}
                className={`p-2 rounded-lg transition-colors ${searchOpen ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
              >
                <Search size={16} />
              </button>
            </div>
            {searchOpen ? (
              <button onClick={startCreate} className="p-2 bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors" title="New Scoundrel">
                <PlusCircle size={18} />
              </button>
            ) : (
              <button onClick={startCreate} className="bg-neutral-200 text-black font-bold px-4 py-2 text-sm rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-sm">
                <PlusCircle size={16} /> New Scoundrel
              </button>
            )}
          </div>
        </div>
        {filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-600 border border-neutral-800/50 border-dashed rounded-2xl bg-[var(--bg2)]/50">
            <User size={32} className="mb-3 opacity-20" />
            <p className="text-center italic text-sm">{searchQuery ? "No characters match your search." : "Your crew is empty."}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCharacters.map(c => (
              <div key={c.id} className="bg-[var(--bg2)] border border-neutral-800 rounded-xl p-5 hover:border-neutral-600 transition-colors group relative cursor-pointer" onClick={() => setActiveCharId(c.id)}>
                <button onClick={(e) => { e.stopPropagation(); deleteChar(c.id); }} className="absolute top-3 right-3 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar thumbnail */}
                  <div
                    className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 group/av"
                    onClick={e => { e.stopPropagation(); const inp = document.getElementById(`av-${c.id}`); inp && inp.click(); }}
                  >
                    {getAvatarUrl(c)
                      ? <img src={getAvatarUrl(c)} alt="" className="w-full h-full object-cover" />
                      : <span className="text-lg font-black text-neutral-500">{(c.name || '?')[0].toUpperCase()}</span>
                    }
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/av:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold uppercase tracking-wider">Edit</span>
                    </div>
                    <input id={`av-${c.id}`} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => uploadAvatar(c.id, e.target.files[0])} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-600 flex gap-2 pr-6">
                      <span>{c.game === 'B68' ? "Blades '68" : "Core"}</span>
                      <span className={c.game === 'B68' ? "text-blue-500" : ""}>{c.playbook}</span>
                    </div>
                    <h3 className="font-bold text-base text-white truncate">{c.name || "Unnamed"} {c.alias && `"${c.alias}"`}</h3>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-neutral-800/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Stress</span>
                    <Tracker value={c.stress} max={9} onChange={()=>{}} type="box" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isB68 = activeChar.game === "B68";
  const currencyName = isB68 ? "Stacks" : "Coin";
  const stashName = isB68 ? "Bank" : "Stash";
  const traumaName = isB68 ? "Deadlocks" : "Trauma";

  // Section definitions for mobile nav
  const SECTIONS = [
    { id: "abilities", label: "Abilities", icon: <Target size={18} /> },
    { id: "traits",    label: "Traits",    icon: <User size={18} /> },
    { id: "special",   label: "Special",   icon: <Star size={18} /> },
    { id: "items",     label: "Items",     icon: <Package size={18} /> },
    { id: "combat",    label: "Combat",    icon: <Skull size={18} /> },
    { id: "notes",     label: "Notes",     icon: <FileText size={18} /> },
  ];

  const renderDesktopTabs = () => (
    <div className="flex bg-[var(--bg0)] rounded-lg p-1 border border-neutral-800 shadow-inner gap-0.5">
      {SECTIONS.map(s => (
        <button
          key={s.id}
          onClick={() => setActiveSection(s.id)}
          className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === s.id ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );

  const renderSection = () => {
    switch(activeSection) {
      case "abilities":
        return <AbilitiesScreen activeChar={activeChar} updateChar={updateChar} updateNested={updateNested} />;
      case "traits":
        return <TraitsScreen activeChar={activeChar} updateChar={updateChar} isB68={isB68} traumaName={traumaName} />;
      case "special":
        return <SpecialScreen activeChar={activeChar} updateChar={updateChar} updateNested={updateNested} isB68={isB68} traumaName={traumaName} setModal={setModal} />;
      case "items":
        return <ItemsScreen activeChar={activeChar} updateChar={updateChar} updateNested={updateNested} isB68={isB68} />;
      case "combat":
        return <CombatScreen activeChar={activeChar} updateChar={updateChar} updateNested={updateNested} isB68={isB68} traumaName={traumaName} />;
      case "notes":
        return (
          <div className="animate-fade-in flex flex-col bg-[var(--bg2)] border border-neutral-800 rounded-2xl p-6 shadow-sm h-full min-h-[60vh]">
            <div className="flex items-center gap-2 mb-4 text-neutral-500">
              <FileText size={14} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Personal Log & Notes</h3>
            </div>
            <textarea
              value={activeChar.notes || ""}
              onChange={e => updateChar({ notes: e.target.value })}
              placeholder="Record your scores, contacts, and personal goals here..."
              className="flex-1 w-full bg-[var(--bg0)] border border-neutral-800 rounded-xl p-6 text-neutral-200 outline-none focus:border-red-900/50 transition-colors resize-none font-sans leading-relaxed hide-scroll shadow-inner"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const charBgUrl = activeChar?.avatar
    ? `${activePb.baseUrl}/api/files/characters/${activeChar.id}/${activeChar.avatar}?thumb=1200x0`
    : null;

  return (
    <div className={`animate-fade-in max-w-5xl mx-auto pb-28 relative ${charBgUrl ? 'has-char-bg' : ''}`}>
      <style>{STYLES}</style>

      {/* ── Full-bleed character portrait background ── */}
      {charBgUrl && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          {/* Desaturated portrait */}
          <img
            src={charBgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ filter: 'grayscale(1)', opacity: 0.45 }}
          />
          {/* Red tint — mimics a multiply layer */}
          <div className="absolute inset-0" style={{ background: 'rgba(110, 0, 0, 0.55)' }} />
          {/* Gradient: fade to near-black at the bottom so content stays readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.80) 80%)' }} />
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center bg-[var(--bg2)] p-3 rounded-xl border border-neutral-800 sticky top-0 z-20 shadow-md mb-4">
        {/* Back + Mobile search/dice */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <button onClick={() => { setActiveCharId(null); setActiveSection("abilities"); }} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> <span className="text-sm font-bold">Roster</span>
          </button>

          {/* Mobile action buttons */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <div className="flex items-center gap-1 bg-[var(--bg2)] border border-neutral-700 rounded-lg px-2 py-1 relative">
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search compendium..."
                  className="bg-transparent text-xs text-neutral-200 outline-none w-36"
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(""); setCompendiumResults([]); } }}
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setCompendiumResults([]); }} className="text-neutral-500 hover:text-white"><X size={12} /></button>
                {compendiumResults.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 w-72 bg-[var(--bg2)] border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto hide-scroll">
                    {compendiumResults.map(r => (
                      <button key={r.id} onClick={() => { setModal(r); setSearchOpen(false); setSearchQuery(""); setCompendiumResults([]); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 last:border-0">
                        <div className="text-xs font-bold text-neutral-200 truncate">{r.title}</div>
                        <div className="text-[10px] text-neutral-500 truncate mt-0.5">{r.subcategory} · {r.source}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 bg-neutral-800 text-neutral-300 rounded-lg"><Search size={16} /></button>
            )}
            <button onClick={() => setDiceOpen(true)} className="p-2 bg-neutral-800 text-neutral-300 rounded-lg"><Dices size={18} /></button>
            {/* Currency button */}
            <button
              onClick={() => setCurrencyOpen(true)}
              className="p-2 bg-neutral-800 text-neutral-300 rounded-lg flex items-center gap-1 relative"
              title={`${currencyName}: ${activeChar.coin} / ${stashName}: ${activeChar.stash}`}
            >
              <span className="text-[10px] font-black text-neutral-400">{activeChar.coin}</span>
              <span className="text-[8px] text-neutral-600">|</span>
              <span className="text-[10px] font-black text-neutral-400">{activeChar.stash}</span>
            </button>
          </div>
        </div>

        <div className="hidden sm:block h-4 w-px bg-neutral-800" />

        {/* Avatar — detail header */}
        <div
          className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 cursor-pointer group/hav"
          onClick={() => avatarInputRef.current?.click()}
          title="Change avatar"
        >
          {getAvatarUrl(activeChar)
            ? <img src={getAvatarUrl(activeChar)} alt="" className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-neutral-500">{(activeChar.name || '?')[0].toUpperCase()}</span>
          }
          {avatarUploading
            ? <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><div className="w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" /></div>
            : <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/hav:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[8px] text-white font-bold uppercase tracking-wider">Edit</span></div>
          }
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => uploadAvatar(activeChar.id, e.target.files[0])} />
        </div>

        {/* Name / Alias / Playbook */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center min-w-0">
          <input value={activeChar.name} onChange={e => updateChar({name: e.target.value})} className="w-full bg-transparent border-b border-neutral-800 sm:border-transparent hover:border-neutral-700 focus:border-red-500 pb-0.5 text-white font-bold outline-none transition-colors" placeholder="Name" />
          <input value={activeChar.alias} onChange={e => updateChar({alias: e.target.value})} className="w-full bg-transparent border-b border-neutral-800 sm:border-transparent hover:border-neutral-700 focus:border-red-500 pb-0.5 text-neutral-400 italic font-bold outline-none transition-colors" placeholder="Alias" />
          <div className="hidden sm:block text-right">
            <select value={activeChar.playbook} onChange={e => updateChar({playbook: e.target.value})} className="bg-transparent text-xs font-black uppercase tracking-widest text-neutral-500 outline-none appearance-none cursor-pointer">
              {Object.keys(PLAYBOOKS[activeChar.game] || {}).map(playbookName => (
                <option key={playbookName} value={playbookName} className="bg-neutral-900 text-white">{playbookName}</option>
              ))}
            </select>
            <div className="text-[9px] text-neutral-600 uppercase font-bold">{isB68 ? "Blades '68" : "BitD Core"}</div>
          </div>
        </div>

        <div className="hidden sm:block h-4 w-px bg-neutral-800" />

        {/* Desktop-only actions */}
        <div className="hidden sm:flex items-center gap-2 pr-2 flex-wrap">
          {/* Search pop-out */}
          <div className="flex items-center gap-1 relative">
            {searchOpen && (
              <>
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search compendium..."
                  className="search-slide bg-[var(--bg3)] border border-neutral-700 rounded-lg px-3 py-1 text-sm text-neutral-200 outline-none focus:border-red-500 w-52"
                  onBlur={() => { if (!searchQuery) { setSearchOpen(false); setCompendiumResults([]); } }}
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(""); setCompendiumResults([]); } }}
                />
                {compendiumResults.length > 0 && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-[var(--bg2)] border border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto hide-scroll">
                    {compendiumResults.map(r => (
                      <button key={r.id} onClick={() => { setModal(r); setSearchOpen(false); setSearchQuery(""); setCompendiumResults([]); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 last:border-0">
                        <div className="text-xs font-bold text-neutral-200 truncate">{r.title}</div>
                        <div className="text-[10px] text-neutral-500 truncate mt-0.5">{r.subcategory} · {r.source}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) { setSearchQuery(""); setCompendiumResults([]); } }} className={`p-2 rounded-lg transition-colors ${searchOpen ? 'bg-red-900/40 text-red-400' : 'bg-neutral-800 text-neutral-300 hover:text-red-400'}`}>
              <Search size={18} />
            </button>
          </div>

          <button onClick={() => setDiceOpen(true)} className="p-2 bg-neutral-800 text-neutral-300 hover:text-red-400 rounded-lg transition-colors shadow-inner">
            <Dices size={18} />
          </button>

          {/* Currency button - desktop */}
          <button
            onClick={() => setCurrencyOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg transition-colors shadow-inner"
            title="Open currency"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{currencyName}: {activeChar.coin}</span>
            <span className="text-neutral-700">|</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{stashName}: {activeChar.stash}</span>
          </button>
        </div>
      </div>

      {/* DESKTOP SECTION TABS */}
      <div className="hidden md:flex items-center gap-3 mb-4">
        {renderDesktopTabs()}
      </div>

      {/* CONTENT */}
      <div className="animate-fade-in px-0">
        {renderSection()}
      </div>

      {/* MOBILE FLOATING NAV */}
      {isMobile && activeChar && (
        <MobileFloatingNav
          sections={SECTIONS}
          activeSection={activeSection}
          onSelect={(id) => { setActiveSection(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}

      {/* DICE MODAL */}
      {diceOpen && <DiceModal onClose={() => setDiceOpen(false)} />}

      {/* CURRENCY MODAL */}
      {currencyOpen && (
        <CurrencyModal
          activeChar={activeChar}
          updateChar={updateChar}
          currencyName={currencyName}
          stashName={stashName}
          onClose={() => setCurrencyOpen(false)}
        />
      )}
    </div>
  );
};

export default CharacterManager;