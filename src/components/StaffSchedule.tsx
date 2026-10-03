import React, { useState } from 'react';
import {
  XCircle,
  Check
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export const StaffSchedule: React.FC = () => {
  const { bookings, cancelBooking, showToast } = useBooking();
  const { user } = useAuth();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const staffBookings = bookings.filter(b => {
    const matchesProvider =
      user?.role === 'staff' && user.name
        ? b.providerName.toLowerCase().includes(user.name.toLowerCase().split(' ')[1] || user.name.toLowerCase())
        : true;

    const matchesSearch =
      !searchTerm ||
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch || !matchesProvider) return false;

    if (dateFilter === 'today') {
      return b.date === todayStr;
    }
    if (dateFilter === 'upcoming') {
      return b.date >= todayStr && b.status !== 'cancelled';
    }

    return true;
  });

  const handleMarkComplete = (bookingId: string) => {
    showToast(`Appointment ${bookingId} marked as completed.`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Staff Appointment Schedule</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Viewing clinic and specialist reservations for{' '}
            <span className="font-semibold text-zinc-700">{user?.name || 'Staff Member'}</span>
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search patient or ref..."
            className="px-3 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-6 pb-2 border-b border-zinc-100">
        <button
          onClick={() => setDateFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            dateFilter === 'all'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          All Appointments ({bookings.length})
        </button>
        <button
          onClick={() => setDateFilter('today')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            dateFilter === 'today'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Today's Schedule
        </button>
        <button
          onClick={() => setDateFilter('upcoming')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            dateFilter === 'upcoming'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Upcoming Confirmed
        </button>
      </div>

      {/* Table / List */}
      <div className="mt-6 bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs">
        {staffBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No appointment records found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Ref & Date</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {staffBookings.map(b => (
                  <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-zinc-800 block">{b.bookingRef}</span>
                      <span className="text-[11px] text-zinc-500">{b.date} · {b.timeSlot}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-zinc-900 block">{b.clientName}</span>
                      <span className="text-[11px] text-zinc-500">{b.clientEmail}</span>
                      {b.clientPhone && (
                        <span className="text-[10px] text-zinc-400 block">{b.clientPhone}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-zinc-800 block">{b.serviceName}</span>
                      <span className="text-[11px] text-zinc-500">{b.durationMinutes} min · ${b.price}</span>
                      {b.notes && (
                        <p className="text-[11px] text-zinc-600 italic mt-0.5 line-clamp-1">
                          "{b.notes}"
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-700">
                      {b.providerName}
                    </td>
                    <td className="py-3 px-4">
                      {b.status === 'confirmed' && (
                        <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Confirmed
                        </span>
                      )}
                      {b.status === 'rescheduled' && (
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                          Rescheduled
                        </span>
                      )}
                      {b.status === 'completed' && (
                        <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded">
                          Completed
                        </span>
                      )}
                      {b.status === 'cancelled' && (
                        <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleMarkComplete(b.id)}
                            title="Mark Completed"
                            className="p-1.5 text-green-700 hover:bg-green-50 rounded border border-green-200"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => cancelBooking(b.id)}
                            title="Cancel Booking"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
