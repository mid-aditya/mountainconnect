import { useState, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  EyeIcon,
  NoSymbolIcon as BanIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import DataTable, { Column } from '@/components/DataTable';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'operator' | 'admin' | 'tn_admin' | 'moderator';
  verificationLevel: 0 | 1 | 2 | 3;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  tripsCount: number;
  status: 'active' | 'banned' | 'suspended';
}

const roleColors: Record<string, string> = {
  user: 'bg-gray-100 text-gray-700',
  operator: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
  tn_admin: 'bg-blue-100 text-blue-700',
  moderator: 'bg-amber-100 text-amber-700',
};

const verificationLabels: Record<number, { label: string; color: string }> = {
  0: { label: 'Unverified', color: 'bg-gray-100 text-gray-600' },
  1: { label: 'Basic', color: 'bg-blue-100 text-blue-700' },
  2: { label: 'Verified', color: 'bg-green-100 text-green-700' },
  3: { label: 'Premium', color: 'bg-purple-100 text-purple-700' },
};

const UsersPage: NextPage = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Ahmad Wijaya', email: 'ahmad@example.com', role: 'user', verificationLevel: 2, joinedAt: '2024-01-15', lastActive: '2024-08-20', tripsCount: 12, status: 'active' },
    { id: '2', name: 'Sarah Indonesia', email: 'sarah@example.com', role: 'operator', verificationLevel: 3, joinedAt: '2023-06-10', lastActive: '2024-08-22', tripsCount: 45, status: 'active' },
    { id: '3', name: 'Budi Santoso', email: 'budi@example.com', role: 'user', verificationLevel: 1, joinedAt: '2024-03-20', lastActive: '2024-08-18', tripsCount: 3, status: 'active' },
    { id: '4', name: 'Diana Putri', email: 'diana@example.com', role: 'moderator', verificationLevel: 3, joinedAt: '2023-01-05', lastActive: '2024-08-22', tripsCount: 0, status: 'active' },
    { id: '5', name: 'Rizky Pratama', email: 'rizky@example.com', role: 'user', verificationLevel: 0, joinedAt: '2024-08-15', lastActive: '2024-08-21', tripsCount: 1, status: 'active' },
    { id: '6', name: 'Admin Utama', email: 'admin@mountainconnect.id', role: 'admin', verificationLevel: 3, joinedAt: '2022-01-01', lastActive: '2024-08-22', tripsCount: 0, status: 'active' },
    { id: '7', name: 'Hiker Bandit', email: 'bandit@example.com', role: 'user', verificationLevel: 1, joinedAt: '2024-02-28', lastActive: '2024-07-15', tripsCount: 8, status: 'banned' },
    { id: '8', name: 'TN Officer', email: 'tn@gunung.id', role: 'tn_admin', verificationLevel: 3, joinedAt: '2023-03-15', lastActive: '2024-08-22', tripsCount: 0, status: 'active' },
  ]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');

  const handleBanUser = useCallback(async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'banned' } : u));
    toast.success('User has been banned');
  }, []);

  const handleVerifyUser = useCallback(async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationLevel: Math.min(3, u.verificationLevel + 1) as User['verificationLevel'] } : u));
    toast.success('User verification updated');
  }, []);

  const filteredUsers = users.filter(user => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterVerification !== 'all' && user.verificationLevel !== parseInt(filterVerification)) return false;
    return true;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => (
        <span className={`badge ${roleColors[user.role]}`}>
          {user.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'verificationLevel',
      header: 'Verification',
      sortable: true,
      render: (user) => (
        <span className={`badge ${verificationLabels[user.verificationLevel].color}`}>
          {verificationLabels[user.verificationLevel].label}
        </span>
      ),
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      sortable: true,
      render: (user) => format(new Date(user.joinedAt), 'MMM d, yyyy'),
    },
    {
      key: 'tripsCount',
      header: 'Trips',
      sortable: true,
      render: (user) => user.tripsCount,
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`badge ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {user.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Users - MountainConnect ID</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500 mt-1">Manage and verify platform users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                  <option value="tn_admin">TN Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
                <select
                  value={filterVerification}
                  onChange={(e) => setFilterVerification(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Levels</option>
                  <option value="0">Unverified</option>
                  <option value="1">Basic</option>
                  <option value="2">Verified</option>
                  <option value="3">Premium</option>
                </select>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            keyExtractor={(user) => user.id}
            searchPlaceholder="Search by name or email..."
            pageSize={10}
            isLoading={loading}
            actions={(user) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => toast.success('View user details')}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="View"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                {user.verificationLevel < 3 && user.role === 'user' && (
                  <button
                    onClick={() => handleVerifyUser(user.id)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Verify"
                  >
                    <CheckBadgeIcon className="w-4 h-4" />
                  </button>
                )}
                {user.status === 'active' && user.role !== 'admin' && (
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Ban"
                  >
                    <BanIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </Layout>
    </>
  );
};

export default UsersPage;
