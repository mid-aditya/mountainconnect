import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'notifications' | 'security';

const SettingsPage: NextPage = () => {
  const { data: session } = useSession();
  const user = session?.user as {
    name?: string;
    email?: string;
    role?: string;
    roles?: string[];
  };

  const [tab, setTab] = useState<SettingsTab>('profile');
  const [fullName, setFullName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySos, setNotifySos] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profil', icon: <UserCircleIcon className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifikasi', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'security', label: 'Keamanan', icon: <ShieldCheckIcon className="w-5 h-5" /> },
  ];

  const handleSave = () => {
    toast.success('Pengaturan disimpan (demo — hubungkan API nanti)');
  };

  const displayRole =
    user?.roles?.[0]?.replace('_', ' ') || user?.role?.replace('_', ' ') || 'admin';

  return (
    <>
      <Head>
        <title>Settings - MountainConnect ID</title>
      </Head>
      <Layout>
        <div className="space-y-6 animate-fade-in max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-gray-500 mt-1">Kelola profil admin dan preferensi akun</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <nav className="sm:w-52 flex sm:flex-col gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex-1 card p-6">
              {tab === 'profile' && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-gray-900">Profil Admin</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nama lengkap
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input type="email" value={email} disabled className="input bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Peran
                    </label>
                    <input
                      type="text"
                      value={displayRole}
                      disabled
                      className="input bg-gray-50 capitalize"
                    />
                  </div>
                  <button type="button" onClick={handleSave} className="btn-primary">
                    Simpan perubahan
                  </button>
                </div>
              )}

              {tab === 'notifications' && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-gray-900">Notifikasi</h2>
                  {[
                    {
                      key: 'email',
                      checked: notifyEmail,
                      set: setNotifyEmail,
                      title: 'Email digest',
                      desc: 'Ringkasan aktivitas platform harian',
                    },
                    {
                      key: 'sos',
                      checked: notifySos,
                      set: setNotifySos,
                      title: 'Alert SOS',
                      desc: 'Notifikasi instan saat insiden darurat',
                    },
                    {
                      key: 'weekly',
                      checked: notifyWeekly,
                      set: setNotifyWeekly,
                      title: 'Laporan mingguan',
                      desc: 'Statistik booking dan pertumbuhan user',
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.set(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary-500 rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                  <button type="button" onClick={handleSave} className="btn-primary">
                    Simpan preferensi
                  </button>
                </div>
              )}

              {tab === 'security' && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-gray-900">Keamanan</h2>
                  <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
                    <KeyIcon className="w-6 h-6 text-primary-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Ubah kata sandi</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Gunakan API forgot-password / reset-password backend untuk flow lengkap.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Kata sandi baru
                    </label>
                    <input type="password" placeholder="Min. 8 karakter" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Konfirmasi kata sandi
                    </label>
                    <input type="password" placeholder="Ulangi kata sandi" className="input" />
                  </div>
                  <button type="button" onClick={handleSave} className="btn-primary">
                    Perbarui kata sandi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SettingsPage;
