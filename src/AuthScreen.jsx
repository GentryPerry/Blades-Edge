import React, { useState, useMemo } from 'react';
import { User, Key, ArrowRight, Dices, ChevronRight, Check } from 'lucide-react';


const STYLES = `
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
  
  @keyframes floatUpRight {
    0% { transform: translate(0, 0) rotate(-90deg); opacity: 0; }
    10% { opacity: 0.15; }
    90% { opacity: 0.15; }
    100% { transform: translate(110vw, -110vh) rotate(-90deg); opacity: 0; }
  }

  .dagger-particle {
    position: absolute;
    background-image: url('blades-icon.png');
    background-size: contain;
    background-repeat: no-repeat;
    pointer-events: none;
    filter: invert(1) brightness(0.6) blur(1.2px);
    opacity: 0.12;
  }
`;

const DaggerParticles = ({ count = 100 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      startX: Math.random() * 120 - 20, 
      startY: Math.random() * 40 - 20, 
      size: 10 + Math.random() * 25,
      duration: 20 + Math.random() * 20,
      delay: Math.random() * -40,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="dagger-particle"
          style={{
            width: p.size + 'px',
            height: p.size + 'px',
            left: p.startX + 'vw',
            bottom: p.startY + 'vh',
            animation: 'floatUpRight ' + p.duration + 's linear ' + p.delay + 's infinite',
          }}
        />
      ))}
    </div>
  );
};

const AuthScreen = ({ onLogin, pb }) => {
  const [mode, setMode]                   = useState("login"); // 'login' | 'register'
  const [emailInput, setEmailInput]       = useState("");
  const [password, setPassword]           = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setPassword("");
    setPasswordConfirm("");
  };

  const handleAuth = async () => {
    setError("");

    if (mode === 'register' && password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const authData = await pb.collection('users').authWithPassword(emailInput, password);
        onLogin(authData.token, pb.authStore.model);

      } else {
        await pb.collection('users').create({
          email: emailInput,
          password: password,
          passwordConfirm: passwordConfirm,
          emailVisibility: true,
        });
        const authData = await pb.collection('users').authWithPassword(emailInput, password);
        onLogin(authData.token, pb.authStore.model);
      }
    } catch (err) {
      console.error('PB Auth Error:', err);
      const serverData = err.response?.data;
      if (serverData && typeof serverData === 'object') {
        const fieldErrors = Object.entries(serverData)
          .map(([field, details]) => `${field}: ${details.message || JSON.stringify(details)}`)
          .join(" | ");
        setError(fieldErrors || err.message);
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';
  const canSubmit  = !loading && !!emailInput && !!password && (!isRegister || !!passwordConfirm);

  return (
    <div className="min-h-screen bg-[var(--bg0)] text-white flex items-center justify-center p-4 font-sans relative">
      <style>{STYLES}</style>

      <DaggerParticles count={25} />

      <div
        className="w-full max-w-lg bg-[var(--bg2)]/90 p-10 rounded-2xl border border-neutral-800 shadow-2xl relative z-10 animate-fade-in"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 shadow-inner">
            <Dices size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-neutral-100 mt-3">Unified Blades Compendium</h1>
          <p className="text-neutral-500 text-sm">{isRegister ? "Create an account" : "Sign in to continue"}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-[var(--bg0)] rounded-xl p-1 border border-neutral-800 mb-8">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${!isRegister ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            Login
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 ${isRegister ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/30 text-red-400 p-4 rounded-lg text-sm border border-red-900/30 flex items-center gap-3">
            <Key size={16} className="shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 pl-1">Email Address</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                type="email"
                className="w-full bg-[var(--bg0)] border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-red-800 transition-colors shadow-inner"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 pl-1">Password</label>
            <div className="relative">
              <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                onKeyDown={e => e.key === 'Enter' && !isRegister && canSubmit && handleAuth()}
                className="w-full bg-[var(--bg0)] border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-red-800 transition-colors shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm password — only shown for registration */}
          {isRegister && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 pl-1">Confirm Password</label>
              <div className="relative">
                <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  type="password"
                  onKeyDown={e => e.key === 'Enter' && canSubmit && handleAuth()}
                  className={`w-full bg-[var(--bg0)] border rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-red-800 transition-colors shadow-inner ${passwordConfirm && passwordConfirm !== password ? 'border-red-800/60' : 'border-neutral-800'}`}
                  placeholder="••••••••"
                />
                {passwordConfirm && passwordConfirm !== password && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs">no match</span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleAuth}
            className="flex items-center justify-center gap-3 w-full bg-red-900 hover:bg-red-800 transition-colors text-white font-black uppercase tracking-wider text-xs p-4 rounded-lg shadow-md disabled:opacity-50 mt-4"
            disabled={!canSubmit}
          >
            {loading ? "..." : isRegister ? "Create Account" : "Login"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;