import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { API } from '../lib/api';

const AdminSalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        const res = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ([]));
        if (!res.ok) throw new Error(data.error || 'Failed to load orders');
        
        // Filter by delivered and by period
        let filtered = (Array.isArray(data) ? data : []).filter(o => String(o.status).toLowerCase() === 'delivered');
        
        if (period === '7d' || period === '30d') {
          const days = period === '7d' ? 7 : 30;
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          filtered = filtered.filter(o => new Date(o.createdAt) >= cutoff);
        }
        
        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setOrders(filtered);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const downloadExcel = () => {
    if (!orders.length) return;
    
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Items Count', 'Payment Method', 'Subtotal (INR)', 'Shipping (INR)', 'Tax (INR)', 'Total (INR)'];
    
    const rows = orders.map(order => [
      String(order._id || order.id).toUpperCase(),
      new Date(order.createdAt).toLocaleDateString(),
      `"${(order.customerName || 'N/A').replace(/"/g, '""')}"`,
      `"${(order.customerEmail || 'N/A').replace(/"/g, '""')}"`,
      order.items?.length || 0,
      order.paymentMethod || 'N/A',
      (order.subtotalCents || 0) / 100,
      (order.shippingCents || 0) / 100,
      (order.taxCents || 0) / 100,
      (order.totalCents || 0) / 100
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Yunax_Sales_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCents || 0), 0);

  return (
    <AdminLayout title="Sales Report" description="Generate and download detailed sales reports of delivered orders.">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
           <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Total Revenue</p>
              <p className="text-xl">₹{(totalRevenue / 100).toLocaleString()}</p>
           </div>
           <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Total Orders</p>
              <p className="text-xl">{orders.length}</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 sm:py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button
            onClick={downloadExcel}
            disabled={loading || orders.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 sm:py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            Export to Excel
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Order ID</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Date</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Customer</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px]">Payment</th>
                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">Loading sales data...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">No delivered orders found for this timeframe.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id || order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900">#{String(order._id || order.id).slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 capitalize">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 text-right">₹{((order.totalCents || 0) / 100).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSalesReport;
