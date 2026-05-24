import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  MapIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';

const upcomingTrips = [
  { id: '1', mountain: 'Gunung Merbabu', date: '12 Jun 2026', status: 'Confirmed' },
  { id: '2', mountain: 'Gunung Rinjani', date: '28 Jul 2026', status: 'Pending' },
];

const UserHomePage: NextPage = () => {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(' ')[0] || 'Pendaki';

  return (
    <>
      <Head>
        <title>Beranda - MountainConnect ID</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Halo, {name}!</h1>
            <p className="text-gray-500 mt-1">
              Ringkasan trip, keamanan, dan aktivitas pendakian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <MapIcon className="w-8 h-8 text-primary-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">Trip terjadwal</p>
            </div>
            <div className="card p-5">
              <CalendarIcon className="w-8 h-8 text-secondary-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Hari mendaki (total)</p>
            </div>
            <div className="card p-5">
              <ShieldCheckIcon className="w-8 h-8 text-accent-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">Lv. 2</p>
              <p className="text-sm text-gray-500">Verifikasi identitas</p>
            </div>
            <div className="card p-5 border-danger-100 bg-danger-50/30">
              <ExclamationTriangleIcon className="w-8 h-8 text-danger-600 mb-2" />
              <p className="text-sm font-medium text-danger-800">SOS siap</p>
              <Link href="/user/emergency" className="text-xs text-danger-600 underline mt-1 inline-block">
                Atur kontak darurat
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Trip mendatang</h2>
                <Link href="/user/trips" className="text-sm text-primary-600 font-medium">
                  Lihat semua
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{trip.mountain}</p>
                      <p className="text-sm text-gray-500">{trip.date}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        trip.status === 'Confirmed'
                          ? 'bg-secondary-50 text-secondary-700'
                          : 'bg-accent-50 text-accent-700'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Aksi cepat</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/user/trips"
                  className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                  <p className="font-medium text-gray-900">Cari open trip</p>
                  <p className="text-sm text-gray-500 mt-1">Gabung tim pendakian</p>
                </Link>
                <Link
                  href="/user/profile"
                  className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                >
                  <p className="font-medium text-gray-900">Lengkapi profil</p>
                  <p className="text-sm text-gray-500 mt-1">Medis & verifikasi</p>
                </Link>
                <Link
                  href="/user/emergency"
                  className="p-4 rounded-xl border border-danger-100 hover:bg-danger-50/50 transition-colors sm:col-span-2"
                >
                  <p className="font-medium text-danger-800">Kontak darurat & SOS</p>
                  <p className="text-sm text-danger-600/80 mt-1">
                    Pastikan data darurat selalu terbaru sebelum pendakian
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default UserHomePage;
