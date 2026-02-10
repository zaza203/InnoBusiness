'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LoginResponse = { id: string; name: string; role: 'ADMIN' | 'CUSTOMER'; email: string };

export default function LoginPanel() {
  const router = useRouter();
  const [email, setEmail] = useState('customer@gia.local');
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
    });
    if (!res.ok) {
      setError('User not found. Seed DB first.');
      return;
    }
    const user: LoginResponse = await res.json();
    localStorage.setItem('gia-user', JSON.stringify(user));
    router.push('/dashboard');
  }

  return (
    <div className="card" style={{maxWidth:480, margin:'2rem auto'}}>
      <h3>Sign in</h3>
      <p><small className="muted">Use seeded users: admin@gia.local or customer@gia.local</small></p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button className="btn btn-primary" style={{marginTop:12}} onClick={login}>Continue</button>
      {error && <p style={{color:'crimson'}}>{error}</p>}
    </div>
  );
}
