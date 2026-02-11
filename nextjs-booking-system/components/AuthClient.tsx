'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'register';

export default function AuthClient() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@gia.local');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [message, setMessage] = useState('');

  async function submit() {
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { name, email, password, role };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error?.formErrors?.join(', ') ?? data.error ?? 'Authentication failed.');
      return;
    }

    localStorage.setItem('session-token', data.token);
    localStorage.setItem('session-user', JSON.stringify(data.user));
    router.push('/workspace');
  }

  return (
    <section className="auth-wrap">
      <div className="hero-card">
        <p className="pill">Modern booking • Admin + Customer • Real-time rules</p>
        <h2>Unified booking for rooms & vehicles</h2>
        <p>
          Includes approvals, calendar availability, reminders, analytics, waiting list, reviews and simulated payments.
        </p>
      </div>

      <div className="auth-card">
        <div className="auth-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>

        {mode === 'register' && (
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
        )}

        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />

        {mode === 'register' && (
          <select value={role} onChange={(event) => setRole(event.target.value as 'CUSTOMER' | 'ADMIN')}>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}

        <button className="btn primary" onClick={submit}>Continue</button>
        {message && <p className="error-msg">{message}</p>}
        <small>Demo seeded accounts: admin@gia.local / customer@gia.local, password: Password123!</small>
      </div>
    </section>
  );
}
