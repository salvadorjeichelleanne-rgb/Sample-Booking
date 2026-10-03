import React, { useState } from 'react';
import { Calendar, LogOut, ChevronDown, Check, Briefcase, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { DEMO_USERS } from '../data/mockData';

interface NavbarProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal }) => {
  const { user, isAuthenticated, logout, quickLogin } = useAuth();
  const { activeTab, setActiveTab, getUserBookings } = useBooking();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userBookings = getUserBookings();
  const upcomingCount = userBookings.filter(b => b.status === 'confirmed' || b.status === 'rescheduled').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('services')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Calendar className="w-5 h-5 text-zinc-100" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 group-hover:text-blue-600 transition-colors">
                BookEase
              </span>
              <span className="block text-[11px] text-zinc-500 font-normal leading-none">
                Appointment & Services
              </span>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'services'
                  ? 'text-zinc-900 bg-zinc-100 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Services
            </button>

            <button
              onClick={() => setActiveTab('book')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'book'
                  ? 'text-zinc-900 bg-zinc-100 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              Book Now
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'my-bookings'
                  ? 'text-zinc-900 bg-zinc-100 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <span>My Bookings</span>
              {upcomingCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {upcomingCount}
                </span>
              )}
            </button>

            {user?.role === 'staff' && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === 'staff'
                    ? 'text-zinc-900 bg-zinc-100 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                <span>Staff Schedule</span>
              </button>
            )}
          </nav>
        </div>

        {/* Auth / Profile Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-zinc-900 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 capitalize leading-none">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-zinc-100">
                      <p className="text-xs text-zinc-500">Signed in as</p>
                      <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('my-bookings');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                      >
                        <BookmarkCheck className="w-4 h-4 text-zinc-500" />
                        <span>My Bookings ({upcomingCount} upcoming)</span>
                      </button>

                      {user.role === 'staff' && (
                        <button
                          onClick={() => {
                            setActiveTab('staff');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4 text-zinc-500" />
                          <span>Staff Calendar & Duties</span>
                        </button>
                      )}

                      <div className="border-t border-zinc-100 my-1" />

                      {/* Demo Quick Switcher */}
                      <div className="px-4 py-1.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                        Switch Demo Account
                      </div>
                      {DEMO_USERS.map(demo => (
                        <button
                          key={demo.id}
                          onClick={() => {
                            quickLogin(demo.id);
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-4 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 flex items-center justify-between"
                        >
                          <span>
                            {demo.name} <span className="text-zinc-400">({demo.role})</span>
                          </span>
                          {user.id === demo.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}

                      <div className="border-t border-zinc-100 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-300 hover:border-zinc-400 rounded-md transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors shadow-2xs"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden border-t border-zinc-200 px-4 py-2 flex items-center justify-around bg-zinc-50 text-xs">
        <button
          onClick={() => setActiveTab('services')}
          className={`py-1 px-2 font-medium rounded ${
            activeTab === 'services' ? 'text-zinc-900 font-semibold' : 'text-zinc-600'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`py-1 px-2 font-medium rounded ${
            activeTab === 'book' ? 'text-zinc-900 font-semibold' : 'text-zinc-600'
          }`}
        >
          Book Now
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`py-1 px-2 font-medium rounded flex items-center gap-1 ${
            activeTab === 'my-bookings' ? 'text-zinc-900 font-semibold' : 'text-zinc-600'
          }`}
        >
          <span>Bookings</span>
          {upcomingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {upcomingCount}
            </span>
          )}
        </button>
        {user?.role === 'staff' && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-1 px-2 font-medium rounded ${
              activeTab === 'staff' ? 'text-zinc-900 font-semibold' : 'text-zinc-600'
            }`}
          >
            Staff Schedule
          </button>
        )}
      </div>
    </header>
  );
};
