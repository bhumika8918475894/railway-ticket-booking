import React, { useState, useEffect } from 'react';
import { TrainSearchResult, Station } from '../types/index.js';
import { api } from '../services/api.js';
import { TrainCard } from '../components/trains/TrainCard.js';
import { TrainScheduleModal } from '../components/trains/TrainScheduleModal.js';
import { SeatLayoutModal } from '../components/trains/SeatLayoutModal.js';
import { BookingWizard } from '../components/booking/BookingWizard.js';
import {
  Train,
  Filter,
  ArrowUpDown,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface SearchResultsPageProps {
  initialSearchParams: {
    from: string;
    to: string;
    date?: string;
    travelClass?: string;
    passengersCount?: number;
  };
  onNavigate: (tab: string, meta?: any) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialSearchParams,
  onNavigate,
}) => {
  const [fromStation, setFromStation] = useState(initialSearchParams.from || 'HWH');
  const [toStation, setToStation] = useState(initialSearchParams.to || 'NDLS');
  const [journeyDate, setJourneyDate] = useState(
    initialSearchParams.date || new Date().toISOString().split('T')[0]
  );
  const [travelClass, setTravelClass] = useState(initialSearchParams.travelClass || 'ALL');

  // Filters state
  const [isAcOnly, setIsAcOnly] = useState<string>('ALL'); // 'ALL' | 'true' | 'false'
  const [selectedTrainType, setSelectedTrainType] = useState<string>('ALL');
  const [departureSlot, setDepartureSlot] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('CHEAPEST'); // 'CHEAPEST' | 'FASTEST' | 'EARLIEST'

  const [loading, setLoading] = useState(true);
  const [trains, setTrains] = useState<TrainSearchResult[]>([]);
  const [sourceInfo, setSourceInfo] = useState<Station | null>(null);
  const [destInfo, setDestInfo] = useState<Station | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals & Booking flow
  const [activeScheduleTrain, setActiveScheduleTrain] = useState<TrainSearchResult | null>(null);
  const [activeSeatModalTrain, setActiveSeatModalTrain] = useState<TrainSearchResult | null>(null);
  const [activeSeatModalClass, setActiveSeatModalClass] = useState<string>('3A');

  // Active Booking
  const [bookingTrain, setBookingTrain] = useState<TrainSearchResult | null>(null);
  const [bookingClass, setBookingClass] = useState<string>('3A');

  const fetchTrains = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.searchTrains({
        from: fromStation,
        to: toStation,
        date: journeyDate,
        travelClass: travelClass !== 'ALL' ? travelClass : undefined,
        trainType: selectedTrainType !== 'ALL' ? selectedTrainType : undefined,
        isAc: isAcOnly !== 'ALL' ? isAcOnly : undefined,
        sortBy,
        departureSlot: departureSlot !== 'ALL' ? departureSlot : undefined,
      });

      if (res.success) {
        setTrains(res.trains);
        setSourceInfo(res.fromStation);
        setDestInfo(res.toStation);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No trains found for this route');
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [fromStation, toStation, journeyDate, travelClass, isAcOnly, selectedTrainType, departureSlot, sortBy]);

  // If in active booking wizard
  if (bookingTrain) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingWizard
          train={bookingTrain}
          initialClassCode={bookingClass}
          journeyDate={journeyDate}
          initialPassengerCount={initialSearchParams.passengersCount || 1}
          onBackToSearch={() => setBookingTrain(null)}
          onViewMyBookings={() => onNavigate('bookings')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Route Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Train className="w-4 h-4" />
            <span>Train Search Results</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {sourceInfo ? sourceInfo.name : fromStation} → {destInfo ? destInfo.name : toStation}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Date: <strong className="text-slate-800">{journeyDate}</strong> • Available Trains:{' '}
            <strong className="text-blue-700">{trains.length}</strong>
          </p>
        </div>

        {/* Quick Date Switcher */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={journeyDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setJourneyDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters & Sorting</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAcOnly('ALL');
                setSelectedTrainType('ALL');
                setDepartureSlot('ALL');
                setSortBy('CHEAPEST');
                setTravelClass('ALL');
              }}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <div className="space-y-1 text-xs">
              {[
                { id: 'CHEAPEST', label: 'Cheapest Fare' },
                { id: 'FASTEST', label: 'Fastest Duration' },
                { id: 'EARLIEST', label: 'Earliest Departure' },
              ].map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                    sortBy === s.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{s.label}</span>
                  <input
                    type="radio"
                    name="sortBy"
                    checked={sortBy === s.id}
                    onChange={() => setSortBy(s.id)}
                    className="accent-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* AC / Non-AC Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Comfort / AC
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsAcOnly('ALL')}
                className={`py-1.5 rounded-lg transition ${
                  isAcOnly === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setIsAcOnly('true')}
                className={`py-1.5 rounded-lg transition ${
                  isAcOnly === 'true' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                AC Only
              </button>
              <button
                type="button"
                onClick={() => setIsAcOnly('false')}
                className={`py-1.5 rounded-lg transition ${
                  isAcOnly === 'false' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Non-AC
              </button>
            </div>
          </div>

          {/* Train Types */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Train Type
            </label>
            <select
              value={selectedTrainType}
              onChange={(e) => setSelectedTrainType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Train Types</option>
              <option value="Rajdhani">Rajdhani Express</option>
              <option value="Vande Bharat">Vande Bharat Express</option>
              <option value="Shatabdi">Shatabdi Express</option>
              <option value="Superfast">Superfast Express</option>
              <option value="Duronto">Duronto Express</option>
            </select>
          </div>

          {/* Departure Slot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Departure Time Slot
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'ALL', label: 'Any Time (24h)' },
                { id: 'EARLY_MORNING', label: 'Early Morning (00:00 - 06:00)' },
                { id: 'MORNING', label: 'Morning (06:00 - 12:00)' },
                { id: 'AFTERNOON', label: 'Afternoon (12:00 - 18:00)' },
                { id: 'NIGHT', label: 'Night (18:00 - 24:00)' },
              ].map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setDepartureSlot(slot.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                    departureSlot === slot.id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Stream */}
        <main className="lg:col-span-9 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Searching Indian Railway Network...</h3>
              <p className="text-xs text-slate-500">Checking live coach inventories and seat availability</p>
            </div>
          ) : errorMsg || trains.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No Trains Found for This Route</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {errorMsg ||
                  `We could not find matching trains between ${fromStation} and ${toStation} for the selected criteria.`}
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFromStation('HWH');
                    setToStation('NDLS');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Try Howrah to New Delhi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFromStation('NDLS');
                    setToStation('BSB');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Try New Delhi to Varanasi
                </button>
              </div>
            </div>
          ) : (
            trains.map((train) => (
              <TrainCard
                key={train.id}
                train={train}
                selectedClassCode={travelClass !== 'ALL' ? travelClass : undefined}
                onBookNow={(t, cls) => {
                  setBookingTrain(t);
                  setBookingClass(cls);
                }}
                onViewSchedule={(t) => setActiveScheduleTrain(t)}
                onViewSeats={(t, cls) => {
                  setActiveSeatModalTrain(t);
                  setActiveSeatModalClass(cls);
                }}
              />
            ))
          )}
        </main>
      </div>

      {/* Train Schedule Modal */}
      <TrainScheduleModal
        isOpen={Boolean(activeScheduleTrain)}
        onClose={() => setActiveScheduleTrain(null)}
        trainId={activeScheduleTrain?.id || null}
        trainName={activeScheduleTrain?.name}
        trainNumber={activeScheduleTrain?.number}
      />

      {/* Visual Coach Seat Map Modal */}
      <SeatLayoutModal
        isOpen={Boolean(activeSeatModalTrain)}
        onClose={() => setActiveSeatModalTrain(null)}
        trainId={activeSeatModalTrain?.id || null}
        trainName={activeSeatModalTrain?.name}
        trainNumber={activeSeatModalTrain?.number}
        travelClass={activeSeatModalClass}
        selectedSeatIds={[]}
      />
    </div>
  );
};
