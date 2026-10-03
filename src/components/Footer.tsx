import React from 'react';
import { Calendar, Phone, Mail, Clock } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useBooking();

  return (
    <footer className="bg-white border-t border-zinc-200 mt-16 text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                <Calendar className="w-4 h-4 text-zinc-100" />
              </div>
              <span className="text-base font-bold text-zinc-900 tracking-tight">
                BookEase
              </span>
            </div>
            <p className="text-xs text-zinc-600 max-w-sm leading-relaxed">
              A streamlined, dependable scheduling platform for appointments, consultations, and professional services. Simple, fast, and secure.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Mon–Fri: 8:00 AM – 7:00 PM
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('services')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Browse Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('book')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  Schedule Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('my-bookings')}
                  className="hover:text-zinc-900 transition-colors"
                >
                  My Reservations
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-3 uppercase tracking-wider text-[11px]">
              Customer Support
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>+1 (800) 555-BOOK</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>support@bookease.com</span>
              </li>
              <li className="pt-1 text-[11px] text-zinc-400">
                Cancel or reschedule anytime up to 24 hours prior to your slot.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-400 text-[11px]">
          <p>© {new Date().getFullYear()} BookEase Booking Services. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-600 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
