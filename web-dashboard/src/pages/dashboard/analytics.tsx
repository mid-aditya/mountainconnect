import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  ArrowDownTrayIcon as DownloadIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage: NextPage = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Revenue (Rp Millions)',
        data: [45, 52, 61, 58, 72, 85, 92, 125],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'New Users',
        data: [820, 910, 720, 1050, 980, 1100, 1200, 1350],
        backgroundColor: 'rgba(85, 139, 47, 0.8)',
      },
    ],
  };

  const bookingTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      { label: 'Rinjani', data: [45, 52, 48, 61], borderColor: '#2E7D32', fill: false },
      { label: 'Semeru', data: [32, 38, 42, 35], borderColor: '#FF6F00', fill: false },
      { label: 'Merbabu', data: [28, 31, 35, 42], borderColor: '#1565C0', fill: false },
    ],
  };

  const conversionData = {
    labels: ['Visitors', 'Sign-ups', 'Profile Complete', 'First Booking', 'Repeat Users'],
    datasets: [{
      data: [50000, 12000, 8500, 3200, 1800],
      backgroundColor: ['#E8F5E9', '#C8E6C9', '#81C784', '#2E7D32', '#1B5E20'],
    }],
  };

  const popularMountains = [
    { name: 'Mount Rinjani', trips: 1250, revenue: 187500000, change: 15.2 },
    { name: 'Mount Semeru', trips: 980, revenue: 147000000, change: 8.5 },
    { name: 'Mount Merbabu', trips: 870, revenue: 104400000, change: 22.1 },
    { name: 'Mount Merapi', trips: 760, revenue: 91200000, change: -3.2 },
    { name: 'Mount Bromo', trips: 650, revenue: 65000000, change: 12.8 },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
  };

  const handleExport = () => {
    toast.success('Exporting analytics data...');
  };

  return (
    <>
      <Head><title>Analytics - MountainConnect ID</title></Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-500 mt-1">Revenue, growth, and conversion metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                {(['daily', 'weekly', 'monthly'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize ${
                      timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<CurrencyDollarIcon className="w-6 h-6" />} label="Total Revenue" value="Rp 125M" trend={{ value: 22.1, isUp: true }} color="primary" />
            <StatCard icon={<UserGroupIcon className="w-6 h-6" />} label="Total Users" value="12,450" trend={{ value: 15.2, isUp: true }} color="secondary" />
            <StatCard icon={<MapIcon className="w-6 h-6" />} label="Total Bookings" value="3,420" trend={{ value: 8.5, isUp: true }} color="accent" />
            <StatCard icon={<ArrowTrendingUpIcon className="w-6 h-6" />} label="Conversion Rate" value="6.4%" trend={{ value: 2.1, isUp: true }} color="primary" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Revenue Trend</h2>
              <div className="h-64"><Line data={revenueData} options={chartOptions} /></div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">User Growth</h2>
              <div className="h-64"><Bar data={userGrowthData} options={chartOptions} /></div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Booking Trends</h2>
              <div className="h-64">
                <Line data={bookingTrendsData} options={{ ...chartOptions, plugins: { legend: { display: true, position: 'bottom' as const } } }} />
              </div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
              <div className="h-64"><Doughnut data={conversionData} options={{ plugins: { legend: { display: true, position: 'right' as const, labels: { boxWidth: 12 } } } }} /></div>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Popular Mountains</h2>
              <div className="space-y-3">
                {popularMountains.map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400">{i + 1}</span>
                      <span className="text-sm text-gray-900">{m.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{m.trips} trips</p>
                      <p className="text-xs text-gray-500">{m.change > 0 ? '+' : ''}{m.change}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AnalyticsPage;
