export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'staff' | 'admin';
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'Healthcare' | 'Dental' | 'Wellness' | 'Consulting' | 'Personal Care';
  description: string;
  durationMinutes: number;
  price: number;
  providerName: string;
  providerRole: string;
  providerAvatar?: string;
  location: string;
  rating: number;
  reviewsCount: number;
}

export type BookingStatus = 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  bookingRef: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  durationMinutes: number;
  price: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface TimeSlotOption {
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  isAvailable: boolean;
}
