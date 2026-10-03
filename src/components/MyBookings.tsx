import React, { useState } from 'react';
import {
  CalendarX2,
  Download,
  AlertTriangle,
  RotateCcw,
  Plus,
  Receipt,
  X
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';
import { TIME_SLOTS_POOL, getFutureDate } from '../data/mockData';

export const MyBookings: React.FC = () => {
  const {
    bookings,
    getUserBookings,
    cancelBooking,
    rescheduleBooking,
    downloadIcsCalendarFile,
    setActiveTab,
  } = useBooking();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  // Cancel modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  // Reschedule modal state
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<string>(getFutureDate(2));
  const [newTimeSlot, setNewTimeSlot] = useState<string>('02:00 PM');

  // Receipt modal state
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  const displayedBookings = user ? getUserBookings() : bookings;
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = displayedBookings.filter(b => {
    if (activeFilter === 'cancelled') {
      return b.status === 'cancelled';
    }
    if (activeFilter === 'upcoming') {
      return (b.status === 'confirmed' || b.status === 'rescheduled') && b.date >= todayStr;
    }
    if (activeFilter === 'past') {
      return b.status === 'completed' || b.date < todayStr;
    }
    return true;
  });

  const handleConfirmCancel = () => {
    if (cancellingBooking) {
      cancelBooking(cancellingBooking.id);
      setCancellingBooking(null);
    }
  };

  const handleConfirmReschedule = () => {
    if (reschedulingBooking && newDate && newTimeSlot) {
      rescheduleBooking(reschedulingBooking.id, newDate, newTimeSlot);
      setReschedulingBooking(null);
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Appointments</h1>
          <p className="text-xs text-zinc-500 mt-1">
            {user
              ? `Managing appointments for ${user.name} (${user.email})`
              : 'Viewing local appointment reservations'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('book')}
          className="self-start sm:self-auto py-2 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-6 pb-2 border-b border-zinc-100">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeFilter === 'upcoming'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveFilter('past')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeFilter === 'past'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeFilter === 'cancelled'
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Bookings List */}
      <div className="mt-6 space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200 p-8">
            <CalendarX2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-800">
              No {activeFilter} appointments found
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {activeFilter === 'upcoming'
                ? 'You do not have any scheduled appointments. Book one in a few clicks!'
                : `There are currently no ${activeFilter} bookings in your record.`}
            </p>
            {activeFilter === 'upcoming' && (
              <button
                onClick={() => setActiveTab('services')}
                className="mt-4 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-md hover:bg-zinc-800 transition-colors"
              >
                Browse Services
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map(booking => {
            const isCancelled = booking.status === 'cancelled';
            const isUpcoming = (booking.status === 'confirmed' || booking.status === 'rescheduled') && booking.date >= todayStr;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs hover:border-zinc-300 transition-all"
              >
                <div className="p-5 sm:p-6">
                  {/* Top Bar: Service, Ref, Status */}
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                          {booking.bookingRef}
                        </span>
                        <span className="text-xs text-zinc-400">·</span>
                        <span className="text-xs text-zinc-500">
                          {booking.providerName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 mt-1">
                        {booking.serviceName}
                      </h3>
                    </div>

                    {/* Status indicator without flashy pills */}
                    <div className="text-right">
                      {booking.status === 'confirmed' && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                          Confirmed
                        </span>
                      )}
                      {booking.status === 'rescheduled' && (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                          Rescheduled
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded">
                          Completed
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date & Time details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs text-zinc-700">
                    <div>
                      <span className="text-zinc-400 block font-medium">Date & Time</span>
                      <span className="font-semibold text-zinc-900 block mt-0.5">
                        {formatFriendlyDate(booking.date)}
                      </span>
                      <span className="text-zinc-600">{booking.timeSlot} ({booking.durationMinutes} min)</span>
                    </div>

                    <div>
                      <span className="text-zinc-400 block font-medium">Client Info</span>
                      <span className="font-semibold text-zinc-900 block mt-0.5">
                        {booking.clientName}
                      </span>
                      <span className="text-zinc-500 block truncate">{booking.clientEmail}</span>
                    </div>

                    <div>
                      <span className="text-zinc-400 block font-medium">Cost</span>
                      <span className="font-bold text-zinc-900 block text-sm mt-0.5">
                        ${booking.price}.00
                      </span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-100 mb-2">
                      <span className="font-semibold text-zinc-700">Client Note: </span>
                      {booking.notes}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-2 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadIcsCalendarFile(booking)}
                        className="py-1.5 px-2.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded transition-colors flex items-center gap-1.5 font-medium"
                      >
                        <Download className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Add to Calendar</span>
                      </button>

                      <button
                        onClick={() => setReceiptBooking(booking)}
                        className="py-1.5 px-2.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded transition-colors flex items-center gap-1.5 font-medium"
                      >
                        <Receipt className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Receipt</span>
                      </button>
                    </div>

                    {isUpcoming && !isCancelled && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReschedulingBooking(booking);
                            setNewDate(booking.date);
                            setNewTimeSlot(booking.timeSlot);
                          }}
                          className="py-1.5 px-3 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded font-semibold transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => setCancellingBooking(booking)}
                          className="py-1.5 px-3 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs"
            onClick={() => setCancellingBooking(null)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 border border-zinc-200 shadow-xl z-10">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-center text-zinc-900">
              Cancel Appointment?
            </h3>
            <p className="text-xs text-center text-zinc-600 mt-1 mb-4">
              Are you sure you want to cancel your appointment for{' '}
              <span className="font-semibold text-zinc-800">
                {cancellingBooking.serviceName}
              </span>{' '}
              on {formatFriendlyDate(cancellingBooking.date)} at {cancellingBooking.timeSlot}?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-2xs"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Dialog */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs"
            onClick={() => setReschedulingBooking(null)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 border border-zinc-200 shadow-xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-zinc-500">
                  {reschedulingBooking.serviceName} with {reschedulingBooking.providerName}
                </p>
              </div>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Choose New Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Choose New Time Slot
                </label>
                <select
                  value={newTimeSlot}
                  onChange={e => setNewTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {TIME_SLOTS_POOL.map(s => (
                    <option key={s.time} value={s.time}>
                      {s.time} ({s.period})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setReschedulingBooking(null)}
                className="flex-1 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs"
            onClick={() => setReceiptBooking(null)}
          />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 border border-zinc-200 shadow-xl z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="font-bold text-sm text-zinc-900">Official Receipt</span>
              <button
                onClick={() => setReceiptBooking(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Booking Ref:</span>
                <span className="font-mono font-bold text-zinc-800">{receiptBooking.bookingRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Issued to:</span>
                <span className="font-medium text-zinc-800">{receiptBooking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="text-zinc-800">{receiptBooking.clientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Service:</span>
                <span className="font-semibold text-zinc-800">{receiptBooking.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Provider:</span>
                <span className="text-zinc-800">{receiptBooking.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Appointment Date:</span>
                <span className="text-zinc-800">{formatFriendlyDate(receiptBooking.date)} at {receiptBooking.timeSlot}</span>
              </div>
              <div className="border-t border-dashed border-zinc-200 my-2 pt-2 flex justify-between text-sm">
                <span className="font-bold text-zinc-900">Total Paid / Due:</span>
                <span className="font-bold text-zinc-900">${receiptBooking.price}.00 USD</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-2 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
