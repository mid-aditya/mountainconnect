import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { ExclamationTriangleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

const UserEmergencyPage: NextPage = () => {
  const [contactName, setContactName] = useState('Budi Wijaya');
  const [contactPhone, setContactPhone] = useState('+6281234567890');
  const [relationship, setRelationship] = useState('Keluarga');

  const handleSave = () => {
    toast.success('Kontak darurat disimpan (demo)');
  };

  return (
    <>
      <Head>
        <title>Darurat - MountainConnect ID</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kontak Darurat</h1>
            <p className="text-gray-500 mt-1">
              Orang yang dihubungi saat Anda menekan SOS di aplikasi mobile
            </p>
          </div>

          <div className="card p-5 border-danger-100 bg-danger-50/40 flex gap-4">
            <ExclamationTriangleIcon className="w-10 h-10 text-danger-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-danger-900">Penting sebelum pendakian</p>
              <p className="text-sm text-danger-800/90 mt-1">
                Pastikan nomor aktif dan dapat dihubungi di area minim sinyal (SMS fallback).
              </p>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-primary-600" />
              Kontak utama
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hubungan</label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="input"
              />
            </div>
            <button type="button" onClick={handleSave} className="btn-primary w-full sm:w-auto">
              Simpan kontak darurat
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default UserEmergencyPage;
