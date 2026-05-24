import { NextPage } from 'next';
import Head from 'next/head';
import { MapIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';

const trips = [
  {
    id: '1',
    mountain: 'Gunung Merbabu',
    route: 'Via Selo',
    date: '12–13 Jun 2026',
    organizer: 'Basecamp Selo',
    status: 'Confirmed',
    price: 'Rp 850.000',
  },
  {
    id: '2',
    mountain: 'Gunung Rinjani',
    route: 'Sembalun – Senaru',
    date: '28–30 Jul 2026',
    organizer: 'Rinjani Explorer',
    status: 'Pending',
    price: 'Rp 2.500.000',
  },
  {
    id: '3',
    mountain: 'Gunung Bromo',
    route: 'Sunrise Penanjakan',
    date: '15 Agu 2025',
    organizer: 'Bromo Trip ID',
    status: 'Completed',
    price: 'Rp 450.000',
  },
];

const UserTripsPage: NextPage = () => (
  <>
    <Head>
      <title>Trip Saya - MountainConnect ID</title>
    </Head>
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Saya</h1>
          <p className="text-gray-500 mt-1">Booking open trip dan riwayat pendakian</p>
        </div>

        <div className="space-y-4">
          {trips.map((trip) => (
            <article key={trip.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900">{trip.mountain}</h2>
                <p className="text-sm text-gray-500">{trip.route} · {trip.organizer}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <CalendarIcon className="w-4 h-4" />
                  {trip.date}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold text-gray-900">{trip.price}</p>
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    trip.status === 'Confirmed'
                      ? 'bg-secondary-50 text-secondary-700'
                      : trip.status === 'Pending'
                        ? 'bg-accent-50 text-accent-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {trip.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  </>
);

export default UserTripsPage;
