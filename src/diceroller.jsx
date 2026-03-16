import React, { useState } from "react";

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
    const defaults = { pip: '#6b7280', border: '#27272a', bg: '#111113', shadow: 'none' };
    if (spinning || !isBest) return defaults;
    
    if (value === 6) {
      return { pip: '#22c55e', border: '#14532d', bg: '#0a1a0a', shadow: '0 0 15px rgba(34,197,94,0.2)' };
    } else if (value >= 4) {
      return { pip: '#f97316', border: '#9a3412', bg: '#1c0c03', shadow: '0 0 15px rgba(249,115,22,0.15)' };
    }
    return defaults;
  };

  const outcome = getOutcomeStyles();

  return (
    <div style={{
      width: size, height: size,
      background: outcome.bg,
      border: `1px solid ${spinning ? (isBargain ? '#ef4444' : '#27272a') : outcome.border}`,
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

const DiceRoller = () => {
  const [poolSize, setPoolSize] = useState(2);
  const [devilsBargain, setDevilsBargain] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [results, setResults] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [bestIdx, setBestIdx] = useState(-1);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setOutcome(null);
    setResults([]);
    setBestIdx(-1);

    const isZeroPool = poolSize === 0 && !devilsBargain;
    const actualDiceCount = isZeroPool ? 2 : (poolSize + (devilsBargain ? 1 : 0));

    setTimeout(() => {
      const rolled = Array.from({ length: actualDiceCount }, () => Math.floor(Math.random() * 6) + 1);
      setResults(rolled);
      
      let finalValue;
      let targetIdx;

      if (isZeroPool) {
        finalValue = Math.min(...rolled);
        targetIdx = rolled.indexOf(finalValue);
      } else {
        finalValue = Math.max(...rolled);
        targetIdx = rolled.indexOf(finalValue);
      }
      
      setBestIdx(targetIdx);
      const sixes = rolled.filter(v => v === 6).length;
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
    <div className={`w-full flex flex-col items-center justify-center gap-6 sm:gap-8 py-6 sm:py-10 px-2 sm:px-4 transition-colors duration-500 rounded-3xl ${rolling && devilsBargain ? 'bg-[#1a0a0a]' : 'bg-[#09090b]'}`}>
      <style>{`
        @keyframes dieSpinReel { from { transform: translateY(0); } to { transform: translateY(-56px); } }
        @keyframes dieReveal { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        .shake-it { animation: shake 0.1s infinite; }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-neutral-600">Action Roll</p>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white">Dice Pool</h2>
      </div>

      {/* Pool Selector - Responsive Padding/Gap */}
      <div className="flex items-center gap-4 sm:gap-6 bg-[#111113] border border-neutral-800 rounded-2xl px-6 sm:px-10 py-4 sm:py-5">
        <button onClick={() => setPoolSize(p => Math.max(0, p - 1))} disabled={rolling} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#18181b] border border-neutral-700 text-white text-xl sm:text-2xl hover:bg-neutral-800 transition-colors">−</button>
        <div className="text-center w-16 sm:w-24">
          <span className="text-4xl sm:text-5xl font-black text-white">{poolSize}</span>
          <p className="text-[9px] sm:text-[10px] font-black uppercase text-neutral-500 mt-1">
            {poolSize === 0 && !devilsBargain ? "2d6 LOW" : "BASE DICE"}
          </p>
        </div>
        <button onClick={() => setPoolSize(p => Math.min(10, p + 1))} disabled={rolling} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#18181b] border border-neutral-700 text-white text-xl sm:text-2xl hover:bg-neutral-800 transition-colors">+</button>
      </div>

      {/* Devil's Bargain Toggle */}
      <button 
        onClick={() => setDevilsBargain(!devilsBargain)}
        disabled={rolling}
        className={`group flex items-center gap-3 px-5 sm:px-6 py-3 rounded-xl border transition-all duration-300 ${devilsBargain ? 'bg-red-950/20 border-red-900 text-red-500 shadow-[0_0_20px_rgba(153,27,27,0.2)]' : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 opacity-60'}`}
      >
        <div className={`w-4 h-4 rounded-full border-2 transition-all ${devilsBargain ? 'bg-red-600 border-red-400' : 'border-neutral-700'}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Devil's Bargain (+1d)</span>
      </button>

      {/* Dice Display - Responsive Wrap and Gap */}
      <div className={`flex gap-3 sm:gap-4 justify-center flex-wrap w-full max-w-xs sm:max-w-none min-h-[80px] ${rolling && devilsBargain ? 'shake-it' : ''}`}>
        {Array.from({ length: (poolSize === 0 && !devilsBargain) ? 2 : (poolSize + (devilsBargain ? 1 : 0)) }).map((_, i) => (
          <div key={i} style={{ animation: !rolling && results[i] ? `dieReveal 0.3s ease-out both` : 'none' }}>
            <DieFace
              value={results[i] || 1}
              spinning={rolling}
              isBest={i === bestIdx}
              isBargain={devilsBargain}
              size={window.innerWidth < 640 ? 50 : 60} // Shrinks dice slightly on mobile
            />
          </div>
        ))}
      </div>

      {/* Outcome Section */}
      <div className="text-center h-16 sm:h-20 flex flex-col justify-center">
        {outcome && !rolling && (
          <>
            <div className="text-3xl sm:text-4xl font-black tracking-tighter" style={{ color: outcome.color }}>{outcome.label}</div>
            <div className="text-neutral-500 text-xs sm:text-sm">{outcome.sub}</div>
          </>
        )}
      </div>

      {/* Roll Action - Responsive Sizing */}
      <button
        onClick={roll}
        disabled={rolling}
        className={`px-10 sm:px-12 py-3 sm:py-4 rounded-full font-black uppercase tracking-widest text-sm sm:text-base transition-all ${devilsBargain && !rolling ? 'hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]' : ''}`}
        style={{
          background: rolling ? '#27272a' : (devilsBargain ? '#ef4444' : '#fff'),
          color: rolling ? '#52525b' : '#000',
        }}
      >
        {rolling ? 'Calling Fate...' : 'Roll Dice'}
      </button>

      {/* Legend - Flex-Wrap for Mobile Stacking */}
      <div className="flex gap-4 sm:gap-6 text-center pt-4 flex-wrap justify-center max-w-[280px] sm:max-w-none">
        {[
          { label: "Failure",  color: "#6b7280", note: "1 – 3" },
          { label: "Partial",  color: "#f97316", note: "4 or 5" },
          { label: "Success",  color: "#22c55e", note: "one 6" },
          { label: "Critical", color: "#ef4444", note: "2× 6s" },
        ].map(({ label, color, note }) => (
          <div key={label} className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
            <span className="text-[9px] sm:text-[10px] text-neutral-600 font-medium">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;