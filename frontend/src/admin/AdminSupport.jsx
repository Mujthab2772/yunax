import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { API } from '../lib/api';

const AdminSupport = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = (() => {
    try {
      return localStorage.getItem('admin_token');
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/support/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ([]));
        if (!res.ok) throw new Error(data.error || 'Failed to load support messages');
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load support messages');
      } finally {
        setLoading(false);
      }
    };

    if (token) load();
    else {
      setError('Login as admin to view support messages.');
      setLoading(false);
    }
  }, [token]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API}/support/messages/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'read' }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setMessages(messages.map(msg => 
        (msg._id || msg.id) === id ? { ...msg, status: 'read' } : msg
      ));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  return (
    <AdminLayout title="Support" description="Review contact form enquiries from the website.">
      {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Inbox</p>
            <h2 className="text-lg font-semibold">
              {messages.filter(m => m.status === 'new').length} unread support messages
            </h2>
          </div>
          <div className="text-sm text-slate-500">
            Total: {messages.length}
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-600">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="p-5 text-sm text-slate-600">No support messages yet.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {messages.map((message) => (
              <div key={message._id || message.id} className="grid gap-4 p-5 lg:grid-cols-[0.9fr,0.7fr,1.4fr]">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{message.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{message.email}</p>
                  <p className="mt-1 text-sm text-slate-500">{message.phone || 'No phone number'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{message.subject || 'General enquiry'}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {message.status === 'new' ? <span className="text-rose-600 font-bold">Unread</span> : 'Read'}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Recently received'}
                  </p>
                  {message.status === 'new' && (
                    <button
                      onClick={() => markAsRead(message._id || message.id)}
                      className="mt-3 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {message.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
