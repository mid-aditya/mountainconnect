import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {
  PlusIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

interface Trip {
  id: string;
  mountain: string;
  date: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  revenue: number;
}

interface Booking {
  id: string;
  tripId: string;
  userName: string;
  userEmail: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookedAt: string;
}

const OperatorPortal: NextPage = () => {
  const [trips, setTrips] = useState<Trip[]>([
    { id: '1', mountain: 'Mount Rinjani', date: addDays(new Date(), 5).toISOString(), maxParticipants: 12, currentParticipants: 8, price: 2500000, status: 'upcoming', revenue: 20000000 },
    { id: '2', mountain: 'Mount Merbabu', date: addDays(new Date(), 12).toISOString(), maxParticipants: 15, currentParticipants: 5, price: 1200000, status: 'upcoming', revenue: 6000000 },
    { id: '3', mountain: 'Mount Bromo', date: addDays(new Date(), -2).toISOString(), maxParticipants: 10, currentParticipants: 10, price: 1000000, status: 'ongoing', revenue: 10000000 },
    { id: '4', mountain: 'Mount Semeru', date: addDays(new Date(), -10).toISOString(), maxParticipants: 8, currentParticipants: 8, price: 3000000, status: 'completed', revenue: 24000000 },
  ]);

  const [bookings] = useState<Booking[]>([
    { id: 'b1', tripId: '1', userName: 'Ahmad Wijaya', userEmail: 'ahmad@test.com', status: 'confirmed', bookedAt: '2024-08-20' },
    { id: 'b2', tripId: '1', userName: 'Sarah Putri', userEmail: 'sarah@test.com', status: 'confirmed', bookedAt: '2024-08-21' },
    { id: 'b3', tripId: '2', userName: 'Budi Santoso', userEmail: 'budi@test.com', status: 'pending', bookedAt: '2024-08-22' },
  ]);

  const totalRevenue = trips.reduce((sum, t) => sum + t.revenue, 0);
  const upcomingTrips = trips.filter(t => t.status === 'upcoming').length;
  const totalParticipants = trips.reduce((sum, t) => sum + t.currentParticipants, 0);

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <Head><title>Operator Portal - MountainConnect ID</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Operator Portal</h1>
              <p className="text-sm text-gray-500">Manage your hiking trips and bookings</p>
            </div>
            <Link href="/operator-portal/trips/create" className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Create New Trip
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-6 flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl"><CurrencyDollarIcon className="w-6 h-6 text-primary-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Rp {(totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="p-3 bg-secondary-100 rounded-xl"><MapIcon className="w-6 h-6 text-secondary-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingTrips}</p>
                <p className="text-sm text-gray-500">Upcoming Trips</p>
              </div>
            </div>
            <div className="card p-6 flex items-center gap-4">
              <div className="p-3 bg-accent-100 rounded-xl"><UserGroupIcon className="w-6 h-6 text-accent-600" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
                <p className="text-sm text-gray-500">Total Participants</p>
              </div>
            </div>
          </div>

          {/* Trips List */}
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">My Trips</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="p-3 text-left">Mountain</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Participants</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Revenue</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {trips.map(trip => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{trip.mountain}</td>
                      <td className="p-3 text-gray-600">{format(new Date(trip.date), 'MMM d, yyyy')}</td>
                      <td className="p-3 text-gray-600">{trip.currentParticipants}/{trip.maxParticipants}</td>
                      <td className="p-3 text-gray-600">Rp {trip.price.toLocaleString()}</td>
                      <td className="p-3 font-medium text-gray-900">Rp {trip.revenue.toLocaleString()}</td>
                      <td className="p-3"><span className={`badge ${statusColors[trip.status]}`}>{trip.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Trip</th>
                    <th className="p-3 text-left">Booked</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{booking.userName}</p>
                        <p className="text-xs text-gray-500">{booking.userEmail}</p>
                      </td>
                      <td className="p-3 text-gray-600">{trips.find(t => t.id === booking.tripId)?.mountain}</td>
                      <td className="p-3 text-gray-600">{format(new Date(booking.bookedAt), 'MMM d, yyyy')}</td>
                      <td className="p-3">
                        <span className={`badge ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OperatorPortal;
