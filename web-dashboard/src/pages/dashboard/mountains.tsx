import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import DataTable, { Column } from '@/components/DataTable';
import toast from 'react-hot-toast';

interface Mountain {
  id: string;
  name: string;
  region: string;
  province: string;
  elevation: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: 'open' | 'closed' | 'restricted';
  routes: number;
  image?: string;
  createdAt: string;
}

const difficultyColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-green-100', text: 'text-green-700', label: 'Easy' },
  2: { bg: 'bg-lime-100', text: 'text-lime-700', label: 'Moderate' },
  3: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Challenging' },
  4: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Hard' },
  5: { bg: 'bg-red-100', text: 'text-red-700', label: 'Extreme' },
};

const MountainsPage: NextPage = () => {
  const [mountains, setMountains] = useState<Mountain[]>([
    { id: '1', name: 'Mount Rinjani', region: 'Lombok', province: 'West Nusa Tenggara', elevation: 3726, difficulty: 4, status: 'open', routes: 5, createdAt: '2023-01-15' },
    { id: '2', name: 'Mount Semeru', region: 'East Java', province: 'East Java', elevation: 3676, difficulty: 5, status: 'restricted', routes: 3, createdAt: '2023-01-20' },
    { id: '3', name: 'Mount Merbabu', region: 'Central Java', province: 'Central Java', elevation: 3145, difficulty: 2, status: 'open', routes: 4, createdAt: '2023-02-10' },
    { id: '4', name: 'Mount Merapi', region: 'Central Java', province: 'Central Java', elevation: 2930, difficulty: 3, status: 'open', routes: 6, createdAt: '2023-02-15' },
    { id: '5', name: 'Mount Bromo', region: 'East Java', province: 'East Java', elevation: 2329, difficulty: 1, status: 'open', routes: 2, createdAt: '2023-03-01' },
    { id: '6', name: 'Mount Kerinci', region: 'Jambi', province: 'Jambi', elevation: 3805, difficulty: 4, status: 'open', routes: 3, createdAt: '2023-03-10' },
    { id: '7', name: 'Mount Tambora', region: 'Sumbawa', province: 'West Nusa Tenggara', elevation: 2720, difficulty: 3, status: 'closed', routes: 2, createdAt: '2023-04-05' },
    { id: '8', name: 'Mount Ijen', region: 'East Java', province: 'East Java', elevation: 2386, difficulty: 2, status: 'open', routes: 2, createdAt: '2023-04-20' },
  ]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    region: '',
    province: '',
    elevation: '',
    difficulty: 2 as Mountain['difficulty'],
    status: 'open' as Mountain['status'],
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.region) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingMountain) {
      setMountains(prev => prev.map(m => m.id === editingMountain.id ? { ...m, ...formData, elevation: parseInt(formData.elevation) || 0 } : m));
      toast.success('Mountain updated successfully');
    } else {
      const newMountain: Mountain = {
        id: Date.now().toString(),
        ...formData,
        elevation: parseInt(formData.elevation) || 0,
        routes: 0,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
      };
      setMountains(prev => [...prev, newMountain]);
      toast.success('Mountain added successfully');
    }

    setShowModal(false);
    setEditingMountain(null);
    setFormData({ name: '', region: '', province: '', elevation: '', difficulty: 2, status: 'open', description: '' });
  };

  const handleEdit = (mountain: Mountain) => {
    setEditingMountain(mountain);
    setFormData({
      name: mountain.name,
      region: mountain.region,
      province: mountain.province,
      elevation: mountain.elevation.toString(),
      difficulty: mountain.difficulty,
      status: mountain.status,
      description: '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this mountain?')) return;
    setMountains(prev => prev.filter(m => m.id !== id));
    toast.success('Mountain deleted');
  };

  const columns: Column<Mountain>[] = [
    {
      key: 'name',
      header: 'Mountain',
      sortable: true,
      render: (mountain) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <MapPinIcon className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{mountain.name}</p>
            <p className="text-xs text-gray-500">{mountain.province}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'elevation',
      header: 'Elevation',
      sortable: true,
      render: (m) => `${m.elevation.toLocaleString()}m`,
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      sortable: true,
      render: (m) => (
        <span className={`badge ${difficultyColors[m.difficulty].bg} ${difficultyColors[m.difficulty].text}`}>
          {difficultyColors[m.difficulty].label}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m) => (
        <span className={`badge ${m.status === 'open' ? 'bg-green-100 text-green-700' : m.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {m.status}
        </span>
      ),
    },
    {
      key: 'routes',
      header: 'Routes',
      render: (m) => m.routes,
    },
    {
      key: 'createdAt',
      header: 'Added',
      sortable: true,
      render: (m) => format(new Date(m.createdAt), 'MMM d, yyyy'),
    },
  ];

  return (
    <>
      <Head><title>Mountains - MountainConnect ID</title></Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mountain Management</h1>
              <p className="text-gray-500 mt-1">Manage trails, routes, and mountain data</p>
            </div>
            <button
              onClick={() => { setEditingMountain(null); setShowModal(true); }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Mountain
            </button>
          </div>

          <DataTable
            columns={columns}
            data={mountains}
            keyExtractor={(m) => m.id}
            searchPlaceholder="Search mountains..."
            pageSize={10}
            isLoading={loading}
            actions={(mountain) => (
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => handleEdit(mountain)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(mountain.id)} className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingMountain ? 'Edit Mountain' : 'Add New Mountain'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Mount Rinjani"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="input"
                      placeholder="Lombok"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="input"
                      placeholder="West Nusa Tenggara"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Elevation (m)</label>
                    <input
                      type="number"
                      value={formData.elevation}
                      onChange={(e) => setFormData({ ...formData, elevation: e.target.value })}
                      className="input"
                      placeholder="3726"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) as Mountain['difficulty'] })}
                      className="input"
                    >
                      <option value={1}>Easy</option>
                      <option value={2}>Moderate</option>
                      <option value={3}>Challenging</option>
                      <option value={4}>Hard</option>
                      <option value={5}>Extreme</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Mountain['status'] })}
                    className="input"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSubmit} className="btn-primary">
                  {editingMountain ? 'Update' : 'Add'} Mountain
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

export default MountainsPage;
