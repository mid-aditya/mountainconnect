import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ItineraryDay {
  day: number;
  activities: string[];
}

const CreateTripPage: NextPage = () => {
  const [formData, setFormData] = useState({
    mountain: '',
    startDate: '',
    endDate: '',
    maxParticipants: 10,
    price: 0,
    difficulty: 2,
    includes: {
      transport: false,
      meals: false,
      equipment: false,
      guide: false,
      accommodation: false,
    },
    cancellationPolicy: 'flexible',
    description: '',
  });

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, activities: ['Registration', 'Basecamp preparation'] },
    { day: 2, activities: ['Summit attempt', 'Camp at crater rim'] },
    { day: 3, activities: ['Descend to basecamp', 'Return'] },
  ]);

  const addDay = () => {
    setItinerary([...itinerary, { day: itinerary.length + 1, activities: [] }]);
  };

  const removeDay = (dayIndex: number) => {
    setItinerary(itinerary.filter((_, i) => i !== dayIndex).map((d, i) => ({ ...d, day: i + 1 })));
  };

  const addActivity = (dayIndex: number, activity: string) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.push(activity);
    setItinerary(newItinerary);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };

  const handleSubmit = () => {
    if (!formData.mountain || !formData.startDate || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Trip created successfully!');
  };

  const mountains = ['Mount Rinjani', 'Mount Semeru', 'Mount Merbabu', 'Mount Merapi', 'Mount Bromo', 'Mount Kerinci', 'Mount Ijen', 'Mount Tambora'];

  return (
    <>
      <Head><title>Create Trip - Operator Portal</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/operator-portal" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Trip</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mountain *</label>
                <select
                  value={formData.mountain}
                  onChange={(e) => setFormData({ ...formData, mountain: e.target.value })}
                  className="input"
                >
                  <option value="">Select mountain</option>
                  {mountains.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                  className="input"
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Moderate</option>
                  <option value={3}>Challenging</option>
                  <option value={4}>Hard</option>
                  <option value={5}>Extreme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="input"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (IDR) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="input"
                  placeholder="2500000"
                />
              </div>
            </div>
          </div>

          {/* Includes */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">What's Included</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(formData.includes).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      includes: { ...formData.includes, [key]: e.target.checked }
                    })}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Itinerary</h2>
              <button onClick={addDay} className="btn-secondary flex items-center gap-2 text-sm">
                <PlusIcon className="w-4 h-4" />
                Add Day
              </button>
            </div>
            <div className="space-y-4">
              {itinerary.map((day, dayIndex) => (
                <div key={day.day} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Day {day.day}</h3>
                    {itinerary.length > 1 && (
                      <button onClick={() => removeDay(dayIndex)} className="text-gray-400 hover:text-red-600">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {day.activities.map((activity, actIndex) => (
                      <span key={actIndex} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm">
                        {activity}
                        <button onClick={() => removeActivity(dayIndex, actIndex)} className="text-gray-400 hover:text-red-600 ml-1">×</button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const activity = prompt('Enter activity:');
                        if (activity) addActivity(dayIndex, activity);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-primary-500 hover:text-primary-600"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
            <select
              value={formData.cancellationPolicy}
              onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
              className="input"
            >
              <option value="flexible">Flexible - Full refund up to 7 days before</option>
              <option value="moderate">Moderate - Full refund up to 3 days before</option>
              <option value="strict">Strict - No refund after booking</option>
            </select>
          </div>

          <button onClick={handleSubmit} className="btn-primary w-full py-3 text-lg">
            Create Trip
          </button>
        </main>
      </div>
    </>
  );
};

export default CreateTripPage;
