import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatsCard from '../../components/admin/common/StatsCard';
import analyticsService from '../../services/analyticsService';
import ordersService from '../../services/ordersService';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    profitMargin: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = () => {
    // Revenue vs Expenses
    const comparison = analyticsService.getRevenueVsExpenses(dateRange);
    setStats(comparison);

    // Revenue trend data
    const revenue = analyticsService.getRevenueData(dateRange);
    const chartData = Object.entries(revenue.revenueByDate || {}).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: amount,
    }));
    setRevenueData(chartData);

    // Top products
    const products = analyticsService.getTopProducts(10);
    setTopProducts(products);

    // Order status distribution
    const orderStats = ordersService.getOrderStats();
    const statusData = [
      { name: 'Pending', value: orderStats.pending, color: '#F39C12' },
      { name: 'Processing', value: orderStats.processing, color: '#3498DB' },
      { name: 'Completed', value: orderStats.completed, color: '#27AE60' },
      { name: 'Cancelled', value: orderStats.cancelled, color: '#E74C3C' },
    ].filter(item => item.value > 0);
    setOrderStatusData(statusData);
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-primary mb-2">Analytics</h1>
            <p className="text-dark-gray">View detailed insights and reports</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          icon="💰"
          label="Total Revenue"
          value={formatCurrency(stats.revenue)}
          trend="up"
        />
        <StatsCard
          icon="💸"
          label="Total Expenses"
          value={formatCurrency(stats.expenses)}
          trend="neutral"
        />
        <StatsCard
          icon="💵"
          label="Net Profit"
          value={formatCurrency(stats.profit)}
          trend={stats.profit > 0 ? 'up' : 'down'}
        />
        <StatsCard
          icon="📊"
          label="Profit Margin"
          value={`${stats.profitMargin}%`}
          trend={parseFloat(stats.profitMargin) > 0 ? 'up' : 'down'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-dark mb-4">Revenue Trend</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#4A4A4A" style={{ fontSize: '12px' }} />
                <YAxis stroke="#4A4A4A" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E67E22',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E67E22"
                  strokeWidth={3}
                  dot={{ fill: '#E67E22', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-gray">
              <div className="text-center">
                <p className="text-4xl mb-2">📈</p>
                <p>No revenue data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-dark mb-4">Order Status Distribution</h2>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-gray">
              <div className="text-center">
                <p className="text-4xl mb-2">📊</p>
                <p>No order data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-dark mb-4">Top Selling Products</h2>
        {topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#4A4A4A" style={{ fontSize: '12px' }} />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                stroke="#4A4A4A"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E67E22',
                  borderRadius: '8px',
                }}
                formatter={(value, name) =>
                  name === 'revenue' ? formatCurrency(value) : value
                }
              />
              <Legend />
              <Bar dataKey="count" fill="#E67E22" name="Orders" radius={[0, 8, 8, 0]} />
              <Bar dataKey="revenue" fill="#F39C12" name="Revenue" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-dark-gray">
            <div className="text-center">
              <p className="text-6xl mb-2">🍕</p>
              <p>No sales data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-dark">Product Performance Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Orders</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Avg. Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={product.name} className="hover:bg-cream-light transition-colors">
                    <td className="px-6 py-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-yellow-700'
                            : 'bg-primary'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-dark">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-dark-gray">{product.count} orders</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-gray">
                      {formatCurrency(product.revenue / product.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
