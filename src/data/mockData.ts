import { Service, User, Booking } from '../types';

export function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'General Health & Wellness Checkup',
    category: 'Healthcare',
    description: 'A comprehensive preventive health assessment including vitals, blood pressure, review of medical history, and personalized recommendations.',
    durationMinutes: 45,
    price: 85,
    providerName: 'Dr. Emily Brooks, MD',
    providerRole: 'Board Certified Family Physician',
    location: 'Suite 302, Riverdale Medical Center (or Telehealth)',
    rating: 4.9,
    reviewsCount: 128,
  },
  {
    id: 'srv-2',
    name: 'Comprehensive Dental Cleaning & Exam',
    category: 'Dental',
    description: 'Thorough plaque and tartar removal, polishing, periodontal gum evaluation, and digital bite-wing X-ray assessment.',
    durationMinutes: 60,
    price: 120,
    providerName: 'Dr. Marcus Vance, DDS',
    providerRole: 'Senior Dental Surgeon',
    location: 'Dental Suite 104, Westpark Plaza',
    rating: 4.8,
    reviewsCount: 94,
  },
  {
    id: 'srv-3',
    name: 'Physical Therapy & Injury Rehabilitation',
    category: 'Wellness',
    description: 'Targeted physical therapy evaluation for musculoskeletal pain, sports injuries, mobility recovery, and customized exercise plans.',
    durationMinutes: 50,
    price: 95,
    providerName: 'Sarah Jenkins, DPT',
    providerRole: 'Licensed Physical Therapist',
    location: 'ActiveLife Clinic, 420 Oak Avenue',
    rating: 4.9,
    reviewsCount: 76,
  },
  {
    id: 'srv-4',
    name: 'Legal Advice & Document Review',
    category: 'Consulting',
    description: 'One-on-one legal consultation regarding business contracts, real estate transactions, estate planning, or general civil advisory.',
    durationMinutes: 45,
    price: 150,
    providerName: 'David Chen, Esq.',
    providerRole: 'Corporate & Civil Attorney',
    location: 'Chen & Partners Law, Floor 8 (or Video Conference)',
    rating: 4.9,
    reviewsCount: 62,
  },
  {
    id: 'srv-5',
    name: 'Personal Financial & Retirement Planning',
    category: 'Consulting',
    description: 'In-depth consultation covering budget optimization, tax-efficient savings, retirement forecasting, and investment risk allocation.',
    durationMinutes: 60,
    price: 130,
    providerName: 'Elena Rostova, CFA',
    providerRole: 'Certified Financial Planner',
    location: 'Beacon Advisory Group, Suite 210',
    rating: 4.8,
    reviewsCount: 51,
  },
  {
    id: 'srv-6',
    name: 'Haircut, Beard Trim & Grooming Styling',
    category: 'Personal Care',
    description: 'Precision scissor haircut, hot towel treatment, beard sculpting, and hair styling consultation tailored to your face shape.',
    durationMinutes: 40,
    price: 50,
    providerName: 'Liam Davies',
    providerRole: 'Master Barber & Stylist',
    location: 'Modern Barber Studio, 15 Market St.',
    rating: 4.9,
    reviewsCount: 184,
  },
];

export const DEMO_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    role: 'client',
  },
  {
    id: 'usr-2',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    phone: '+1 (555) 987-6543',
    role: 'client',
  },
  {
    id: 'usr-3',
    name: 'Dr. Emily Brooks',
    email: 'emily@bookwell.com',
    phone: '+1 (555) 302-8800',
    role: 'staff',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    bookingRef: 'BW-84920',
    serviceId: 'srv-1',
    serviceName: 'General Health & Wellness Checkup',
    providerName: 'Dr. Emily Brooks, MD',
    clientName: 'Jane Doe',
    clientEmail: 'jane@example.com',
    clientPhone: '+1 (555) 234-5678',
    date: getFutureDate(3),
    timeSlot: '10:00 AM',
    durationMinutes: 45,
    price: 85,
    notes: 'Annual routine checkup and blood pressure monitoring.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-102',
    bookingRef: 'BW-71402',
    serviceId: 'srv-2',
    serviceName: 'Comprehensive Dental Cleaning & Exam',
    providerName: 'Dr. Marcus Vance, DDS',
    clientName: 'Jane Doe',
    clientEmail: 'jane@example.com',
    clientPhone: '+1 (555) 234-5678',
    date: getFutureDate(8),
    timeSlot: '02:00 PM',
    durationMinutes: 60,
    price: 120,
    notes: 'Standard 6-month cleaning.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-100',
    bookingRef: 'BW-39211',
    serviceId: 'srv-6',
    serviceName: 'Haircut, Beard Trim & Grooming Styling',
    providerName: 'Liam Davies',
    clientName: 'Jane Doe',
    clientEmail: 'jane@example.com',
    clientPhone: '+1 (555) 234-5678',
    date: getPastDate(12),
    timeSlot: '11:00 AM',
    durationMinutes: 40,
    price: 50,
    notes: 'Short taper fade on sides.',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

export const TIME_SLOTS_POOL = [
  { time: '09:00 AM', period: 'Morning' as const },
  { time: '10:00 AM', period: 'Morning' as const },
  { time: '11:00 AM', period: 'Morning' as const },
  { time: '01:00 PM', period: 'Afternoon' as const },
  { time: '02:00 PM', period: 'Afternoon' as const },
  { time: '03:00 PM', period: 'Afternoon' as const },
  { time: '04:00 PM', period: 'Afternoon' as const },
  { time: '05:00 PM', period: 'Evening' as const },
  { time: '06:00 PM', period: 'Evening' as const },
];
