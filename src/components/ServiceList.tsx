import React, { useState, useMemo } from 'react';
import { Search, Clock, Star, MapPin, ChevronRight, ShieldCheck, Calendar } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { Service } from '../types';

export const ServiceList: React.FC = () => {
  const { services, setSelectedService, setActiveTab } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Healthcare', 'Dental', 'Wellness', 'Consulting', 'Personal Care'];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory =
        selectedCategory === 'All' || service.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.providerName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setActiveTab('book');
  };

  return (
    <div>
      {/* Clean Hero Header - Simple, Normal, Not Flashy */}
      <section className="bg-white border-b border-zinc-200 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            Book trusted appointments in minutes
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto">
            Find certified doctors, consultants, and specialists. Pick a date, choose your time slot, and get instant calendar confirmation.
          </p>

          {/* Quick Search Bar */}
          <div className="mt-6 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-xs">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by service or specialist name..."
                className="w-full pl-11 pr-4 py-3 bg-white text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-xs text-zinc-400 hover:text-zinc-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Value Props Inline Text (No Pills) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-zinc-600" />
              Verified Specialists
            </span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-600" />
              Real-time Availability
            </span>
            <span aria-hidden="true" className="text-zinc-300">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-600" />
              Instant Confirmation
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Category Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            Showing <span className="font-bold text-zinc-800">{filteredServices.length}</span> services
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-zinc-200 mt-6">
            <p className="text-zinc-500 text-sm">No services match your search query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Category and Rating */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-semibold text-zinc-600 tracking-wide uppercase text-[10px]">
                      {service.category}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-700 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {service.rating} ({service.reviewsCount})
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-zinc-900 line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-2 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Provider Info */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 border border-zinc-200">
                      {service.providerName.replace(/Dr\.\s*/, '').charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 leading-tight">
                        {service.providerName}
                      </p>
                      <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                        {service.providerRole}
                      </p>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="mt-3 text-[11px] text-zinc-500 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{service.location}</span>
                  </div>
                </div>

                {/* Card Footer: Duration, Price, and Booking Button */}
                <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {service.durationMinutes} min
                    </span>
                    <span className="text-base font-extrabold text-zinc-900 block leading-tight">
                      ${service.price}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookService(service)}
                    className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Book Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
