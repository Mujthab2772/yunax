import { useEffect, useState } from 'react';
import { API } from '../lib/api';

const clearAdminSession = () => {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  } catch (err) {
    // Ignore storage access failures and let the redirect handle recovery.
  }
};

const AdminGuard = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      let token = '';
      try {
        token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
      } catch (err) {
        token = '';
      }

      if (!token) {
        clearAdminSession();
        window.location.replace('/admin/login');
        return;
      }

      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await res.json().catch(() => ({}));

        if (!res.ok || user?.role !== 'admin') {
          clearAdminSession();
          window.location.replace('/admin/login');
          return;
        }

        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        if (active) setStatus('ready');
      } catch (err) {
        clearAdminSession();
        window.location.replace('/admin/login');
      }
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status !== 'ready') {
    return null;
  }

  return children;
};

export default AdminGuard;
