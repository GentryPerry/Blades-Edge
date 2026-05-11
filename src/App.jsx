import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown, ChevronRight, Swords, Shield, Dices, Moon, Sun, User, Users,
  Menu, X, Target, Globe, Search, BookOpen, Package, Star, Skull, Settings, Zap,
  Clock, Trash2, Plus, Minus, ArrowLeft, PlusCircle, ZapOff, FileText, GripVertical, Layout, Check as CheckIcon, MinusCircle
} from "lucide-react";
import { DB } from "./database";
import { callGemini } from "./gemini";
import CharacterManager from "./CharacterManager";
import CrewManager from "./CrewManager";
import PocketBase from 'pocketbase';
import AuthScreen from './AuthScreen';
import BladesReader from './BladesReader';
import { ALL_SOURCES, srcLabel, accentColor } from "./gamedata.jsx";
import DiceRoller from "./diceroller.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

const pb = new PocketBase('https://apiblades.gentryperry.com');

// --- CUSTOM ANIMATION STYLES ---
const STYLES = `
:root {
  --bg0: #09090b;
  --bg1: #0f0f11;
  --bg2: #111113;
  --bg3: #1f1f1f;
  --bg-sidebar-hdr: rgba(0,0,0,0.3);
  --bg-app-hdr: rgba(12,12,14,0.95);
  --bg-app-search: #09090b;
  --border: #27272a;
  --border-alt: #1f1f1f;
  --text: #e5e5e5;
  --text-bright: #ffffff;
  --text-dim: #a1a1aa;
  --text-muted: #6b7280;
  --scrollbar-thumb: #27272a;
  --grid-line: rgba(255,255,255,0.08);
  --rule-title-bitd: #f5f5f5;
  --rule-title-dc: #fecaca;
  --rule-title-b68: #bfdbfe;
}
[data-theme="light"] {
  --bg0: #f5f5f7;
  --bg1: #ffffff;
  --bg2: #f0f0f2;
  --bg3: #e4e4e7;
  --bg-sidebar-hdr: rgba(230,230,235,0.9);
  --bg-app-hdr: rgba(245,245,247,0.97);
  --bg-app-search: #f5f5f7;
  --border: #d4d4d8;
  --border-alt: #e4e4e7;
  --text: #18181b;
  --text-bright: #09090b;
  --text-dim: #52525b;
  --text-muted: #71717a;
  --scrollbar-thumb: #c4c4c8;
  --grid-line: rgba(0,0,0,0.07);
  --rule-title-bitd: #18181b;
  --rule-title-dc: #991b1b;
  --rule-title-b68: #1d4ed8;
  color-scheme: light;
}
[data-theme="light"] .text-neutral-100 { color: #18181b !important; }
[data-theme="light"] .text-neutral-200 { color: #27272a !important; }
[data-theme="light"] .text-neutral-300 { color: #3f3f46 !important; }
[data-theme="light"] .text-neutral-400 { color: #52525b !important; }
[data-theme="light"] .text-neutral-500 { color: #71717a !important; }
[data-theme="light"] .text-neutral-600 { color: #71717a !important; }
[data-theme="light"] .text-white { color: #18181b !important; }
[data-theme="light"] .border-neutral-800 { border-color: var(--border) !important; }
[data-theme="light"] .border-neutral-800\\/50 { border-color: rgba(212,212,216,0.5) !important; }
[data-theme="light"] .border-neutral-700 { border-color: #a1a1aa !important; }
[data-theme="light"] .border-neutral-600 { border-color: #a1a1aa !important; }
[data-theme="light"] .border-neutral-500 { border-color: #a1a1aa !important; }
[data-theme="light"] .bg-neutral-900 { background-color: var(--bg2) !important; }
[data-theme="light"] .bg-neutral-900\\/30 { background-color: rgba(230,230,233,0.3) !important; }
[data-theme="light"] .bg-neutral-900\\/50 { background-color: rgba(230,230,233,0.5) !important; }
[data-theme="light"] .bg-neutral-800 { background-color: var(--bg3) !important; }
[data-theme="light"] .bg-neutral-700 { background-color: #d4d4d8 !important; }
[data-theme="light"] .bg-neutral-800\\/60 { background-color: rgba(228,228,231,0.6) !important; }
[data-theme="light"] .bg-neutral-800\\/80 { background-color: rgba(228,228,231,0.8) !important; }
[data-theme="light"] .bg-black\\/20 { background-color: rgba(0,0,0,0.04) !important; }
[data-theme="light"] .hover\\:text-white:hover { color: #09090b !important; }
[data-theme="light"] .hover\\:bg-neutral-800:hover { background-color: var(--bg3) !important; }
[data-theme="light"] .hover\\:bg-neutral-900:hover { background-color: var(--bg2) !important; }
[data-theme="light"] .hover\\:bg-neutral-800\\/60:hover { background-color: rgba(228,228,231,0.6) !important; }
[data-theme="light"] .hover\\:bg-neutral-800\\/80:hover { background-color: rgba(228,228,231,0.8) !important; }
[data-theme="light"] .hover\\:border-neutral-700:hover { border-color: #a1a1aa !important; }
[data-theme="light"] .hover\\:border-neutral-500:hover { border-color: #a1a1aa !important; }
[data-theme="light"] .markdown-content strong { color: #18181b !important; }
[data-theme="light"] .hide-scroll::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thumb) !important; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.markdown-content strong { color: #f3f4f6; }
.hide-scroll::-webkit-scrollbar { width: 6px; }
.hide-scroll::-webkit-scrollbar-track { background: transparent; }
.hide-scroll::-webkit-scrollbar-thumb { background-color: #27272a; border-radius: 10px; }
.key-tick { transform: skewX(-15deg); }
.damage-pill { border-radius: 999px; transform: skewX(-15deg); width: 14px; height: 20px; }
`;

// --- ICON MAP FOR LOCAL STORAGE COMPATIBILITY ---
const ICON_MAP = {
  Swords: <Swords size={12}/>,
  Dices: <Dices size={12}/>,
  Shield: <Shield size={12}/>,
  Moon: <Moon size={12}/>,
  BookOpen: <BookOpen size={12}/>,
  Package: <Package size={12}/>,
  User: <User size={12}/>,
  Users: <Users size={12}/>,
  Skull: <Skull size={12}/>,
  Clock: <Clock size={12}/>,
  Zap: <Zap size={12}/>,
  Globe: <Globe size={12}/>,
  Target: <Target size={12}/>,
  Star: <Star size={12}/>,
  Settings: <Settings size={12}/>
};

const DEFAULT_NAV = [
  // Core play-loop reference — what you need at the table during a score
  { id: "cat-player", role:"player", label:"Scoundrel", category:"Player", hidden: false, tabs:[
    { id:"Actions",        label:"Actions",           icon:"Swords",   hidden: false },
    { id:"Rolls",          label:"Rolls",             icon:"Dices",    hidden: false },
    { id:"Pos & Effect",   label:"Position & Effect", icon:"Shield",   hidden: false },
    { id:"Downtime",       label:"Downtime",          icon:"Moon",     hidden: false },
    { id:"Teamwork",       label:"Teamwork",          icon:"Users",    hidden: false },
    { id:"Consequences",   label:"Consequences",      icon:"Skull",    hidden: false },
    { id:"Standard Items", label:"Items",             icon:"Package",  hidden: false },
  ]},
  // Character identity & creation — playbooks, traits, personal rules
  { id: "cat-character", role:"player", label:"Identity", category:"Player", hidden: false, tabs:[
    { id:"Playbooks",      label:"Playbooks",         icon:"BookOpen", hidden: false },
    { id:"Heritage",       label:"Heritage",          icon:"Globe",    hidden: false },
    { id:"Background",     label:"Background",        icon:"User",     hidden: false },
    { id:"Vice",           label:"Vice",              icon:"Star",     hidden: false },
    { id:"Trauma",         label:"Trauma",            icon:"Zap",      hidden: false },
    { id:"Rules",          label:"Rules",             icon:"BookOpen", hidden: false },
  ]},
  // Crew management — types first (most consulted), stats last
  { id: "cat-crew", role:"crew", label:"Crew", category:"Crew", hidden: false, tabs:[
    { id:"Playbooks", label:"Crew Types", icon:"BookOpen",  hidden: false },
    { id:"Cohorts",   label:"Cohorts",   icon:"Users",     hidden: false },
    { id:"Upgrades",  label:"Upgrades",  icon:"Settings",  hidden: false },
    { id:"Stats",     label:"Stats",     icon:"Target",    hidden: false },
  ]},
  // GM-facing: running the game + world lore all in one place
  { id: "cat-storyteller", role:"storyteller", label:"Storyteller", category:"Storyteller", hidden: false, tabs:[
    { id:"Entanglements", label:"Entanglements", icon:"Skull",    hidden: false },
    { id:"Clocks",        label:"Clocks",        icon:"Clock",    hidden: false },
    { id:"Generators ✨",  label:"Generators",   icon:"Zap",      hidden: false },
    { id:"Factions",      label:"Factions",      icon:"Globe",    hidden: false, category:"World" },
    { id:"Setting",       label:"Setting",       icon:"Moon",     hidden: false, category:"World" },
    { id:"Rules",         label:"GM Rules",      icon:"BookOpen", hidden: false },
  ]},
];

// --- SHARED HELPERS ---
const ClockSVG = ({ segments, filled, className = "w-24 h-24" }) => {
  const radius = 48;
  const center = 50;
  const paths = [];
  const ratio = filled / segments;
  const isFull = ratio === 1;

  // Graduated fill color — shifts from grey → amber → orange → red as it fills
  let fillColor = "#71717a";
  if      (isFull)      fillColor = "#ef4444";
  else if (ratio >= 0.75) fillColor = "#f97316";
  else if (ratio >= 0.5)  fillColor = "#f59e0b";

  for (let i = 0; i < segments; i++) {
    const startAngle = (i * 360) / segments - 90;
    const endAngle   = ((i + 1) * 360) / segments - 90;
    const startRad   = (Math.PI / 180) * startAngle;
    const endRad     = (Math.PI / 180) * endAngle;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");
    paths.push(
      <path
        key={i}
        d={pathData}
        fill={i < filled ? fillColor : "transparent"}
        stroke="var(--border)"
        strokeWidth="2"
        className="clock-path"
      />
    );
  }

  return (
    <div
      className={isFull ? "animate-clock-glow" : ""}
      style={{ display:"inline-flex", transition:"filter 0.5s ease" }}
    >
      <svg viewBox="0 0 100 100" className={`${className} block mx-auto`}>
        {/* Outer ring gets a subtle inner glow when full */}
        <circle cx="50" cy="50" r="48" fill="var(--bg1)" stroke={isFull ? "#ef444466" : "var(--border)"} strokeWidth="2"
          style={{ transition:"stroke 0.4s ease" }} />
        {paths}
        {/* Center dot accent */}
        <circle cx="50" cy="50" r="3" fill={isFull ? "#ef4444" : "var(--border-alt)"}
          style={{ transition:"fill 0.4s ease" }} />
      </svg>
    </div>
  );
};

// --- UI COMPONENT DEFINITIONS ---
const SrcBadge = ({ source, page, a }) => (
  <span className="text-xs font-semibold px-2 py-0.5 rounded shadow-sm" style={{ background:a.badge, color:a.badgeTxt }}>
    {srcLabel(source)}{page ? <span style={{ opacity:0.6 }}> · p.{page}</span> : null}
  </span>
);

const RuleModal = ({ rule, onClose, isFavorite, toggleFavorite }) => {
  const a = accentColor(rule.source);
  const subLabel = rule["sub-subcategory"] || rule.sub;
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!rule) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}
      onClick={onClose}>
      {/* Ambient source-color glow behind the modal */}
      <div className="absolute pointer-events-none rounded-full"
        style={{
          width: 520, height: 520,
          background: `radial-gradient(ellipse at center, ${a.bar}28 0%, transparent 65%)`,
          animation: 'ambientGlow 3s ease-in-out infinite',
        }}
      />
      <div role="dialog" aria-modal="true" aria-labelledby="rule-title" className="relative rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-spring-in"
        style={{ background:"var(--bg1)", width:"80%", maxWidth:520, maxHeight:"85vh", border:`1px solid ${a.bar}40`, boxShadow:`0 0 0 1px var(--border), 0 24px 64px rgba(0,0,0,0.6), 0 0 40px ${a.bar}18` }}
        onClick={e => e.stopPropagation()}>
        <div style={{ height:4, background:a.bar, flexShrink:0, boxShadow:`0 0 16px ${a.bar}80` }}/>
        <div className="px-6 pt-5 pb-4 border-b border-neutral-800 shrink-0">
          {subLabel && <span className="block mb-1.5 uppercase tracking-widest font-bold" style={{ fontSize:10, color:"#6b7280" }}>{subLabel}</span>}
          <div className="flex items-start justify-between gap-3">
            <h2 id="rule-title" className="text-2xl font-black leading-tight" style={{ color:a.title }}>{rule.title}</h2>
            <div className="flex items-center gap-2 shrink-0">
              {toggleFavorite && <button type="button" onClick={() => toggleFavorite(rule.id)} aria-label="Toggle Favorite" className={`p-1.5 rounded-full transition-colors ${isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`} style={{ background: isFavorite ? "rgba(251, 191, 36, 0.1)" : "var(--bg3)" }}>
                <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>}
              <button type="button" ref={closeRef} onClick={onClose} aria-label="Close" className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors" style={{ background:"var(--bg3)" }}>
                <X size={18}/>
              </button>
            </div>
          </div>
          <p className="text-neutral-400 text-sm mt-2 leading-relaxed italic">{rule.preview}</p>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 hide-scroll">
          <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap" style={{ fontSize:15 }}>{rule.content}</p>
          {rule.tags && (
            <div className="flex flex-wrap gap-2 pt-2">
              {rule.tags.split(",").map((t) => (
                <span key={t.trim()} className="border border-neutral-700 text-neutral-400 px-2.5 py-1 rounded-full shadow-sm"
                  style={{ fontSize:11, background:"var(--bg3)" }}>#{t.trim()}</span>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-neutral-800 shrink-0 flex items-center justify-between" style={{ background:"var(--bg-sidebar-hdr)" }}>
          <SrcBadge source={rule.source} page={rule.page} a={a}/>
        </div>
      </div>
    </div>
  );
};

const RuleTile = ({ rule, onClick, index, isFavorite }) => {
  const a = accentColor(rule.source);
  const subLabel = rule["sub-subcategory"] || rule.sub;
  return (
    <button type="button" onClick={() => onClick(rule)}
      className="shimmer-card text-left rounded-xl overflow-hidden flex flex-col active:scale-95 animate-tile-in relative"
      style={{
        background:      "var(--bg2)",
        border:          "1px solid var(--border-alt)",
        animationDelay:  `${index * 30}ms`,
        transition:      "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform    = "translateY(-3px) scale(1.005)";
        e.currentTarget.style.boxShadow   = `0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px var(--border)`;
        e.currentTarget.style.borderColor = "var(--border)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = "";
        e.currentTarget.style.boxShadow   = "";
        e.currentTarget.style.borderColor = "";
      }}
    >
      {isFavorite && <Star size={14} className="absolute top-3 right-3 text-amber-400 z-10 drop-shadow-md" fill="currentColor" />}
      {/* Color bar with glow */}
      <div style={{ height:3, background:a.bar, flexShrink:0, boxShadow:`0 0 8px ${a.bar}80` }}/>
      <div className="p-4 flex flex-col flex-1" style={{ minHeight:110 }}>
        {subLabel && <span className="block mb-1 uppercase tracking-widest font-bold text-neutral-500 pr-5" style={{ fontSize:9 }}>{subLabel}</span>}
        <h3 className="font-bold leading-snug mb-1.5 pr-5" style={{ fontSize:15, color:a.title }}>{rule.title}</h3>
        <p className="text-neutral-400 leading-snug line-clamp-3 flex-1" style={{ fontSize:12 }}>{rule.preview}</p>
        <div className="flex items-center gap-2 mt-3 pt-2 border-t" style={{ borderColor:"var(--border-alt)" }}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:a.dot, boxShadow:`0 0 4px ${a.dot}` }}/>
          <span className="text-neutral-500 tracking-wide font-medium" style={{ fontSize:10 }}>
            {srcLabel(rule.source)}{rule.page ? ` · p.${rule.page}` : ""}
          </span>
        </div>
      </div>
    </button>
  );
};

const SettingsModal = ({ visible, setVisible, onClose, lightMode, setLightMode }) => {
  const dots = { "BitD Core":"#737373", "Deep Cuts":"#ef4444", "B68":"#3b82f6" };
  const toggle = s => setVisible(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }}
      onClick={onClose}>
      <div className="rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-scale-in"
        style={{ background:"var(--bg2)", width:"80%", maxWidth:400 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-800" style={{ background:"var(--bg-sidebar-hdr)" }}>
          <h2 className="text-lg font-black text-neutral-100">Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-neutral-500 hover:text-white transition-colors"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-3">
          {/* Appearance / Theme Toggle */}
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 pb-1">Appearance</p>
          <button type="button" onClick={() => setLightMode(lm => !lm)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-neutral-700 transition-all duration-200 hover:border-neutral-500 shadow-sm"
            style={{ background:"var(--bg3)" }}>
            <div className="flex items-center gap-3">
              {lightMode
                ? <Sun size={16} className="text-amber-500"/>
                : <Moon size={16} className="text-blue-400"/>}
              <span className="text-sm font-bold text-neutral-200">{lightMode ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 ${lightMode ? "bg-amber-400" : "bg-neutral-700"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${lightMode ? "translate-x-4" : "translate-x-0"}`}/>
            </div>
          </button>

          <div className="border-t border-neutral-800 pt-3 mt-1">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 pb-2">Source Visibility</p>
            <p className="text-sm text-neutral-400 pb-2">Toggle which source books appear in the compendium and search results.</p>
          </div>
          {ALL_SOURCES.map(src => {
            const on = visible.includes(src);
            return (
              <button key={src} type="button" onClick={() => toggle(src)}
                aria-pressed={on}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200 hover:border-neutral-500 ${on ? "border-neutral-600 shadow-sm" : "border-neutral-800 opacity-50 hover:opacity-100"}`}
                style={{ background: on ? "var(--bg3)" : "var(--bg1)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ background:dots[src]||"#737373" }}/>
                  <span className="text-sm font-bold text-neutral-200">{srcLabel(src)}</span>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 ${on?"bg-neutral-400":"bg-neutral-700"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${on?"translate-x-4":"translate-x-0"}`}/>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * SafeMarkdown — renders a plain-text string that may contain **bold** markers
 * and newlines. Produces only React elements — no raw HTML injection.
 */
const SafeMarkdown = ({ text }) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n').map((line, li) => {
        // Split each line on **...** markers
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <React.Fragment key={li}>
            {parts.map((part, pi) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={pi} className="text-white">{part.slice(2, -2)}</strong>
                : <React.Fragment key={pi}>{part}</React.Fragment>
            )}
            {li < text.split('\n').length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
};

const GeneratorsView = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState(null);
  const [setting, setSetting] = useState("B68");

  const generate = async (type) => {
    setLoading(true);
    setActiveType(type);
    setResult("");
    let promptContext = setting === "BitD Core"
      ? "Original Blades in the Dark (Doskvol, Victorian industrial, ghosts, lightning barriers)."
      : "Blades '68 (Retro-futuristic 1960s spy-fi/cyberpunk, plasmovision, secret agents, 'The Bubble').";
    let specificRequest = "";
    if (type === "NPC") {
      specificRequest = "Create a unique NPC. Provide their Name/Alias, a detailed physical description, a strange quirk, and their secret motive within 3 sentences and some bullet points of additional flavor.";
    } else if (type === "Hook") {
      specificRequest = "Create a score hook. Provide the Client, the Target, the Job, and a deadly Twist within 3 sentences and some bullet points of additional flavor.";
    } else if (type === "Cold Open") {
      specificRequest = "Write a cinematic 'in media res' scene. Use sensory details. End with 'What do you do?' within 3 sentences and some bullet points of additional flavor.";
    } else if (type === "Codename") {
      specificRequest = "Generate exactly 10 gritty, thematic agent codenames (e.g., 'Iron Ghost', 'Copper Raven'). Format as a clean numbered list.";
    }
    const finalPrompt = `[SYSTEM: ${promptContext}]\n[TASK: ${specificRequest}]\n[CONSTRAINT: Do not repeat the prompt. Begin immediately with the content. Use Markdown bolding for headers.]`;
    const res = await callGemini(finalPrompt);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex bg-[var(--bg0)] rounded-xl p-1.5 border border-neutral-800 shadow-inner">
        <button onClick={() => setSetting("BitD Core")}
          className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${setting === "BitD Core" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}>
          Blades Core
        </button>
        <button onClick={() => setSetting("B68")}
          className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${setting === "B68" ? "bg-blue-900/60 text-blue-200 shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}>
          Blades '68
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <button onClick={() => generate("NPC")} disabled={loading} className={`p-4 rounded-xl border border-neutral-800 shadow-sm flex flex-col items-center gap-2 transition-all active:scale-95 ${activeType === "NPC" ? "bg-neutral-800" : "bg-[var(--bg2)] hover:bg-neutral-800/80"}`}>
          <User size={20} className="text-amber-400" />
          <span className="font-bold text-sm text-neutral-200">NPC</span>
        </button>
        <button onClick={() => generate("Hook")} disabled={loading} className={`p-4 rounded-xl border border-neutral-800 shadow-sm flex flex-col items-center gap-2 transition-all active:scale-95 ${activeType === "Hook" ? "bg-neutral-800" : "bg-[var(--bg2)] hover:bg-neutral-800/80"}`}>
          <Target size={20} className="text-red-400" />
          <span className="font-bold text-sm text-neutral-200">Score Hook</span>
        </button>
        <button onClick={() => generate("Cold Open")} disabled={loading} className={`p-4 rounded-xl border border-neutral-800 shadow-sm flex flex-col items-center gap-2 transition-all active:scale-95 ${activeType === "Cold Open" ? "bg-neutral-800" : "bg-[var(--bg2)] hover:bg-neutral-800/80"}`}>
          <Zap size={20} className="text-blue-400" />
          <span className="font-bold text-sm text-neutral-200">Cold Open</span>
        </button>
        <button onClick={() => generate("Codename")} disabled={loading} className={`p-4 rounded-xl border border-neutral-800 shadow-sm flex flex-col items-center gap-2 transition-all active:scale-95 ${activeType === "Codename" ? "bg-neutral-800" : "bg-[var(--bg2)] hover:bg-neutral-800/80"}`}>
          <Users size={20} className="text-purple-400" />
          <span className="font-bold text-sm text-neutral-200">Codenames</span>
        </button>
      </div>
      {(result || loading) && (
        <div className="border border-neutral-800 rounded-xl p-8 shadow-sm w-full min-h-[200px] flex flex-col animate-slide-up relative overflow-hidden" style={{ background:"var(--bg2)" }}>
          {setting === "B68" && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/50" />}
          {setting === "BitD Core" && <div className="absolute top-0 left-0 w-full h-1 bg-neutral-600/50" />}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full flex-1 text-neutral-500 gap-3">
              <div className="w-6 h-6 border-2 border-neutral-600 border-t-neutral-200 rounded-full animate-spin" />
              <p className="text-sm italic">Consulting the Void Sea...</p>
            </div>
          ) : (
            <div className="text-sm text-neutral-300 leading-relaxed markdown-content hide-scroll overflow-y-auto">
              <SafeMarkdown text={result} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ClockCard = ({ clock, onUpdate, onDelete }) => {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const isFull = clock.filled === clock.segments;
  const isEmpty = clock.filled === 0;
  const getSuggestion = async () => {
    setLoading(true);
    const prompt = `A progress clock named "${clock.name}" has just filled up in my Blades in the Dark game. Give me a 1 to 2 sentence gritty, actionable narrative consequence that the players now face.`;
    const res = await callGemini(prompt);
    setSuggestion(res);
    setLoading(false);
  };
  return (
    <div
      className="rounded-xl p-5 flex flex-col items-center relative animate-spring-in"
      style={{
        background:   "var(--bg2)",
        border:       isFull ? "1px solid rgba(239,68,68,0.35)" : "1px solid var(--border)",
        boxShadow:    isFull ? "0 0 24px rgba(239,68,68,0.12), inset 0 0 24px rgba(239,68,68,0.04)" : "none",
        transition:   "border-color 0.5s ease, box-shadow 0.5s ease",
      }}
    >
      <button onClick={onDelete} className="absolute top-3 right-3 text-neutral-700 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-950/20" aria-label="Delete Clock">
        <Trash2 size={15} />
      </button>
      <h3 className="font-bold text-center text-neutral-200 mb-4 px-4 line-clamp-2 w-full" style={{ minHeight: 40 }}>{clock.name}</h3>
      <ClockSVG segments={clock.segments} filled={clock.filled} />
      <div className="flex items-center justify-between w-full mt-5 px-2">
        <button onClick={() => onUpdate(-1)} disabled={isEmpty} aria-label="Remove Segment"
          className="p-2.5 rounded-full border text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
          style={{ background:"var(--bg3)", borderColor:"var(--border)" }}>
          <Minus size={15}/>
        </button>
        <span
          key={`${clock.filled}/${clock.segments}`}
          className="font-black tracking-widest w-12 text-center text-sm animate-spring-in"
          style={{ color: isFull ? "#ef4444" : "var(--text-muted)", transition:"color 0.4s ease" }}
        >
          {clock.filled}/{clock.segments}
        </span>
        <button onClick={() => onUpdate(1)} disabled={isFull} aria-label="Add Segment"
          className="p-2.5 rounded-full border text-neutral-400 hover:text-white hover:bg-neutral-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all active:scale-90"
          style={{ background:"var(--bg3)", borderColor:"var(--border)" }}>
          <Plus size={15}/>
        </button>
      </div>
      {isFull && (
        <div className="mt-5 w-full animate-fade-in">
          <button onClick={getSuggestion} disabled={loading} className="w-full text-xs font-bold uppercase tracking-widest bg-red-950/30 border border-red-900/50 hover:bg-red-900/40 text-red-400 py-2.5 rounded-lg transition-colors flex justify-center items-center gap-1.5 active:scale-95">
            {loading ? "Divining..." : "✨ What Happens?"}
          </button>
          {suggestion && (
            <div className="mt-3 p-3 bg-[var(--bg0)] rounded-lg text-xs text-neutral-300 leading-relaxed border border-neutral-800 italic shadow-inner animate-slide-up hide-scroll max-h-32 overflow-y-auto">
              "{suggestion}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ClocksView = ({ clocks, setClocks }) => {
  const [name, setName] = useState("");
  const [segments, setSegments] = useState(4);
  const addClock = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setClocks([...clocks, { id: Date.now().toString(), name: name.trim(), segments, filled: 0 }]);
    setName("");
  };
  const updateClock = (id, delta) => {
    setClocks(clocks.map(c => {
      if (c.id === id) {
        const newFilled = Math.max(0, Math.min(c.segments, c.filled + delta));
        return { ...c, filled: newFilled };
      }
      return c;
    }));
  };
  const deleteClock = (id) => setClocks(clocks.filter(c => c.id !== id));
  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={addClock} className="bg-[var(--bg2)] p-5 rounded-xl border border-neutral-800 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Clock Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="E.g., The Bluecoats Arrive" className="w-full bg-[var(--bg0)] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-200 outline-none focus:border-neutral-500 transition-colors" />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Segments</label>
          <div className="flex gap-2">
            {[4, 6, 8].map(s => (
              <button type="button" key={s} onClick={() => setSegments(s)} className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${segments === s ? 'bg-neutral-700 text-white shadow-md' : 'bg-[var(--bg0)] border border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}>{s}</button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={!name.trim()} className="w-full sm:w-auto px-6 py-2.5 bg-neutral-200 text-black font-bold rounded-lg text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Add Clock</button>
      </form>
      {clocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
          <Clock size={32} className="mb-3 opacity-20" />
          <p className="text-center italic text-sm">No clocks active right now.</p>
        </div>
      ) : (
        <div className="grid gap-4 items-start" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))" }}>
          {clocks.map(c => (
            <ClockCard key={c.id} clock={c} onUpdate={(delta) => updateClock(c.id, delta)} onDelete={() => deleteClock(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
};
// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [showReader, setShowReader] = useState(false);
  const [showBitDReader, setShowBitDReader] = useState(false);

  // --- GATEKEEPER LOGIC ---
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  useEffect(() => {
    // pb.authStore.onChange returns an unsubscribe fn — return it so React
    // cleans it up on unmount and prevents listener accumulation on hot-reload.
    return pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    });
  }, []);

  const handleLogout = () => { pb.authStore.clear(); };

  const [lightMode, setLightMode] = useState(() => {
    try { return localStorage.getItem('lightMode') === 'true'; } catch { return false; }
  });
  useEffect(() => { localStorage.setItem('lightMode', lightMode); }, [lightMode]);

  const [sidebar, setSidebar]           = useState(false);
  const [settingsOpen, setSettings]     = useState(false);
  const [isNavEditing, setIsNavEditing] = useState(false);
  const [dragContext, setDragContext]   = useState(null);

  const [navConfig, setNavConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('customNav');
      if (!saved) return DEFAULT_NAV;
      const parsed = JSON.parse(saved);
      if (parsed[0] && parsed[0].tabs[0] && typeof parsed[0].tabs[0].icon === 'object') {
        localStorage.removeItem('customNav');
        return DEFAULT_NAV;
      }
      // Bust cache if missing new cat-character category (nav restructure v2)
      if (!parsed.find(c => c.id === 'cat-character')) {
        localStorage.removeItem('customNav');
        return DEFAULT_NAV;
      }
      // Bust cache if Factions tab is missing its World category override (nav restructure v3)
      const stCat = parsed.find(c => c.id === 'cat-storyteller');
      const factionTab = stCat?.tabs?.find(t => t.id === 'Factions');
      if (!factionTab?.category) {
        localStorage.removeItem('customNav');
        return DEFAULT_NAV;
      }
      return parsed;
    } catch { return DEFAULT_NAV; }
  });

  const [exp, setExp] = useState({ "cat-player":true, "cat-character":true, "cat-crew":false, "cat-storyteller":true });
  const [role, setRole]                   = useState("roster");
  const [tab, setTab]                     = useState("Characters");
  const [showFavorites, setShowFavorites] = useState(false);
  const [q, setQ]                         = useState("");
  const [modal, setModal]                 = useState(null);
  const [vis, setVis]                     = useState([...ALL_SOURCES]);
  const [clocks, setClocks]               = useState(() => {
    try {
      const saved = localStorage.getItem('clocks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [characters, setCharacters] = useState(() => {
    try {
      const saved = localStorage.getItem('characters');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('characters', JSON.stringify(characters)); }, [characters]);
  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('customNav', JSON.stringify(navConfig)); }, [navConfig]);
  useEffect(() => { localStorage.setItem('clocks', JSON.stringify(clocks)); }, [clocks]);

  const toggleCatVisibility = (cIdx) => {
    const newNav = [...navConfig];
    newNav[cIdx].hidden = !newNav[cIdx].hidden;
    setNavConfig(newNav);
  };

  const toggleTabVisibility = (cIdx, tIdx) => {
    const newNav = [...navConfig];
    const cat = { ...newNav[cIdx] };
    const newTabs = [...cat.tabs];
    newTabs[tIdx].hidden = !newTabs[tIdx].hidden;
    cat.tabs = newTabs;
    newNav[cIdx] = cat;
    setNavConfig(newNav);
  };

  const handleDragStart = (e, type, catIndex, tabIndex = null) => {
    e.stopPropagation();
    setDragContext({ type, catIndex, tabIndex });
  };

  const handleDrop = (e, targetCatIndex, targetTabIndex = null) => {
    e.preventDefault();
    if (!dragContext) return;
    const newNav = [...navConfig];
    if (dragContext.type === 'category' && targetTabIndex === null) {
      const [movedCat] = newNav.splice(dragContext.catIndex, 1);
      newNav.splice(targetCatIndex, 0, movedCat);
    } else if (dragContext.type === 'tab' && targetTabIndex !== null && dragContext.catIndex === targetCatIndex) {
      const cat = { ...newNav[targetCatIndex] };
      const newTabs = [...cat.tabs];
      const [movedTab] = newTabs.splice(dragContext.tabIndex, 1);
      newTabs.splice(targetTabIndex, 0, movedTab);
      cat.tabs = newTabs;
      newNav[targetCatIndex] = cat;
    }
    setNavConfig(newNav);
    setDragContext(null);
  };

  const [activeCatId, setActiveCatId] = useState("cat-player");
  const section = navConfig.find(n => n.id === activeCatId) || navConfig.find(n => n.role === role);
  const qTrim   = q.trim();

  // Debounce the search query so the expensive DB filter only runs after typing pauses
  const [debouncedQ, setDebouncedQ] = useState(qTrim);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 180);
    return () => clearTimeout(id);
  }, [q]);

  // Helpers to detect which full-screen views are active (hide search bar for these)
  const isCharacterScreen = tab === "Characters" && role === "roster";
  const isCrewsScreen     = tab === "Crews"      && role === "crews";
  const hideSearchBar     = isCharacterScreen || isCrewsScreen;

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]);
  };

  const rules = useMemo(() => DB.filter(r => {
    if (!vis.includes(r.source)) return false;
    if (debouncedQ) {
      const lq = debouncedQ.toLowerCase();
      return ["title","content","tags","subcategory","preview","sub","sub-subcategory"].some(k => r[k]?.toLowerCase().includes(lq));
    }
    if (showFavorites) return false;
    if (tab === "Clocks" || tab === "Generators ✨" || tab === "Characters" || tab === "Dice Roller" || tab === "Crews") return false;
    const dbSub      = r.subcategory?.toLowerCase();
    const tabCompare = tab?.toLowerCase();
    // Use tab-level category override if present (e.g. Factions/Setting use "World" category in DB)
    const activeTab  = section?.tabs?.find(t => t.id === tab);
    const effectiveCategory = (activeTab?.category || section?.category)?.toLowerCase();
    if (tabCompare === 'pos & effect' && dbSub === 'pos & effect') {
      return r.category?.toLowerCase() === effectiveCategory;
    }
    return r.category?.toLowerCase() === effectiveCategory
        && r.subcategory?.toLowerCase() === tab?.toLowerCase();
  }), [vis, debouncedQ, showFavorites, section, tab]);

  const go = (r, t, isFav = false, catId = null) => { setRole(r); setTab(t); setShowFavorites(isFav); setSidebar(false); setQ(""); if (catId) setActiveCatId(catId); };
  const hdr = qTrim ? "Search Results" : showFavorites ? "Favorites" : tab;

  if (!isAuthenticated) {
    return <AuthScreen pb={pb} onLogin={() => setIsAuthenticated(true)} />;
  }

  // ==========================================
  // --- READER INTERCEPT ADDED HERE ---
  // ==========================================
  if (showReader) {
    return <BladesReader src="/blades_book/blades68_reference.html" onExit={() => setShowReader(false)} />;
  }
  if (showBitDReader) {
    return <BladesReader src="/blades_book/bitd_reference.html" onExit={() => setShowBitDReader(false)} />;
  }

  return (
    <div className="flex w-full h-screen overflow-hidden font-sans" data-theme={lightMode ? "light" : "dark"} style={{ background:"var(--bg0)", color:"var(--text)" }}>
      <style>{STYLES}</style>

      {/* Sidebar backdrop */}
      {sidebar && (
        <div className="fixed inset-0 z-40 animate-fade-in"
          style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(3px)" }}
          onClick={() => setSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col border-r border-neutral-800 shadow-2xl transition-transform duration-300 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width:260, background:"var(--bg2)" }}>
        <div className="px-6 py-5 border-b border-neutral-800 shrink-0" style={{ background:"var(--bg-sidebar-hdr)" }}>
          <p className="font-black uppercase tracking-widest text-neutral-200" style={{ fontSize:12 }}>Blade's Edge</p>
          <p className="text-neutral-500 mt-1 tracking-wide" style={{ fontSize:10 }}>Blades in the Dark Compendium</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 hide-scroll">
          {!isNavEditing ? (
            <>
              {/* Favorites */}
              <button type="button" onClick={() => go("player", "", true)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${showFavorites ? "bg-neutral-800 font-bold" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60"}`}
                style={showFavorites ? { color:"#fcd34d" } : {}}>
                <Star size={14} style={showFavorites ? { color:"#fbbf24" } : {}}/> Favorites
              </button>

              {/* Characters */}
              <button type="button" onClick={() => go("roster", "Characters")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${isCharacterScreen && !showFavorites ? "bg-neutral-800 text-white font-semibold shadow-sm" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60"}`}>
                <Users size={14} style={{ opacity: isCharacterScreen && !showFavorites ? 1 : 0.6 }}/> Characters
              </button>

              {/* Crews */}
              <button type="button" onClick={() => go("crews", "Crews")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${isCrewsScreen && !showFavorites ? "bg-neutral-800 text-white font-semibold shadow-sm" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60"}`}>
                <Shield size={14} style={{ opacity: isCrewsScreen && !showFavorites ? 1 : 0.6 }}/> Crews
              </button>

              {/* Dice Roller */}
              <button type="button" onClick={() => go("dice", "Dice Roller")}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${tab === "Dice Roller" && role === "dice" && !showFavorites ? "bg-neutral-800 text-white font-semibold" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60"}`}>
                <Dices size={14} style={{ opacity: tab === "Dice Roller" && role === "dice" && !showFavorites ? 1 : 0.6 }}/> Dice Roller
              </button>

              <div className="border-t border-neutral-800/50 my-2"/>

              {/* Configurable Categories */}
              {navConfig.filter(s => !s.hidden).map(s => {
                const visibleTabs = s.tabs.filter(t => !t.hidden);
                if (visibleTabs.length === 0) return null;
                return (
                  <div key={s.id} className="mb-1">
                    <button type="button" onClick={() => setExp(p => ({ ...p, [s.id]:!p[s.id] }))}
                      className="w-full flex items-center justify-between px-3 py-2.5 font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-300 transition-colors"
                      style={{ fontSize:11 }}>
                      {s.label} {exp[s.id] !== false ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </button>
                    {exp[s.id] !== false && (
                      <div className="pl-3 space-y-1 mb-2 animate-fade-in">
                        {visibleTabs.map(t => (
                          <button key={t.id} type="button" onClick={() => go(s.role, t.id, false, s.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-lg transition-colors ${tab === t.id && role === s.role && activeCatId === s.id && !showFavorites ? "bg-neutral-800 text-white font-semibold shadow-sm" : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"}`}>
                            <span style={{ opacity: tab === t.id && role === s.role && activeCatId === s.id && !showFavorites ? 1 : 0.6 }}>
                              {ICON_MAP[t.icon] || <BookOpen size={12}/>}
                            </span>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="space-y-3 animate-fade-in pb-4">
              <p className="text-[10px] uppercase font-bold text-neutral-500 px-2 tracking-widest mb-2">Drag to reorder. Toggle to hide.</p>
              {navConfig.map((cat, cIdx) => (
                <div key={cat.id} draggable
                  onDragStart={(e) => handleDragStart(e, 'category', cIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, cIdx)}
                  className={`border border-neutral-800 rounded-lg p-2 transition-opacity duration-300 ${cat.hidden ? 'opacity-40' : 'opacity-100'}`} style={{ background:"var(--bg3)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-neutral-500 cursor-grab active:cursor-grabbing" />
                      <span className="font-bold text-[11px] uppercase tracking-widest text-neutral-300">{cat.label}</span>
                    </div>
                    <button onClick={() => toggleCatVisibility(cIdx)} className="p-1 rounded hover:bg-neutral-800 transition-colors">
                      {cat.hidden ? <PlusCircle size={14} className="text-neutral-500 hover:text-green-400"/> : <MinusCircle size={14} className="text-neutral-500 hover:text-red-400"/>}
                    </button>
                  </div>
                  <div className="space-y-1 pl-4 border-l border-neutral-800/50 ml-1">
                    {cat.tabs.map((t, tIdx) => (
                      <div key={t.id} draggable
                        onDragStart={(e) => handleDragStart(e, 'tab', cIdx, tIdx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, cIdx, tIdx)}
                        className={`flex items-center justify-between p-1.5 rounded border border-neutral-800/50 transition-opacity duration-300 ${t.hidden || cat.hidden ? 'opacity-40' : 'opacity-100'}`} style={{ background:"var(--bg1)" }}>
                        <div className="flex items-center gap-2">
                          <GripVertical size={12} className="text-neutral-600 cursor-grab active:cursor-grabbing" />
                          <span className="text-xs text-neutral-400">{t.label}</span>
                        </div>
                        <button onClick={() => toggleTabVisibility(cIdx, tIdx)} disabled={cat.hidden} className="p-1 rounded hover:bg-neutral-800 transition-colors disabled:cursor-not-allowed">
                          {t.hidden ? <PlusCircle size={12} className="text-neutral-600 hover:text-green-500"/> : <MinusCircle size={12} className="text-neutral-600 hover:text-red-500"/>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-neutral-800 p-3 space-y-2" style={{ background:"var(--bg-sidebar-hdr)" }}>
          {/* ========================================== */}
          {/* --- READER BUTTON ADDED HERE --- */}
          {/* ========================================== */}
          <button type="button" onClick={() => setShowReader(true)}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-800/60 transition-colors">
            <BookOpen size={14}/> Read Blades &lsquo;68
          </button>
          <button type="button" onClick={() => setShowBitDReader(true)}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg text-neutral-400 border border-red-900/40 hover:text-white hover:bg-red-900/20 transition-colors">
            <BookOpen size={14}/> Read Blades in the Dark
          </button>

          <button onClick={() => setIsNavEditing(!isNavEditing)}
            className={`w-full flex items-center justify-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${isNavEditing ? "bg-blue-600/20 text-blue-400 border border-blue-900" : "text-neutral-500 border border-neutral-800 hover:text-neutral-300 hover:bg-neutral-800/60"}`}>
            {isNavEditing ? <CheckIcon size={14}/> : <Layout size={14}/>}
            {isNavEditing ? "Apply Layout" : "Customize Nav"}
          </button>
          {!isNavEditing && (
            <button type="button" onClick={() => { setSettings(true); setSidebar(false); }}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-xs rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60 transition-colors">
              <Settings size={14}/> Settings
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-screen relative">
        <header className="shrink-0 flex items-center gap-3 px-5 border-b border-neutral-800 shadow-sm z-10"
          style={{ height:60, background:"var(--bg-app-hdr)" }}>
          <button type="button" onClick={() => setSidebar(true)} aria-label="Open menu"
            className="text-neutral-400 hover:text-white p-1.5 rounded-md hover:bg-neutral-800 transition-colors">
            <Menu size={20}/>
          </button>
          <span className="font-black uppercase tracking-widest text-neutral-200 truncate flex-1" style={{ fontSize:13 }}>{hdr}</span>
          <button onClick={handleLogout} className="text-xs font-bold text-neutral-500 hover:text-red-500 transition-colors shrink-0">
            Logout
          </button>
        </header>

        {/* Search bar — hidden on Characters and Crews screens */}
        {!hideSearchBar && (
          <div className="shrink-0 px-5 pt-4 pb-3 space-y-3 shadow-sm z-10 relative" style={{ background:"var(--bg-app-search)" }}>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-3 text-neutral-500"/>
              <input placeholder="Search rules, tags, factions..." value={q} onChange={e => setQ(e.target.value)}
                className="w-full border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-200 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 outline-none transition-all shadow-sm"
                style={{ background:"var(--bg2)", color:"var(--text)" }}/>
              {qTrim && (
                <button type="button" onClick={() => setQ("")} aria-label="Clear search"
                  className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300 transition-colors">
                  <X size={14}/>
                </button>
              )}
            </div>
            {!qTrim && !showFavorites && section && section.tabs && section.tabs.filter(t => !t.hidden).length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scroll" style={{ maskImage:"linear-gradient(to right, black 90%, transparent 100%)" }}>
                {section.tabs.filter(t => !t.hidden).map(t => {
                  const isActive = tab === t.id;
                  return (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide relative overflow-hidden"
                      style={{
                        fontSize:    10,
                        background:  isActive ? "var(--bg3)" : "var(--bg2)",
                        border:      isActive ? "1px solid var(--border)" : "1px solid var(--border-alt)",
                        color:       isActive ? "var(--text-bright)" : "var(--text-muted)",
                        boxShadow:   isActive ? "inset 0 1px 0 rgba(255,255,255,0.07)" : "none",
                        transition:  "background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--text)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      {isActive && (
                        <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t" style={{ background:"var(--text-bright)", animation:"pillSlide 0.2s ease-out forwards", transformOrigin:"left" }} />
                      )}
                      {ICON_MAP[t.icon] || <BookOpen size={10}/>} {t.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2 hide-scroll" style={{ position: 'relative', zIndex: 1 }}>

          {/* Characters */}
          {!qTrim && !showFavorites && tab === "Characters" && role === "roster" && (
            <ErrorBoundary label="Character Manager">
              <CharacterManager
                characters={characters}
                setCharacters={setCharacters}
                setModal={setModal}
                userId={pb.authStore.record?.id || pb.authStore.model?.id}
                pbInstance={pb}
              />
            </ErrorBoundary>
          )}

          {/* Crews */}
          {!qTrim && !showFavorites && tab === "Crews" && role === "crews" && (
            <ErrorBoundary label="Crew Manager">
              <CrewManager
                characters={characters}
                setCharacters={setCharacters}
                pbInstance={pb}
                userId={pb.authStore.record?.id || pb.authStore.model?.id}
              />
            </ErrorBoundary>
          )}

          {/* Clocks */}
          {!qTrim && !showFavorites && tab === "Clocks" && role === "storyteller" && (
            <ErrorBoundary label="Clocks">
              <ClocksView clocks={clocks} setClocks={setClocks} />
            </ErrorBoundary>
          )}

          {/* Generators */}
          {!qTrim && !showFavorites && tab === "Generators ✨" && role === "storyteller" && (
            <ErrorBoundary label="Generators">
              <GeneratorsView />
            </ErrorBoundary>
          )}

          {/* Dice Roller */}
          {!qTrim && !showFavorites && tab === "Dice Roller" && role === "dice" && (
            <ErrorBoundary label="Dice Roller">
              <DiceRoller />
            </ErrorBoundary>
          )}

          {/* Favorites */}
          {!qTrim && showFavorites && (
            favorites.length > 0 ? (
              <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))" }}>
                {DB.filter(r => favorites.includes(r.id)).map((r, idx) => (
                  <RuleTile key={r.id} index={idx} rule={r} onClick={setModal} isFavorite={true} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-600 animate-fade-in">
                <Star size={32} className="mb-3 opacity-20" />
                <p className="text-center italic text-sm">No favorites yet.</p>
                <p className="text-center text-xs mt-1">Click the star icon on any rule or item to add it here.</p>
              </div>
            )
          )}

          {/* Compendium rules / search results */}
          {(qTrim || (!showFavorites
            && !(tab === "Characters" && role === "roster")
            && !(tab === "Crews"      && role === "crews")
            && !(tab === "Clocks"     && role === "storyteller")
            && !(tab === "Generators ✨" && role === "storyteller")
            && !(tab === "Dice Roller"   && role === "dice")
          )) && (
            rules.length > 0 ? (
              <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))" }}>
                {rules.map((r, idx) => (
                  <RuleTile key={r.id} index={idx} rule={r} onClick={setModal} isFavorite={favorites.includes(r.id)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-600 animate-fade-in">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="text-center italic" style={{ fontSize:14 }}>
                  {qTrim ? `No results found for "${qTrim}"` : "No entries here yet."}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {modal && <RuleModal rule={modal} onClose={() => setModal(null)} isFavorite={favorites.includes(modal.id)} toggleFavorite={toggleFavorite} />}
      {settingsOpen && <SettingsModal visible={vis} setVisible={setVis} onClose={() => setSettings(false)} lightMode={lightMode} setLightMode={setLightMode}/>}
    </div>
  );
}