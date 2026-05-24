import { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

const UserSettingsPage: NextPage = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [tripReminders, setTripReminders] = useState(true);

  return (
    <>
      <Head>
        <title>Pengaturan - MountainConnect ID</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-gray-500 mt-1">Preferensi notifikasi dan privasi</p>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Notifikasi</h2>
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 cursor-pointer">
              <span className="text-sm text-gray-800">Push notifikasi</span>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="w-4 h-4 text-primary-500 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 cursor-pointer">
              <span className="text-sm text-gray-800">Pengingat trip (H-1)</span>
              <input
                type="checkbox"
                checked={tripReminders}
                onChange={(e) => setTripReminders(e.target.checked)}
                className="w-4 h-4 text-primary-500 rounded"
              />
            </label>
            <button
              type="button"
              onClick={() => toast.success('Preferensi disimpan')}
              className="btn-primary"
            >
              Simpan
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default UserSettingsPage;
