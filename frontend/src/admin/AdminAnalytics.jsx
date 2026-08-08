import { useEffect, useState } from 'react';
import { BarChart3, Users, IndianRupee, ShoppingBag, TrendingUp } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { API } from '../lib/api';

const StatCard = ({ icon: Icon, label, value, tone = 'default' }) => {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'primary'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-white text-slate-900 border-slate-200';

  return (
    <div className={`border rounded-2xl p-4 flex items-center gap-3 shadow-sm ${toneClass}`}>
      <div className="h-10 w-10 rounded-xl bg-white/70 grid place-items-center border border-white/60">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.28em] opacity-70">{label}</p>
        <p className="text-xl font-semibold truncate">{value}</p>
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API}/admin/analytics/stats?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load analytics data');
        }
        
        const json = await res.json();
        setStats(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [period]);

  return (
    <AdminLayout title="Analytics" description="Deep dive into sales, customers, and product performance.">
      <div className="mb-6 flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="30d">Last 30 Days</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {loading ? (
        <div className="text-slate-600 text-sm">Loading analytics data...</div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              icon={IndianRupee} 
              label="Total Revenue" 
              value={`₹${(stats.overview.totalRevenue / 100).toLocaleString()}`} 
              tone="success" 
            />
            <StatCard 
              icon={ShoppingBag} 
              label="Total Orders" 
              value={stats.overview.totalOrders} 
            />
            <StatCard 
              icon={Users} 
              label="Total Customers" 
              value={stats.overview.totalCustomers} 
              tone="primary"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
                <TrendingUp size={18} className="text-slate-500" />
                <h3 className="font-semibold text-slate-800">Top Selling Products</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-auto">
                {stats.topSellingProducts?.length === 0 ? (
                  <p className="p-5 text-sm text-slate-500">No product sales yet.</p>
                ) : (
                  stats.topSellingProducts?.map((item, i) => (
                    <div key={item.productId} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-slate-900">{item.totalQuantity} sold</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
                <BarChart3 size={18} className="text-slate-500" />
                <h3 className="font-semibold text-slate-800">Sales by Category</h3>
              </div>
              <div className="p-5 space-y-4 max-h-[350px] overflow-auto">
                {stats.salesByCategory?.length === 0 ? (
                  <p className="text-sm text-slate-500">No category data yet.</p>
                ) : (
                  stats.salesByCategory?.sort((a,b) => b.revenue - a.revenue).map((cat) => {
                    const totalRev = stats.salesByCategory.reduce((sum, c) => sum + c.revenue, 0);
                    const percent = totalRev > 0 ? (cat.revenue / totalRev) * 100 : 0;
                    
                    return (
                      <div key={cat.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{cat.category}</span>
                          <span className="font-semibold text-slate-900">₹{(cat.revenue / 100).toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
              <ShoppingBag size={18} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800">Recent Delivered Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Order ID</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Date</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-[11px] text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-6 text-center text-slate-500">No recent orders found for this timeframe.</td>
                    </tr>
                  ) : (
                    stats.recentOrders?.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-900">#{String(order.id).slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-3 text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-slate-600">{order.customerName}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900 text-right">₹{(order.totalCents / 100).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default AdminAnalytics;
