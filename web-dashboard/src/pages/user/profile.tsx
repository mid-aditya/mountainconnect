import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

const UserProfilePage: NextPage = () => {
  const { data: session } = useSession();
  const [fullName, setFullName] = useState(session?.user?.name || '');
  const [bio, setBio] = useState('Pendaki weekend — fokus gunung Jawa.');
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('Tidak ada');

  const handleSave = () => {
    toast.success('Profil disimpan (demo)');
  };

  return (
    <>
      <Head>
        <title>Profil - MountainConnect ID</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Pendaki</h1>
            <p className="text-gray-500 mt-1">Data yang digunakan saat booking & SOS</p>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Informasi umum</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="input bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="input"
              />
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Info medis (SOS)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Golongan darah
              </label>
              <input
                type="text"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alergi</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="input"
              />
            </div>
            <button type="button" onClick={handleSave} className="btn-primary">
              Simpan profil
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default UserProfilePage;
