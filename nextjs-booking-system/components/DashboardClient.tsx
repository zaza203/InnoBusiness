'use client';

import { useEffect, useMemo, useState } from 'react';

type User = { id: string; name: string; email: string; role: 'ADMIN' | 'CUSTOMER' };
type Resource = { id: string; name: string; type: string; location: string; capacity: number; status: string; ownerId: string };
type Booking = { id: string; title: string; status: string; startAt: string; endAt: string; resource: Resource; customer: User };

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState('');

  const headers = useMemo(() => user ? { 'x-user-id': user.id, 'Content-Type': 'application/json' } : undefined, [user]);

  async function loadData(activeUser: User) {
    const [rRes, bRes] = await Promise.all([
      fetch('/api/resources', { headers: { 'x-user-id': activeUser.id } }),
      fetch('/api/bookings', { headers: { 'x-user-id': activeUser.id } })
    ]);
    setResources(await rRes.json());
    setBookings(await bRes.json());
  }

  useEffect(() => {
    const stored = localStorage.getItem('gia-user');
    if (!stored) return;
    const parsed = JSON.parse(stored) as User;
    setUser(parsed);
    loadData(parsed);
  }, []);

  async function createBooking(formData: FormData) {
    if (!headers) return;
    const payload = {
      resourceId: formData.get('resourceId'),
      title: formData.get('title'),
      notes: formData.get('notes'),
      startAt: formData.get('startAt'),
      endAt: formData.get('endAt')
    };
    const res = await fetch('/api/bookings', { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await res.json();
    setMessage(res.ok ? 'Booking created.' : data.error || 'Failed');
    if (user) loadData(user);
  }

  async function createResource(formData: FormData) {
    if (!headers) return;
    const payload = {
      name: formData.get('name'), type: formData.get('type'), location: formData.get('location'),
      capacity: Number(formData.get('capacity')), status: formData.get('status')
    };
    const res = await fetch('/api/resources', { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await res.json();
    setMessage(res.ok ? 'Resource created.' : data.error || 'Failed');
    if (user) loadData(user);
  }

  async function setStatus(id: string, status: string) {
    if (!headers) return;
    const res = await fetch(`/api/bookings/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) });
    const data = await res.json();
    setMessage(res.ok ? 'Booking status updated.' : data.error || 'Failed');
    if (user) loadData(user);
  }

  if (!user) return <div className="card">Please sign in on home page.</div>;

  return (
    <div className="grid" style={{gap:'1.2rem'}}>
      <div className="card"><strong>{user.name}</strong> ({user.role})</div>
      {message && <div className="card">{message}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h3>Create Booking</h3>
          <form action={createBooking} className="grid">
            <select name="resourceId" required>{resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
            <input name="title" placeholder="Team sync" required />
            <textarea name="notes" placeholder="Notes" />
            <input type="datetime-local" name="startAt" required />
            <input type="datetime-local" name="endAt" required />
            <button className="btn btn-secondary">Submit Booking</button>
          </form>
        </div>

        {user.role === 'ADMIN' && (
          <div className="card">
            <h3>Create Resource</h3>
            <form action={createResource} className="grid">
              <input name="name" placeholder="Resource name" required />
              <input name="type" placeholder="MEETING_ROOM / VEHICLE" required />
              <input name="location" placeholder="Location" required />
              <input name="capacity" type="number" min="1" required />
              <select name="status" defaultValue="ACTIVE"><option>ACTIVE</option><option>MAINTENANCE</option><option>INACTIVE</option></select>
              <button className="btn btn-primary">Create Resource</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Bookings</h3>
        <table><thead><tr><th>Title</th><th>Resource</th><th>Window</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td><td>{b.resource?.name}</td><td>{new Date(b.startAt).toLocaleString()} → {new Date(b.endAt).toLocaleString()}</td><td>{b.status}</td>
              <td>{user.role === 'ADMIN' ? (
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-accent" onClick={() => setStatus(b.id, 'APPROVED')}>Approve</button>
                  <button className="btn" onClick={() => setStatus(b.id, 'REJECTED')}>Reject</button>
                </div>
              ) : '-'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
