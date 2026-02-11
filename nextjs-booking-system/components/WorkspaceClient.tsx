'use client';

import { useEffect, useMemo, useState } from 'react';

type Role = 'ADMIN' | 'CUSTOMER';

type SessionUser = { id: string; name: string; email: string; role: Role };
type Resource = { id: string; name: string; type: string; location: string; capacity: number; status: string; images: { imageUrl: string }[] };
type Booking = { id: string; title: string; startAt: string; endAt: string; status: string; resource: { id: string; name: string }; customer: { id: string; name: string } };

type Tab = 'dashboard' | 'resources' | 'bookings' | 'calendar' | 'admin' | 'notifications';

export default function WorkspaceClient() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activityMessage, setActivityMessage] = useState('');

  const sessionToken = useMemo(() => typeof window !== 'undefined' ? localStorage.getItem('session-token') : null, []);
  const authHeaders = useMemo(() => ({ 'x-session-token': sessionToken ?? '', 'Content-Type': 'application/json' }), [sessionToken]);

  async function call(path: string, init?: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: { ...(init?.headers ?? {}), ...authHeaders }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? JSON.stringify(data));
    return data;
  }

  async function load() {
    try {
      const [me, resourceData, bookingData, mine, noteData] = await Promise.all([
        call('/api/auth/me'),
        call('/api/resources'),
        call('/api/bookings'),
        call('/api/bookings/my'),
        call('/api/notifications')
      ]);
      setUser(me);
      setResources(resourceData);
      setBookings(bookingData);
      setMyBookings(mine);
      setNotifications(noteData);

      if (me.role === 'ADMIN') {
        const adminAnalytics = await call('/api/admin/analytics');
        setAnalytics(adminAnalytics);
      }
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createResource(formData: FormData) {
    try {
      const payload = {
        name: String(formData.get('name')),
        type: String(formData.get('type')),
        location: String(formData.get('location')),
        capacity: Number(formData.get('capacity')),
        description: String(formData.get('description')),
        status: String(formData.get('status'))
      };
      await call('/api/resources', { method: 'POST', body: JSON.stringify(payload) });

      const imageUrl = String(formData.get('imageUrl'));
      const latestResources = await call('/api/resources');
      const created = latestResources[0];
      if (imageUrl) {
        await call(`/api/resources/${created.id}/images`, { method: 'POST', body: JSON.stringify({ imageUrl }) });
      }

      setActivityMessage('Resource created successfully.');
      load();
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  async function createBooking(formData: FormData) {
    try {
      const recurringEnabled = formData.get('recurringEnabled') === 'on';
      const payload: any = {
        resourceId: String(formData.get('resourceId')),
        title: String(formData.get('title')),
        notes: String(formData.get('notes')),
        startAt: new Date(String(formData.get('startAt'))).toISOString(),
        endAt: new Date(String(formData.get('endAt'))).toISOString()
      };
      if (recurringEnabled) {
        payload.recurring = {
          occurrences: Number(formData.get('occurrences')),
          frequencyDays: Number(formData.get('frequencyDays'))
        };
      }
      const response = await call('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
      setActivityMessage(`Created ${response.createdCount} booking(s). Waiting list: ${response.waitingListedCount}.`);
      load();
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  async function updateStatus(bookingId: string, status: string) {
    try {
      await call(`/api/bookings/${bookingId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setActivityMessage('Booking status updated.');
      load();
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  async function cancelBooking(bookingId: string) {
    try {
      await call(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Cancelled by user' }) });
      setActivityMessage('Booking cancelled.');
      load();
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  async function checkout(formData: FormData) {
    try {
      await call('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: String(formData.get('bookingId')),
          amount: Number(formData.get('amount')),
          currency: String(formData.get('currency'))
        })
      });
      setActivityMessage('Payment processed (simulated).');
      load();
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  async function addReview(formData: FormData) {
    try {
      await call('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          resourceId: String(formData.get('resourceId')),
          rating: Number(formData.get('rating')),
          comment: String(formData.get('comment'))
        })
      });
      setActivityMessage('Review submitted.');
      load();
    } catch (error) {
      setActivityMessage((error as Error).message);
    }
  }

  if (!sessionToken) {
    return <p className="empty-state">Missing session token. Please login from Home.</p>;
  }

  return (
    <div className="workspace-grid">
      <aside className="sidebar card">
        <h3>Workspace</h3>
        <p>{user?.name ?? 'Loading...'} ({user?.role ?? '...'})</p>
        {(['dashboard', 'resources', 'bookings', 'calendar', 'admin', 'notifications'] as Tab[])
          .filter((item) => (item !== 'admin' ? true : user?.role === 'ADMIN'))
          .map((item) => (
            <button key={item} className={`tab-btn ${tab === item ? 'active' : ''}`} onClick={() => setTab(item)}>
              {item}
            </button>
          ))}
      </aside>

      <section className="content">
        {activityMessage && <div className="toast">{activityMessage}</div>}

        {tab === 'dashboard' && (
          <div className="card stack">
            <h2>Dashboard</h2>
            <div className="metrics">
              <div><span>Available resources</span><strong>{resources.length}</strong></div>
              <div><span>Upcoming bookings</span><strong>{myBookings?.upcoming?.length ?? 0}</strong></div>
              <div><span>Past bookings</span><strong>{myBookings?.past?.length ?? 0}</strong></div>
            </div>

            <h3>Upcoming bookings</h3>
            <ul>
              {(myBookings?.upcoming ?? []).slice(0, 5).map((entry: any) => (
                <li key={entry.id}>{entry.title} • {entry.resource?.name} • {new Date(entry.startAt).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'resources' && (
          <div className="stack">
            <div className="card">
              <h2>Browse resources</h2>
              <div className="resource-grid">
                {resources.map((resource) => (
                  <article className="resource-card" key={resource.id}>
                    <img src={resource.images?.[0]?.imageUrl ?? 'https://placehold.co/600x300?text=Resource'} alt={resource.name} />
                    <h4>{resource.name}</h4>
                    <p>{resource.type} • {resource.location}</p>
                    <small>Capacity {resource.capacity} • {resource.status}</small>
                  </article>
                ))}
              </div>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="card">
                <h3>Add resource (with image URL)</h3>
                <form onSubmit={(event) => { event.preventDefault(); createResource(new FormData(event.currentTarget)); }} className="form-grid">
                  <input name="name" placeholder="Name" required />
                  <select name="type" defaultValue="MEETING_ROOM">
                    <option value="MEETING_ROOM">Meeting room</option>
                    <option value="VEHICLE">Vehicle</option>
                  </select>
                  <input name="location" placeholder="Location" required />
                  <input name="capacity" type="number" min={1} required />
                  <input name="description" placeholder="Description" />
                  <input name="imageUrl" placeholder="Image URL" required />
                  <select name="status" defaultValue="ACTIVE">
                    <option value="ACTIVE">Active</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <button className="btn primary">Create resource</button>
                </form>
              </div>
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="stack">
            <div className="card">
              <h2>Create booking</h2>
              <form onSubmit={(event) => { event.preventDefault(); createBooking(new FormData(event.currentTarget)); }} className="form-grid">
                <select name="resourceId" required>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>{resource.name}</option>
                  ))}
                </select>
                <input name="title" placeholder="Booking title" required />
                <textarea name="notes" placeholder="Notes" />
                <label>Start<input type="datetime-local" name="startAt" required /></label>
                <label>End<input type="datetime-local" name="endAt" required /></label>
                <label className="checkbox"><input type="checkbox" name="recurringEnabled" /> Recurring</label>
                <input type="number" name="occurrences" defaultValue={4} min={1} max={12} placeholder="Occurrences" />
                <input type="number" name="frequencyDays" defaultValue={7} min={1} max={30} placeholder="Every X days" />
                <button className="btn primary">Confirm booking</button>
              </form>
            </div>

            <div className="card">
              <h3>Bookings</h3>
              <table>
                <thead><tr><th>Title</th><th>Resource</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.title}</td>
                      <td>{booking.resource?.name}</td>
                      <td>{new Date(booking.startAt).toLocaleString()} → {new Date(booking.endAt).toLocaleString()}</td>
                      <td>{booking.status}</td>
                      <td className="actions">
                        {user?.role === 'ADMIN' && (
                          <>
                            <button className="btn tiny" onClick={() => updateStatus(booking.id, 'APPROVED')}>Approve</button>
                            <button className="btn tiny danger" onClick={() => updateStatus(booking.id, 'REJECTED')}>Reject</button>
                          </>
                        )}
                        <button className="btn tiny" onClick={() => cancelBooking(booking.id)}>Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>Payment integration (simulated)</h3>
              <form onSubmit={(event) => { event.preventDefault(); checkout(new FormData(event.currentTarget)); }} className="form-grid">
                <select name="bookingId" required>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>{booking.title}</option>
                  ))}
                </select>
                <input name="amount" type="number" step="0.01" placeholder="Amount" required />
                <input name="currency" defaultValue="USD" maxLength={3} required />
                <button className="btn primary">Pay now</button>
              </form>
            </div>

            <div className="card">
              <h3>Resource ratings / reviews</h3>
              <form onSubmit={(event) => { event.preventDefault(); addReview(new FormData(event.currentTarget)); }} className="form-grid">
                <select name="resourceId" required>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>{resource.name}</option>
                  ))}
                </select>
                <input name="rating" type="number" min={1} max={5} required />
                <textarea name="comment" placeholder="Review" />
                <button className="btn primary">Submit review</button>
              </form>
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <CalendarView resources={resources} bookings={bookings} sessionToken={sessionToken} />
        )}

        {tab === 'admin' && user?.role === 'ADMIN' && (
          <div className="card stack">
            <h2>Admin panel</h2>
            <div className="metrics">
              <div><span>Total resources</span><strong>{analytics?.totals?.totalResources ?? 0}</strong></div>
              <div><span>Total bookings</span><strong>{analytics?.totals?.totalBookings ?? 0}</strong></div>
              <div><span>Pending approvals</span><strong>{analytics?.totals?.pendingBookings ?? 0}</strong></div>
              <div><span>Waiting list</span><strong>{analytics?.totals?.waitingListCount ?? 0}</strong></div>
            </div>
            <h3>Recent activity</h3>
            <ul>
              {(analytics?.recentActivity ?? []).map((entry: any) => (
                <li key={entry.id}>{entry.action} • {entry.entity} • {new Date(entry.createdAt).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="card stack">
            <h2>Email notifications log</h2>
            <ul>
              {notifications.map((entry) => (
                <li key={entry.id}><strong>{entry.subject}</strong> — {entry.message}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function CalendarView({ resources, bookings, sessionToken }: { resources: Resource[]; bookings: Booking[]; sessionToken: string }) {
  const [selectedResource, setSelectedResource] = useState(resources[0]?.id ?? '');
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [availability, setAvailability] = useState<any[]>([]);

  useEffect(() => {
    if (resources.length > 0 && !selectedResource) {
      setSelectedResource(resources[0].id);
    }
  }, [resources, selectedResource]);

  useEffect(() => {
    if (!selectedResource) return;

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + (mode === 'week' ? 7 : 30));

    fetch(`/api/calendar/availability?resourceId=${selectedResource}&from=${now.toISOString()}&to=${end.toISOString()}`, {
      headers: { 'x-session-token': sessionToken }
    })
      .then((response) => response.json())
      .then((data) => setAvailability(data.blocks ?? []));
  }, [selectedResource, mode, sessionToken]);

  return (
    <div className="card stack">
      <h2>Calendar view</h2>
      <div className="form-inline">
        <select value={selectedResource} onChange={(event) => setSelectedResource(event.target.value)}>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.name}</option>
          ))}
        </select>
        <select value={mode} onChange={(event) => setMode(event.target.value as 'week' | 'month')}>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>

      <div className="calendar-grid">
        {[...Array(mode === 'week' ? 7 : 30)].map((_, index) => {
          const day = new Date();
          day.setDate(day.getDate() + index);
          const dayItems = availability.filter((item) => new Date(item.startAt).toDateString() === day.toDateString());
          return (
            <div key={day.toISOString()} className="calendar-cell">
              <strong>{day.toLocaleDateString()}</strong>
              {dayItems.length === 0 ? <p>Available</p> : dayItems.map((item) => (
                <p key={item.id} className="busy">Busy: {new Date(item.startAt).toLocaleTimeString()} - {new Date(item.endAt).toLocaleTimeString()}</p>
              ))}
            </div>
          );
        })}
      </div>

      <small>
        Click any day in booking tab to create a booking. This grid gives visual availability for week/month windows.
      </small>

      <h3>Quick list view</h3>
      <ul>
        {bookings.slice(0, 10).map((booking) => (
          <li key={booking.id}>{booking.title} • {booking.resource.name} • {new Date(booking.startAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
