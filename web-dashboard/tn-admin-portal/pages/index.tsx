import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  BellIcon,
  MapIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'all' | 'active_hikers' | 'operators';
  status: 'draft' | 'published';
  createdAt: string;
}

interface Incident {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'reported' | 'investigating' | 'resolved';
  reportedAt: string;
}

interface Regulation {
  id: string;
  title: string;
  category: string;
  effectiveDate: string;
  status: 'active' | 'draft' | 'archived';
}

const TnAdminPortal: NextPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: '1', title: 'Mount Semeru Climbing Season Open', content: 'The climbing season for Mount Semeru will open on September 1, 2024...', target: 'all', status: 'published', createdAt: '2024-08-20' },
    { id: '2', title: 'New Conservation Fee', content: 'Effective October 2024, a new conservation fee of Rp 50,000 will be applied...', target: 'operators', status: 'draft', createdAt: '2024-08-22' },
  ]);

  const [kuotaData] = useState([
    { mountain: 'Mount Rinjani', daily: 500, used: 342, remaining: 158 },
    { mountain: 'Mount Semeru', daily: 200, used: 185, remaining: 15 },
    { mountain: 'Mount Merbabu', daily: 800, used: 456, remaining: 344 },
    { mountain: 'Mount Merapi', daily: 600, used: 520, remaining: 80 },
  ]);

  const [incidents] = useState<Incident[]>([
    { id: '1', type: 'Illegal Camping', location: 'Rinjani Crater Rim', description: 'Report of illegal camping at prohibited zone', status: 'investigating', reportedAt: '2024-08-21' },
    { id: '2', type: 'Wildlife Disturbance', location: 'Semeru Summit Trail', description: 'Group of hikers disturbing endangered species', status: 'reported', reportedAt: '2024-08-22' },
    { id: '3', type: 'Trail Damage', location: 'Merbabu Camp 2', description: 'Unauthorized trail modifications', status: 'resolved', reportedAt: '2024-08-18' },
  ]);

  const [regulations] = useState<Regulation[]>([
    { id: '1', title: 'Mandatory Guide Requirement', category: 'Safety', effectiveDate: '2024-01-01', status: 'active' },
    { id: '2', title: 'No Fire Policy at Crater Rim', category: 'Conservation', effectiveDate: '2023-06-01', status: 'active' },
    { id: '3', title: 'Plastic-Free Trail Initiative', category: 'Conservation', effectiveDate: '2024-03-01', status: 'active' },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', target: 'all' });

  const publishAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Please fill in all fields');
      return;
    }
    setAnnouncements([...announcements, {
      id: Date.now().toString(),
      ...newAnnouncement,
      status: 'published',
      createdAt: new Date().toISOString(),
    }]);
    setNewAnnouncement({ title: '', content: '', target: 'all' });
    toast.success('Announcement published!');
  };

  return (
    <>
      <Head><title>TN Admin Portal - MountainConnect ID</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Taman Nasional Admin Portal</h1>
            <p className="text-sm text-gray-500">Manage kuota, incidents, and park regulations</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Kuota Monitoring */}
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900">Kuota Monitoring (Today)</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kuotaData.map(k => (
                <div key={k.mountain} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900 mb-2">{k.mountain}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${k.remaining < 50 ? 'bg-red-500' : 'bg-primary-500'}`}
                      style={{ width: `${(k.used / k.daily) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{k.used}/{k.daily} used</span>
                    <span className={`font-medium ${k.remaining < 50 ? 'text-red-600' : 'text-primary-600'}`}>{k.remaining} left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incidents */}
            <div className="card">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-danger-600" />
                <h2 className="font-semibold text-gray-900">Incident Reports</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {incidents.map(incident => (
                  <div key={incident.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{incident.type}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{incident.location}</p>
                        <p className="text-xs text-gray-400 mt-1">{incident.description}</p>
                      </div>
                      <span className={`badge ${incident.status === 'resolved' ? 'bg-green-100 text-green-700' : incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulations */}
            <div className="card">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-secondary-600" />
                <h2 className="font-semibold text-gray-900">Park Regulations</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {regulations.map(reg => (
                  <div key={reg.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{reg.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{reg.category}</span>
                          <span className="text-xs text-gray-400">Effective: {format(new Date(reg.effectiveDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <span className={`badge ${reg.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Publish Announcement */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BellIcon className="w-5 h-5 text-accent-600" />
              <h2 className="font-semibold text-gray-900">Publish Announcement</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="input"
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Announcement content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={newAnnouncement.target}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                  className="input"
                >
                  <option value="all">All Users</option>
                  <option value="active_hikers">Active Hikers</option>
                  <option value="operators">Trip Operators</option>
                </select>
              </div>
              <button onClick={publishAnnouncement} className="btn-primary">
                Publish Announcement
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TnAdminPortal;
