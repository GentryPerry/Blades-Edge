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
  const [emailInput, setEmailInput] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (mode) => {
    setError("");
    setLoading(true);

    try {
      if (mode === 'login') {
        // Step 1: Attempt Login
        const authData = await pb.collection('users').authWithPassword(emailInput, password);
        onLogin(authData.token, pb.authStore.model);
        
      } else if (mode === 'register') {
        // Step 2: Attempt Registration
        // Note: We send 'email' because your DB doesn't have a 'username' field.
        await pb.collection('users').create({ 
            email: emailInput, 
            password: password, 
            passwordConfirm: password,
            emailVisibility: true // Good practice for social apps
        });
        
        // Step 3: Auto-login after successful registration
        const authData = await pb.collection('users').authWithPassword(emailInput, password);
        onLogin(authData.token, pb.authStore.model);
      }
    } catch (err) {
      console.error('PB Auth Error:', err);

      // --- DETAILED ERROR PARSING ---
      // PocketBase v0.23 returns errors in err.response.data
      const serverData = err.response?.data;
      
      if (serverData && typeof serverData === 'object') {
        // This converts {"password": {"message": "Too short"}} into "password: Too short"
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

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 font-sans relative">
      <style>{STYLES}</style>
      
      <DaggerParticles count={240} />

      <div 
        className="w-full max-w-lg bg-[#111113]/90 p-10 rounded-2xl border border-neutral-800 shadow-2xl relative z-10 animate-fade-in"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="flex flex-col items-center gap-2 text-center mb-10">
          <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 shadow-inner">
            <Dices size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-neutral-100 mt-3">Unified Blades Compendium</h1>
          <p className="text-neutral-500 text-sm">Authentication Required</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/30 text-red-400 p-4 rounded-lg text-sm border border-red-900/30 flex items-center gap-3">
             <Key size={16} className="shrink-0" /> 
             <span className="break-all">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 pl-1">Email Address</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input 
                value={emailInput} 
                onChange={e => setEmailInput(e.target.value)} 
                type="email" 
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-red-800 transition-colors shadow-inner" 
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
                className="w-full bg-[#09090b] border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-red-800 transition-colors shadow-inner" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            <button 
              onClick={() => handleAuth('login')} 
              className="flex items-center justify-center gap-3 w-full bg-red-900 hover:bg-red-800 transition-colors text-white font-black uppercase tracking-wider text-xs p-4 rounded-lg shadow-md disabled:opacity-50"
              disabled={loading || !emailInput || !password}
            >
              {loading ? "..." : "Login"} <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => handleAuth('register')} 
              className="flex items-center justify-center gap-3 w-full bg-neutral-800 hover:bg-neutral-700 transition-colors text-white font-black uppercase tracking-wider text-xs p-4 rounded-lg shadow-md disabled:opacity-50"
              disabled={loading || !emailInput || !password}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;