import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { CheckBadgeIcon, XMarkIcon, FlagIcon, ShoppingBagIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import DataTable, { Column } from '@/components/DataTable';
import toast from 'react-hot-toast';

interface Listing {
  id: string;
  title: string;
  seller: string;
  price: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  reports?: number;
  createdAt: string;
}

interface Dispute {
  id: string;
  listingId: string;
  listingTitle: string;
  buyer: string;
  seller: string;
  amount: number;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved';
  createdAt: string;
}

const MarketplacePage: NextPage = () => {
  const [listings, setListings] = useState<Listing[]>([
    { id: '1', title: 'Trekking Poles Pro Carbon', seller: 'GearHut Official', price: 850000, category: 'Equipment', status: 'pending', createdAt: '2024-08-21' },
    { id: '2', title: 'Mountaineering Boots Size 42', seller: 'OutdoorStore', price: 2400000, category: 'Equipment', status: 'pending', reports: 2, createdAt: '2024-08-20' },
    { id: '3', title: 'Summit Backpack 65L', seller: 'HikersDen', price: 1800000, category: 'Equipment', status: 'approved', createdAt: '2024-08-19' },
    { id: '4', title: 'Professional Rain Jacket', seller: 'GearHut Official', price: 1200000, category: 'Apparel', status: 'reported', reports: 5, createdAt: '2024-08-18' },
    { id: '5', title: 'Headlamp LED 5000 lumens', seller: 'LightGear', price: 450000, category: 'Accessories', status: 'pending', createdAt: '2024-08-22' },
  ]);

  const [disputes, setDisputes] = useState<Dispute[]>([
    { id: '1', listingId: 'l1', listingTitle: 'Sleeping Bag Premium', buyer: 'Dewi L.', seller: 'CampGear ID', amount: 950000, reason: 'Item not as described', status: 'open', createdAt: '2024-08-20' },
    { id: '2', listingId: 'l2', listingTitle: 'Trekking Poles Set', buyer: 'Fajar N.', seller: 'MountainShop', amount: 650000, reason: 'Payment issue - escrow', status: 'reviewing', createdAt: '2024-08-19' },
    { id: '3', listingId: 'l3', listingTitle: 'Down Jacket XL', buyer: 'Rina W.', seller: 'OutdoorPro', amount: 2100000, reason: 'Seller not responding', status: 'resolved', createdAt: '2024-08-15' },
  ]);

  const [activeTab, setActiveTab] = useState<'pending' | 'reported' | 'disputes'>('pending');

  const handleApprove = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
    toast.success('Listing approved');
  };

  const handleReject = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
    toast.success('Listing rejected');
  };

  const pendingListings = listings.filter(l => l.status === 'pending');
  const reportedListings = listings.filter(l => l.status === 'reported');

  const listingColumns: Column<Listing>[] = [
    {
      key: 'title',
      header: 'Listing',
      render: (l) => (
        <div>
          <p className="font-medium text-gray-900">{l.title}</p>
          <p className="text-xs text-gray-500">{l.seller}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      render: (l) => `Rp ${l.price.toLocaleString()}`,
    },
    { key: 'createdAt', header: 'Submitted', render: (l) => format(new Date(l.createdAt), 'MMM d, yyyy') },
    { key: 'reports', header: 'Reports', render: (l) => l.reports || 0 },
  ];

  const disputeColumns: Column<Dispute>[] = [
    {
      key: 'listingTitle',
      header: 'Listing',
      render: (d) => (
        <div>
          <p className="font-medium text-gray-900">{d.listingTitle}</p>
          <p className="text-xs text-gray-500">Order #{d.id}</p>
        </div>
      ),
    },
    { key: 'buyer', header: 'Buyer' },
    { key: 'seller', header: 'Seller' },
    {
      key: 'amount',
      header: 'Amount',
      render: (d) => `Rp ${d.amount.toLocaleString()}`,
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <span className={`badge ${d.status === 'open' ? 'bg-red-100 text-red-700' : d.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
          {d.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <Head><title>Marketplace - MountainConnect ID</title></Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace Moderation</h1>
              <p className="text-gray-500 mt-1">Manage listings, reports, and escrow disputes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge bg-yellow-100 text-yellow-700">{pendingListings.length} pending</span>
              <span className="badge bg-red-100 text-red-700">{reportedListings.length} reported</span>
              <span className="badge bg-purple-100 text-purple-700">{disputes.length} disputes</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {(['pending', 'reported', 'disputes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab} {tab === 'pending' && `(${pendingListings.length})`}
                {tab === 'reported' && `(${reportedListings.length})`}
                {tab === 'disputes' && `(${disputes.length})`}
              </button>
            ))}
          </div>

          {/* Pending Listings */}
          {activeTab === 'pending' && (
            <DataTable
              columns={listingColumns}
              data={pendingListings}
              keyExtractor={(l) => l.id}
              searchPlaceholder="Search listings..."
              actions={(l) => (
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleApprove(l.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                    <CheckBadgeIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleReject(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            />
          )}

          {/* Reported Listings */}
          {activeTab === 'reported' && (
            <DataTable
              columns={listingColumns}
              data={reportedListings}
              keyExtractor={(l) => l.id}
              searchPlaceholder="Search reported listings..."
              actions={(l) => (
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => handleApprove(l.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Dismiss reports">
                    <CheckBadgeIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleReject(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Remove listing">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            />
          )}

          {/* Disputes */}
          {activeTab === 'disputes' && (
            <DataTable
              columns={disputeColumns}
              data={disputes}
              keyExtractor={(d) => d.id}
              searchPlaceholder="Search disputes..."
              actions={(d) => (
                d.status !== 'resolved' && (
                  <button className="btn-danger text-xs py-1.5">Review</button>
                )
              )}
            />
          )}
        </div>
      </Layout>
    </>
  );
};

export default MarketplacePage;
