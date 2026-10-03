import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, Service } from '../types';
import { INITIAL_SERVICES, INITIAL_BOOKINGS } from '../data/mockData';
import { useAuth } from './AuthContext';

export interface NewBookingInput {
  serviceId: string;
  date: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

export interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface BookingContextType {
  services: Service[];
  bookings: Booking[];
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  activeTab: 'services' | 'book' | 'my-bookings' | 'staff';
  setActiveTab: (tab: 'services' | 'book' | 'my-bookings' | 'staff') => void;
  createBooking: (input: NewBookingInput) => Booking;
  cancelBooking: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newTimeSlot: string) => void;
  getUserBookings: () => Booking[];
  getBookedSlots: (serviceId: string, date: string) => string[];
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  downloadIcsCalendarFile: (booking: Booking) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'bookwell_bookings_data_v1';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<Service | null>(INITIAL_SERVICES[0]);
  const [activeTab, setActiveTab] = useState<'services' | 'book' | 'my-bookings' | 'staff'>('services');
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_BOOKINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const createBooking = (input: NewBookingInput): Booking => {
    const targetService = services.find(s => s.id === input.serviceId) || services[0];
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const bookingRef = `BW-${randomCode}`;

    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      bookingRef,
      serviceId: targetService.id,
      serviceName: targetService.name,
      providerName: targetService.providerName,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      date: input.date,
      timeSlot: input.timeSlot,
      durationMinutes: targetService.durationMinutes,
      price: targetService.price,
      notes: input.notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);
    showToast(`Appointment confirmed! Booking Ref: ${bookingRef}`, 'success');
    return newBooking;
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    );
    showToast('Appointment has been cancelled.', 'info');
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTimeSlot: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              timeSlot: newTimeSlot,
              status: 'rescheduled' as const,
            }
          : b
      )
    );
    showToast(`Appointment successfully moved to ${newDate} at ${newTimeSlot}.`, 'success');
  };

  const getUserBookings = (): Booking[] => {
    if (!user) {
      return [];
    }
    const emailMatch = user.email.toLowerCase();
    return bookings.filter(
      b => b.clientEmail.toLowerCase() === emailMatch || b.clientName.toLowerCase() === user.name.toLowerCase()
    );
  };

  const getBookedSlots = (serviceId: string, date: string): string[] => {
    return bookings
      .filter(b => b.serviceId === serviceId && b.date === date && b.status !== 'cancelled')
      .map(b => b.timeSlot);
  };

  const downloadIcsCalendarFile = (booking: Booking) => {
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return { hours: 9, minutes: 0 };
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const { hours, minutes } = parseTime(booking.timeSlot);
    const [year, month, day] = booking.date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, hours, minutes, 0);
    const endDate = new Date(startDate.getTime() + booking.durationMinutes * 60000);

    const formatIcsDate = (date: Date) => {
      return date
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookEase//Booking Appointment//EN',
      'BEGIN:VEVENT',
      `UID:${booking.bookingRef}-${Date.now()}@bookease.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${booking.serviceName} with ${booking.providerName}`,
      `DESCRIPTION:Booking Ref: ${booking.bookingRef}\\nService: ${booking.serviceName}\\nDuration: ${booking.durationMinutes} min\\nPrice: $${booking.price}\\nClient: ${booking.clientName}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appointment-${booking.bookingRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar event file (.ics) downloaded.', 'info');
  };

  return (
    <BookingContext.Provider
      value={{
        services,
        bookings,
        selectedService,
        setSelectedService,
        activeTab,
        setActiveTab,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        getUserBookings,
        getBookedSlots,
        toasts,
        showToast,
        removeToast,
        downloadIcsCalendarFile,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const useBookings = useBooking;
