import React, { useState, useRef } from "react";

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
};

// ── Die Face ─────────────────────────────────────────────────────────────────
const DieFace = ({ value, spinning, isBest, isBargain, isCrit, size = 56 }) => {
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];

  const getOutcomeStyles = () => {
    const defaults = {
      pip:    'var(--text-muted)',
      border: 'var(--border)',
      bg:     'var(--bg2)',
      shadow: 'none',
    };
    if (spinning || !isBest) return defaults;

    if (value === 6 && isCrit) {
      return {
        pip:    '#22c55e',
        border: '#166534',
        bg:     '#071510',
        shadow: '0 0 0 2px #14532d, 0 0 20px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.15)',
      };
    }
    if (value === 6) {
      return {
        pip:    '#22c55e',
        border: '#14532d',
        bg:     '#0a1a0a',
        shadow: '0 0 16px rgba(34,197,94,0.35)',
      };
    }
    if (value >= 4) {
      return {
        pip:    '#f97316',
        border: '#9a3412',
        bg:     '#1c0c03',
        shadow: '0 0 16px rgba(249,115,22,0.3)',
      };
    }
    return defaults;
  };

  const outcome = getOutcomeStyles();

  return (
    <div
      className="die-face"
      style={{
        width:        size,
        height:       size,
        background:   outcome.bg,
        border:       `1px solid ${spinning ? (isBargain ? '#7f1d1d' : 'var(--border)') : outcome.border}`,
        borderRadius: 12,
        overflow:     'hidden',
        position:     'relative',
        boxShadow:    outcome.shadow,
        flexShrink:   0,
      }}
    >
      {spinning ? (
        /* Reel spin while rolling */
        <div
          style={{
            position:      'absolute',
            top:           0,
            left:          0,
            width:         '100%',
            animation:     `dieSpinReel 0.07s linear infinite`,
            display:       'flex',
            flexDirection: 'column',
          }}
        >
          {[1, 5, 2, 6, 3, 4, 1].map((v, i) => (
            <div
              key={i}
              style={{
                width:           size,
                height:          size,
                flexShrink:      0,
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
              }}
            >
              <svg viewBox="0 0 100 100" width={size * 0.68} height={size * 0.68}>
                {PIP_LAYOUTS[v].map(([cx, cy], idx) => (
                  <circle key={idx} cx={cx} cy={cy} r={11} fill={isBargain ? '#450a0a' : '#2a2a2a'} />
                ))}
              </svg>
            </div>
          ))}
        </div>
      ) : (
        /* Static face after landing */
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {pips.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={11} fill={outcome.pip} />
          ))}
        </svg>
      )}
    </div>
  );
};

// ── Main Dice Roller ──────────────────────────────────────────────────────────
const DiceRoller = () => {
  const [poolSize,     setPoolSize]     = useState(2);
  const [devilsBargain, setDevilsBargain] = useState(false);
  const [rolling,      setRolling]      = useState(false);
  const [results,      setResults]      = useState([]);
  const [outcome,      setOutcome]      = useState(null);
  const [bestIndices,  setBestIndices]  = useState([]);
  const [isCrit,       setIsCrit]       = useState(false);
  const timerRef = useRef(null);

  const roll = () => {
    if (rolling) return;
    // Clear any pending timer from a previous roll
    if (timerRef.current) clearTimeout(timerRef.current);

    setRolling(true);
    setOutcome(null);
    setResults([]);
    setBestIndices([]);
    setIsCrit(false);

    const isZeroPool   = poolSize === 0 && !devilsBargain;
    const diceCount    = isZeroPool ? 2 : poolSize + (devilsBargain ? 1 : 0);

    timerRef.current = setTimeout(() => {
      const rolled = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setResults(rolled);

      const sixes = rolled.filter(v => v === 6).length;
      let finalValue, highlighted;

      if (isZeroPool) {
        finalValue  = Math.min(...rolled);
        highlighted = [rolled.indexOf(finalValue)];
      } else if (sixes >= 2) {
        finalValue  = 6;
        highlighted = rolled.reduce((acc, v, i) => { if (v === 6) acc.push(i); return acc; }, []);
      } else {
        finalValue  = Math.max(...rolled);
        highlighted = [rolled.indexOf(finalValue)];
      }

      setBestIndices(highlighted);
      setIsCrit(sixes >= 2 && !isZeroPool);

      let out;
      if      (sixes >= 2 && !isZeroPool) out = { label: "CRITICAL", sub: "Exceptional result!", color: "#ef4444" };
      else if (finalValue === 6)           out = { label: "SUCCESS",  sub: "Full effect.",                  color: "#22c55e" };
      else if (finalValue >= 4)            out = { label: "PARTIAL",  sub: "Success with a consequence.", color: "#f97316" };
      else                                  out = { label: "FAILURE",  sub: "Things go wrong.",             color: "#6b7280" };

      setOutcome(out);
      setRolling(false);
      if (devilsBargain) setDevilsBargain(false);
    }, 900);
  };

  const diceCount    = (poolSize === 0 && !devilsBargain) ? 2 : poolSize + (devilsBargain ? 1 : 0);
  const dieSize      = typeof window !== 'undefined' && window.innerWidth < 640 ? 52 : 62;
  const isBargainRed = devilsBargain && rolling;

  return (
    <div
      className={`w-full flex flex-col items-center justify-center gap-6 sm:gap-8 py-6 sm:py-10 px-2 sm:px-4 rounded-3xl transition-colors duration-700 relative overflow-hidden`}
      style={{ background: isBargainRed ? '#120808' : 'var(--bg0)' }}
    >
      {/* ── Inline keyframes (scoped to dice roller) ── */}
      <style>{`
        @keyframes dieSpinReel  { from { transform: translateY(0); } to { transform: translateY(-${dieSize}px); } }
        @keyframes tableShakeX  { 0%,100%{transform:translate(0,0)} 15%{transform:translate(-3px,2px)} 35%{transform:translate(3px,-2px)} 55%{transform:translate(-2px,3px)} 75%{transform:translate(2px,-1px)} 90%{transform:translate(-1px,1px)} }
        .table-shake { animation: tableShakeX 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
      `}</style>

      {/* ── Critical flash overlay ── */}
      {isCrit && outcome && (
        <div
          className="animate-crit-flash pointer-events-none absolute inset-0 rounded-3xl z-10"
          style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.18) 0%, transparent 65%)' }}
        />
      )}

      {/* ── Header ── */}
      <div className="text-center">
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-600">Action Roll</p>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest" style={{ color: 'var(--text-bright)' }}>
          Dice Pool
        </h2>
      </div>

      {/* ── Pool Selector ── */}
      <div className="flex items-center gap-4 sm:gap-6 border border-neutral-800 rounded-2xl px-6 sm:px-10 py-4 sm:py-5 shadow-inner"
        style={{ background: 'var(--bg2)' }}>
        <button
          onClick={() => setPoolSize(p => Math.max(0, p - 1))}
          disabled={rolling}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-neutral-700 text-white text-xl sm:text-2xl hover:bg-neutral-700 disabled:opacity-40 transition-all active:scale-90"
          style={{ background: 'var(--bg3)' }}
        >
          −
        </button>
        <div className="text-center w-16 sm:w-24">
          <span
            key={poolSize}
            className="text-4xl sm:text-5xl font-black block animate-spring-in"
            style={{ color: 'var(--text-bright)' }}
          >
            {poolSize}
          </span>
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-neutral-500 mt-1">
            {poolSize === 0 && !devilsBargain ? "2d6 LOW" : "BASE DICE"}
          </p>
        </div>
        <button
          onClick={() => setPoolSize(p => Math.min(10, p + 1))}
          disabled={rolling}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-neutral-700 text-white text-xl sm:text-2xl hover:bg-neutral-700 disabled:opacity-40 transition-all active:scale-90"
          style={{ background: 'var(--bg3)' }}
        >
          +
        </button>
      </div>

      {/* ── Devil's Bargain Toggle ── */}
      <button
        onClick={() => setDevilsBargain(d => !d)}
        disabled={rolling}
        className={`flex items-center gap-3 px-5 sm:px-6 py-3 rounded-xl border transition-all duration-300 disabled:opacity-50 ${
          devilsBargain
            ? 'border-red-900 text-red-400 shadow-[0_0_24px_rgba(153,27,27,0.25)]'
            : 'border-neutral-800 text-neutral-500 opacity-60 hover:opacity-100 hover:border-neutral-600'
        }`}
        style={{ background: devilsBargain ? 'rgba(127,29,29,0.12)' : 'rgba(0,0,0,0.3)' }}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
            devilsBargain ? 'bg-red-600 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'border-neutral-700'
          }`}
        />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Devil's Bargain (+1d)</span>
      </button>

      {/* ── Dice Display ── */}
      <div
        className={`flex gap-3 sm:gap-4 justify-center flex-wrap w-full max-w-xs sm:max-w-none min-h-[80px] items-center ${rolling ? 'table-shake' : ''}`}
      >
        {Array.from({ length: diceCount }).map((_, i) => (
          <div
            key={i}
            style={{
              // Staggered slam: each die lands 65ms after the previous
              animation: !rolling && results[i]
                ? `dieSlam 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 65}ms both`
                : 'none',
            }}
          >
            <DieFace
              value={results[i] || 1}
              spinning={rolling}
              isBest={bestIndices.includes(i)}
              isBargain={devilsBargain}
              isCrit={isCrit}
              size={dieSize}
            />
          </div>
        ))}
      </div>

      {/* ── Outcome Section ── */}
      <div className="text-center min-h-[5rem] flex flex-col justify-center items-center w-full px-4 relative">
        {outcome && !rolling && (
          <div className="flex flex-col items-center gap-1">
            {/* Ambient glow behind text */}
            <div
              className="animate-crit-flash absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(ellipse at center, ${outcome.color}22 0%, transparent 70%)`,
                animation: 'ambientGlow 2.5s ease-in-out infinite',
              }}
            />
            {/* Main outcome label */}
            <div
              className="animate-outcome text-3xl sm:text-4xl font-black tracking-tighter uppercase relative z-10"
              style={{
                color:      outcome.color,
                textShadow: `0 0 40px ${outcome.color}60, 0 0 80px ${outcome.color}20`,
              }}
            >
              {outcome.label}
            </div>
            {/* Sub text */}
            <div className="animate-sub-reveal text-neutral-500 text-xs sm:text-sm relative z-10">
              {outcome.sub}
            </div>
          </div>
        )}
      </div>

      {/* ── Roll Button ── */}
      <button
        onClick={roll}
        disabled={rolling}
        className={`roll-btn ${devilsBargain ? 'roll-btn-bargain' : ''} px-10 sm:px-14 py-3.5 sm:py-4 rounded-full font-black uppercase tracking-widest text-sm sm:text-base disabled:cursor-not-allowed`}
        style={{
          background: rolling
            ? 'var(--bg3)'
            : devilsBargain
              ? 'linear-gradient(135deg, #dc2626, #991b1b)'
              : 'linear-gradient(135deg, #ffffff, #e5e5e5)',
          color:      rolling ? 'var(--text-muted)' : '#000',
          boxShadow:  !rolling && !devilsBargain
            ? '0 4px 24px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.5)'
            : !rolling && devilsBargain
              ? '0 4px 24px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,100,100,0.3)'
              : 'none',
        }}
      >
        {rolling ? 'Calling Fate…' : 'Roll Dice'}
      </button>

      {/* ── Legend ── */}
      <div className="flex gap-4 sm:gap-8 text-center flex-wrap justify-center max-w-[300px] sm:max-w-none">
        {[
          { label: "Failure",  color: "#6b7280", note: "1 – 3" },
          { label: "Partial",  color: "#f97316", note: "4 or 5" },
          { label: "Success",  color: "#22c55e", note: "one 6" },
          { label: "Critical", color: "#ef4444", note: "2× 6s" },
        ].map(({ label, color, note }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 min-w-[55px]">
            <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}60` }} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
            <span className="text-[9px] sm:text-[10px] text-neutral-600 font-medium">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
