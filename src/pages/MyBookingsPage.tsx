import React, { useState, useEffect } from 'react';
import { Booking } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { TicketView } from '../components/booking/TicketView.js';
import { CancelTicketModal } from '../components/booking/CancelTicketModal.js';
import { Modal } from '../components/common/Modal.js';
import {
  Ticket,
  Calendar,
  Clock,
  Train,
  AlertCircle,
  CheckCircle2,
  Printer,
  FileDown,
  XCircle,
  FileText,
  Search,
} from 'lucide-react';

interface MyBookingsPageProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED'>('ALL');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // Selected for full Ticket Modal
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Booking | null>(null);

  // Selected for Cancel Modal
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getUserBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to Access Your Bookings</h2>
        <p className="text-xs text-slate-500">
          View your confirmed e-tickets, upcoming train journeys, and cancellation receipts.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow transition"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Filter bookings according to tab and search query
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    // Search query filter (PNR or Train Name or Train Number)
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchPnr = b.pnr.includes(q);
      const matchTrain = b.train.name.toLowerCase().includes(q) || b.train.number.includes(q);
      if (!matchPnr && !matchTrain) return false;
    }

    if (activeTab === 'ALL') return true;
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'UPCOMING') return b.status !== 'CANCELLED' && b.journeyDate >= todayStr;
    if (activeTab === 'PAST') return b.status !== 'CANCELLED' && b.journeyDate < todayStr;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-7 h-7 text-blue-600" />
            <span>My Railway Bookings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your booked journey tickets, track statuses, and process cancellations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by PNR or Train..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Tickets (${bookings.length})` },
          {
            id: 'UPCOMING',
            label: `Upcoming (${bookings.filter((b) => b.status !== 'CANCELLED' && b.journeyDate >= todayStr).length})`,
          },
          {
            id: 'PAST',
            label: `Past Journeys (${bookings.filter((b) => b.status !== 'CANCELLED' && b.journeyDate < todayStr).length})`,
          },
          {
            id: 'CANCELLED',
            label: `Cancelled (${bookings.filter((b) => b.status === 'CANCELLED').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading your journey tickets...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Tickets Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this category. Book your next journey in just a few clicks!
          </p>
          <button
            type="button"
            onClick={() => onNavigate('search')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Book New Ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const isCancelled = b.status === 'CANCELLED';
            return (
              <div
                key={b.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: PNR & Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        PNR
                      </span>
                      <span className="text-base font-black font-mono tracking-widest text-blue-700">
                        {b.pnr}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Train details */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {b.train.number} - {b.train.name}
                      </h4>
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {b.travelClass}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <div>
                        <strong>{b.sourceStation.name}</strong> ({b.sourceStation.code})
                      </div>
                      <span className="text-slate-400">→</span>
                      <div>
                        <strong>{b.destinationStation.name}</strong> ({b.destinationStation.code})
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Date: {b.journeyDate}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ₹{b.totalFare.toFixed(2)}
                      </span>
                    </div>

                    {/* Passenger summary */}
                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Passengers ({b.passengers.length}):</span>{' '}
                      {b.passengers.map((p) => `${p.passengerName} (Coach: ${p.coachCode}, Seat: ${p.seatNumber})`).join(' • ')}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTicketBooking(b)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                    >
                      View Ticket
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          showToast('Generating official RailEase E-Ticket (PDF)...', 'info');
                          await generateTicketPDF(b);
                          showToast('PDF Ticket downloaded successfully!', 'success');
                        } catch (err) {
                          showToast('Failed to download PDF ticket', 'error');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      title="Download official PDF ticket"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>

                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setBookingToCancel(b)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket View Modal */}
      {selectedTicketBooking && (
        <Modal
          isOpen={Boolean(selectedTicketBooking)}
          onClose={() => setSelectedTicketBooking(null)}
          maxWidth="max-w-3xl"
        >
          <TicketView
            booking={selectedTicketBooking}
            onCancel={() => {
              setBookingToCancel(selectedTicketBooking);
              setSelectedTicketBooking(null);
            }}
          />
        </Modal>
      )}

      {/* Cancel Ticket Modal */}
      <CancelTicketModal
        isOpen={Boolean(bookingToCancel)}
        onClose={() => setBookingToCancel(null)}
        booking={bookingToCancel}
        onCancelled={(updated) => {
          setBookings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        }}
      />
    </div>
  );
};
