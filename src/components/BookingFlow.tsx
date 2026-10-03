import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { TIME_SLOTS_POOL, getFutureDate } from '../data/mockData';
import { Service, Booking } from '../types';

export const BookingFlow: React.FC = () => {
  const {
    services,
    selectedService,
    setSelectedService,
    createBooking,
    getBookedSlots,
    downloadIcsCalendarFile,
    setActiveTab,
  } = useBooking();
  const { user } = useAuth();

  // Current Step: 1 = Service, 2 = Date & Time, 3 = Client Details, 4 = Confirmed
  const [currentStep, setCurrentStep] = useState<number>(selectedService ? 2 : 1);

  // Date selection state: YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(getFutureDate(1));
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:00 AM');

  // Client Details Form
  const [clientName, setClientName] = useState<string>(user?.name || '');
  const [clientEmail, setClientEmail] = useState<string>(user?.email || '');
  const [clientPhone, setClientPhone] = useState<string>(user?.phone || '');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Result of latest booking
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);

  // Update form if user logs in
  React.useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.name);
      if (!clientEmail) setClientEmail(user.email);
      if (!clientPhone && user.phone) setClientPhone(user.phone);
    }
  }, [user]);

  // Calendar calculations
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().split('T')[0], [today]);

  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
    }> = [];

    // Prefix empty/prev days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: '',
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isToday: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthFormatted = String(month + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthFormatted}-${dayFormatted}`;
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        isToday,
      });
    }

    return days;
  }, [currentCalendarMonth, todayStr]);

  const activeService: Service = selectedService || services[0];

  // Booked slots on this day for the active service
  const bookedSlots = useMemo(() => {
    return getBookedSlots(activeService.id, selectedDate);
  }, [activeService.id, selectedDate, getBookedSlots]);

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(
      new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(
      new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1)
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!selectedDate) {
      setErrorMsg('Please select a booking date.');
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMsg('Please select a time slot.');
      return;
    }

    const booking = createBooking({
      serviceId: activeService.id,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      notes: notes.trim() || undefined,
    });

    setLatestBooking(booking);
    setCurrentStep(4); // Confirmed
  };

  const handleResetForAnotherBooking = () => {
    setLatestBooking(null);
    setSelectedDate(getFutureDate(1));
    setSelectedTimeSlot('10:00 AM');
    setNotes('');
    setCurrentStep(1);
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Step 4: Confirmation screen
  if (currentStep === 4 && latestBooking) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-center text-zinc-900">
            Appointment Confirmed!
          </h2>
          <p className="text-sm text-center text-zinc-600 mt-1 mb-6">
            We've reserved your slot. A confirmation receipt has been generated.
          </p>

          {/* Booking Summary Box */}
          <div className="bg-zinc-50 rounded-lg p-5 border border-zinc-200 space-y-4 mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                Booking Reference
              </span>
              <span className="text-sm font-mono font-bold text-zinc-900 bg-white px-2.5 py-1 rounded border border-zinc-200">
                {latestBooking.bookingRef}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-zinc-500 block">Service</span>
                <span className="font-semibold text-zinc-900">{latestBooking.serviceName}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Provider</span>
                <span className="font-medium text-zinc-800">{latestBooking.providerName}</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Date & Time</span>
                <span className="font-semibold text-zinc-900">
                  {formatFriendlyDate(latestBooking.date)} at {latestBooking.timeSlot}
                </span>
                <span className="text-xs text-zinc-500 block">({latestBooking.durationMinutes} min)</span>
              </div>
              <div>
                <span className="text-xs text-zinc-500 block">Total Due / Cost</span>
                <span className="font-bold text-zinc-900">${latestBooking.price}.00</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-600">
              <span className="font-medium text-zinc-700">Location:</span> {activeService.location}
            </div>

            {latestBooking.notes && (
              <div className="pt-2 text-xs text-zinc-600">
                <span className="font-medium text-zinc-700">Special Notes:</span> {latestBooking.notes}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => downloadIcsCalendarFile(latestBooking)}
              className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Add to Calendar (.ics)</span>
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className="flex-1 py-2.5 px-4 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>View in My Bookings</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={handleResetForAnotherBooking}
              className="text-xs text-zinc-500 hover:text-zinc-800 underline"
            >
              Book another service
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 text-xs font-semibold ${
              currentStep >= 1 ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep > 1
                  ? 'bg-zinc-900 text-white'
                  : currentStep === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">Select Service</span>
          </button>

          <div className="flex-1 h-0.5 mx-3 bg-zinc-200" />

          <button
            onClick={() => {
              if (selectedService) setCurrentStep(2);
            }}
            className={`flex items-center gap-2 text-xs font-semibold ${
              currentStep >= 2 ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep > 2
                  ? 'bg-zinc-900 text-white'
                  : currentStep === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">Date & Time</span>
          </button>

          <div className="flex-1 h-0.5 mx-3 bg-zinc-200" />

          <button
            onClick={() => {
              if (selectedService && selectedDate && selectedTimeSlot) setCurrentStep(3);
            }}
            className={`flex items-center gap-2 text-xs font-semibold ${
              currentStep >= 3 ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                currentStep === 3
                  ? 'bg-blue-600 text-white'
                  : currentStep > 3
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">Your Details</span>
          </button>
        </div>
      </div>

      {/* Main Form Content Container */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {/* Step 1: Select Service */}
        {currentStep === 1 && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Select a Service</h2>
            <p className="text-xs text-zinc-500 mb-6">
              Choose the consultation, treatment, or appointment you need
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setCurrentStep(2);
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                          {service.category}
                        </span>
                        <h3 className="text-base font-semibold text-zinc-900 mt-0.5">
                          {service.name}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-zinc-800">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {service.durationMinutes} min
                        </span>
                        <span>·</span>
                        <span className="text-zinc-500">{service.providerName}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900">
                        ${service.price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Picker */}
        {currentStep === 2 && (
          <div className="p-6">
            {/* Selected Service Quick Banner */}
            <div className="mb-6 p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">Booking:</span>
                <span className="text-sm font-bold text-zinc-900">{activeService.name}</span>
                <span className="text-xs text-zinc-600 block mt-0.5">
                  with {activeService.providerName} · {activeService.durationMinutes} min · ${activeService.price}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Change service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Interactive Month Calendar */}
              <div className="md:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-zinc-900">
                    {currentCalendarMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 border border-zinc-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 border border-zinc-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-400 mb-2">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, index) => {
                    if (!d.isCurrentMonth) {
                      return <div key={`empty-${index}`} className="h-9" />;
                    }

                    const isSelected = selectedDate === d.dateStr;
                    const isDisabled = d.isPast;

                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(d.dateStr)}
                        className={`h-9 rounded-md text-xs font-medium transition-colors flex items-center justify-center relative ${
                          isSelected
                            ? 'bg-zinc-900 text-white font-bold shadow-xs'
                            : isDisabled
                            ? 'text-zinc-300 cursor-not-allowed'
                            : 'text-zinc-800 hover:bg-zinc-100'
                        }`}
                      >
                        {d.dayNumber}
                        {d.isToday && !isSelected && (
                          <span className="w-1 h-1 bg-blue-600 rounded-full absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
                  <span>Selected Date:</span>
                  <span className="font-semibold text-zinc-900">
                    {formatFriendlyDate(selectedDate)}
                  </span>
                </div>
              </div>

              {/* Right Column: Time Slots */}
              <div className="md:col-span-5 md:border-l md:border-zinc-200 md:pl-6">
                <h3 className="text-sm font-bold text-zinc-900 mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-600" />
                  <span>Available Time Slots</span>
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  All times are in your local time zone
                </p>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {['Morning', 'Afternoon', 'Evening'].map(period => {
                    const slots = TIME_SLOTS_POOL.filter(s => s.period === period);
                    return (
                      <div key={period}>
                        <h4 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                          {period}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {slots.map(slot => {
                            const isBooked = bookedSlots.includes(slot.time);
                            const isSelected = selectedTimeSlot === slot.time;

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTimeSlot(slot.time)}
                                className={`py-2 px-2.5 rounded-md text-xs font-medium border text-center transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : isBooked
                                    ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through'
                                    : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                                }`}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 font-medium"
              >
                Back
              </button>

              <button
                type="button"
                disabled={!selectedDate || !selectedTimeSlot}
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Continue to Your Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Client Details */}
        {currentStep === 3 && (
          <form onSubmit={handleFormSubmit} className="p-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Your Information</h2>
            <p className="text-xs text-zinc-500 mb-6">
              Please enter your contact details to complete the booking reservation
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Preferred Location / Format
                </label>
                <div className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-2.5 rounded-md flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{activeService.location}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Reason for Visit / Special Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Please specify any symptoms, background information, or questions you would like addressed during the session."
                  className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>
            </div>

            {/* Booking Review Summary Card */}
            <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                Booking Overview
              </h4>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-700">
                <div>
                  <span className="font-semibold text-zinc-900">{activeService.name}</span>
                  <span className="text-zinc-500 block">
                    {formatFriendlyDate(selectedDate)} at {selectedTimeSlot} ({activeService.durationMinutes} mins)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 block">Total Due</span>
                  <span className="text-sm font-bold text-zinc-900">${activeService.price}.00</span>
                </div>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="mt-8 pt-4 border-t border-zinc-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 font-medium"
              >
                Back
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Reserve Appointment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
