import { useState } from 'react';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

const MapWidget = dynamic(() => import('@/components/MapWidget'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  mountain: string;
  location: [number, number];
  status: 'active' | 'responding' | 'resolved';
  triggeredAt: string;
  duration: number;
  contacts: number;
}

interface OverdueHike {
  id: string;
  userName: string;
  mountain: string;
  lastLocation: string;
  expectedReturn: string;
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'contacted' | 'resolved';
}

const EmergencyPage: NextPage = () => {
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([
    { id: '1', userId: 'u1', userName: 'Dewi Lestari', mountain: 'Mount Semeru', location: [-8.108, 112.922], status: 'active', triggeredAt: new Date(Date.now() - 15 * 60000).toISOString(), duration: 15, contacts: 3 },
    { id: '2', userId: 'u2', userName: 'Fajar Nugroho', mountain: 'Mount Rinjani', location: [-8.41, 116.46], status: 'responding', triggeredAt: new Date(Date.now() - 45 * 60000).toISOString(), duration: 45, contacts: 2 },
    { id: '3', userId: 'u3', userName: 'Maya Sari', mountain: 'Mount Merbabu', location: [-7.455, 110.445], status: 'resolved', triggeredAt: new Date(Date.now() - 3 * 3600000).toISOString(), duration: 180, contacts: 4 },
  ]);

  const [overdueHikes, setOverdueHikes] = useState<OverdueHike[]>([
    { id: '1', userName: 'Ahmad Fauzi', mountain: 'Mount Kerinci', lastLocation: 'Camp 2', expectedReturn: new Date(Date.now() - 2 * 3600000).toISOString(), alertLevel: 'medium', status: 'pending' },
    { id: '2', userName: 'Siti Rahayu', mountain: 'Mount Merapi', lastLocation: 'Passing post 3', expectedReturn: new Date(Date.now() - 30 * 60000).toISOString(), alertLevel: 'high', status: 'contacted' },
    { id: '3', userName: 'Budi Santoso', mountain: 'Mount Bromo', lastLocation: 'Crater rim', expectedReturn: new Date(Date.now() - 5 * 3600000).toISOString(), alertLevel: 'critical', status: 'pending' },
    { id: '4', userName: 'Rina Wati', mountain: 'Mount Ijen', lastLocation: 'Blue fire area', expectedReturn: new Date(Date.now() - 1 * 3600000).toISOString(), alertLevel: 'low', status: 'resolved' },
  ]);

  const resolveSOS = (id: string) => {
    setSosAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('SOS alert resolved');
  };

  const contactSAR = (hikeId: string) => {
    setOverdueHikes(prev => prev.map(h => h.id === hikeId ? { ...h, status: 'contacted' } : h));
    toast.success('SAR team contacted');
  };

  const alertLevelColors = {
    low: 'bg-yellow-100 text-yellow-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
    critical: 'bg-red-600 text-white animate-pulse',
  };

  return (
    <>
      <Head><title>Emergency - MountainConnect ID</title></Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Monitoring</h1>
              <p className="text-gray-500 mt-1">Real-time SOS alerts and overdue hikes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {sosAlerts.filter(a => a.status === 'active').length} Active SOS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Live Map</h2>
              </div>
              <MapWidget
                center={[-2.5, 118]}
                zoom={5}
                markers={[
                  ...sosAlerts.filter(a => a.status === 'active').map(a => ({
                    position: a.location,
                    title: `SOS: ${a.userName}`,
                    description: `${a.mountain} - ${a.duration} min ago`,
                    color: 'red' as const,
                    pulsing: true,
                  })),
                  ...sosAlerts.filter(a => a.status === 'responding').map(a => ({
                    position: a.location,
                    title: `Responding: ${a.userName}`,
                    description: a.mountain,
                    color: 'orange' as const,
                  })),
                ]}
                height="450px"
              />
            </div>

            {/* SOS List */}
            <div className="card">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">SOS Alerts</h2>
                <span className="text-sm text-gray-500">{sosAlerts.length} total</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                {sosAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 ${alert.status === 'active' ? 'bg-red-50/50' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${alert.status === 'active' ? 'bg-red-100 text-red-600' : alert.status === 'responding' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                          <ExclamationTriangleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{alert.userName}</p>
                          <p className="text-sm text-gray-500">{alert.mountain}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatDistanceToNow(new Date(alert.triggeredAt))} ago
                            </span>
                            <span className="flex items-center gap-1">
                              <UserGroupIcon className="w-3 h-3" />
                              {alert.contacts} contacts
                            </span>
                          </div>
                        </div>
                      </div>
                      {alert.status === 'active' && (
                        <button
                          onClick={() => resolveSOS(alert.id)}
                          className="btn-primary text-xs py-1.5"
                        >
                          Resolve
                        </button>
                      )}
                      {alert.status === 'responding' && (
                        <span className="badge bg-orange-100 text-orange-700">Responding</span>
                      )}
                      {alert.status === 'resolved' && (
                        <span className="badge bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overdue Hikes */}
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Overdue Hikes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="p-3 text-left">Hiker</th>
                    <th className="p-3 text-left">Mountain</th>
                    <th className="p-3 text-left">Last Location</th>
                    <th className="p-3 text-left">Overdue By</th>
                    <th className="p-3 text-left">Alert</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {overdueHikes.map((hike) => (
                    <tr key={hike.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{hike.userName}</td>
                      <td className="p-3 text-gray-600">{hike.mountain}</td>
                      <td className="p-3 text-gray-600">{hike.lastLocation}</td>
                      <td className="p-3 text-gray-600">{formatDistanceToNow(new Date(hike.expectedReturn))}</td>
                      <td className="p-3">
                        <span className={`badge ${alertLevelColors[hike.alertLevel]}`}>
                          {hike.alertLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`badge ${hike.status === 'resolved' ? 'bg-green-100 text-green-700' : hike.status === 'contacted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {hike.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {hike.status !== 'resolved' && (
                          <button
                            onClick={() => contactSAR(hike.id)}
                            className="btn-danger text-xs py-1.5"
                          >
                            Contact SAR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default EmergencyPage;
