/**
 * auth/AuthScreen.jsx — Login / register screen.
 *
 * Ports the existing AuthScreen.jsx UI.
 * Replaces direct pb.collection().authWithPassword calls
 * with the useAuth hook (which calls api/client.js internally).
 */

import React, { useState } from 'react';
import { User, Key, ArrowRight, Dices } from 'lucide-react';

const STYLES = `
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .auth-fade-in { animation: fade-in 0.5s ease-out forwards; }
`;

export default function AuthScreen({ onLogin, onRegister }) {
  const [mode, setMode]                   = useState('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const isRegister = mode === 'register';
  const canSubmit  = !loading && !!email && !!password && (!isRegister || !!passwordConfirm);

  const switchMode = (next) => { setMode(next); setError(''); setPassword(''); setPasswordConfirm(''); };

  const handleSubmit = async () => {
    setError('');
    if (isRegister && password !== passwordConfirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      if (isRegister) await onRegister(email, password, passwordConfirm);
      else            await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg0)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'var(--font-sans)' }}>
      <style>{STYLES}</style>

      <div className="auth-fade-in" style={{ width: '100%', maxWidth: 440, background: 'var(--bg-card)', padding: '40px 40px 36px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-grid', placeItems: 'center', width: 52, height: 52, borderRadius: 8, background: 'var(--bg-card-hi)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
            <Dices size={26} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.28em', color: 'var(--accent)', marginBottom: 6 }}>BLADES · EDGE</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.01em' }}>
            {isRegister ? 'Create an account' : 'Welcome back'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {isRegister ? 'Join the crew' : 'Sign in to continue'}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'var(--bg0)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: 3, marginBottom: 28 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', borderRadius: 3,
              background: mode === m ? 'var(--bg-card-hi)' : 'transparent',
              color: mode === m ? 'var(--paper)' : 'var(--muted)',
              fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}>{m === 'login' ? 'Login' : 'Register'}</button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 20, background: 'rgba(127,29,29,0.25)', color: '#fca5a5', padding: '12px 16px', borderRadius: 3, fontSize: 13, border: '1px solid rgba(127,29,29,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Key size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Email Address', value: email, set: setEmail, type: 'email', icon: User, placeholder: 'email@example.com' },
            { label: 'Password', value: password, set: setPassword, type: 'password', icon: Key, placeholder: '••••••••', onEnter: !isRegister },
            isRegister && { label: 'Confirm Password', value: passwordConfirm, set: setPasswordConfirm, type: 'password', icon: Key, placeholder: '••••••••', onEnter: true },
          ].filter(Boolean).map((field) => (
            <div key={field.label}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 7 }}>{field.label.toUpperCase()}</div>
              <div style={{ position: 'relative' }}>
                <field.icon size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', pointerEvents: 'none' }} />
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && field.onEnter && canSubmit && handleSubmit()}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', background: 'var(--bg0)', border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 3, paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                    color: 'var(--paper)', fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                    borderColor: field.label === 'Confirm Password' && passwordConfirm && passwordConfirm !== password
                      ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.09)',
                  }}
                />
              </div>
            </div>
          ))}

          <button onClick={handleSubmit} disabled={!canSubmit} style={{
            width: '100%', marginTop: 8, padding: '13px 0', borderRadius: 3,
            background: canSubmit ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
            color: canSubmit ? '#fff' : 'var(--dim)',
            border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: canSubmit ? `0 12px 28px -8px var(--accent)` : 'none',
            transition: 'all 0.2s',
          }}>
            {loading ? '…' : isRegister ? 'Create Account' : 'Sign In'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
