import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../../types/index.js';
import { api } from '../../services/api.js';
import {
  MapPin,
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  Train,
  Check,
  ChevronDown,
} from 'lucide-react';

interface HeroSearchProps {
  onSearch: (params: {
    from: string;
    to: string;
    date: string;
    travelClass: string;
    passengersCount: number;
  }) => void;
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialClass?: string;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  initialFrom = 'HWH',
  initialTo = 'NDLS',
  initialDate,
  initialClass = 'ALL',
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [fromQuery, setFromQuery] = useState(initialFrom);
  const [toQuery, setToQuery] = useState(initialTo);
  const [selectedFrom, setSelectedFrom] = useState<Station | null>(null);
  const [selectedTo, setSelectedTo] = useState<Station | null>(null);

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Today + 1 day formatted as YYYY-MM-DD
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [journeyDate, setJourneyDate] = useState<string>(initialDate || getDefaultDate());
  const [travelClass, setTravelClass] = useState<string>(initialClass);
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [rotateSwap, setRotateSwap] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Fetch all stations on mount
  useEffect(() => {
    api
      .getStations()
      .then((res) => {
        if (res.success && res.stations) {
          setStations(res.stations);

          // Match initial source
          const foundSrc = res.stations.find(
            (s) => s.code === initialFrom || s.id === initialFrom || s.city.toLowerCase().includes(initialFrom.toLowerCase())
          );
          if (foundSrc) {
            setSelectedFrom(foundSrc);
            setFromQuery(`${foundSrc.name} (${foundSrc.code})`);
          }

          // Match initial dest
          const foundDest = res.stations.find(
            (s) => s.code === initialTo || s.id === initialTo || s.city.toLowerCase().includes(initialTo.toLowerCase())
          );
          if (foundDest) {
            setSelectedTo(foundDest);
            setToQuery(`${foundDest.name} (${foundDest.code})`);
          }
        }
      })
      .catch((err) => console.error('Failed to load stations:', err));
  }, [initialFrom, initialTo]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setToOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    setRotateSwap((prev) => !prev);
    const tempStation = selectedFrom;
    const tempQuery = fromQuery;

    setSelectedFrom(selectedTo);
    setFromQuery(toQuery);

    setSelectedTo(tempStation);
    setToQuery(tempQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromCode = selectedFrom?.code || fromQuery.trim();
    const toCode = selectedTo?.code || toQuery.trim();

    onSearch({
      from: fromCode,
      to: toCode,
      date: journeyDate,
      travelClass,
      passengersCount,
    });
  };

  // Quick date pickers
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setJourneyDate(d.toISOString().split('T')[0]);
  };

  const filteredFromStations = stations.filter(
    (s) =>
      s.code.toLowerCase().includes(fromQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(fromQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(fromQuery.toLowerCase())
  );

  const filteredToStations = stations.filter(
    (s) =>
      s.code.toLowerCase().includes(toQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(toQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(toQuery.toLowerCase())
  );

  const classesOptions = [
    { code: 'ALL', label: 'All Classes' },
    { code: '1A', label: 'AC First Class (1A)' },
    { code: '2A', label: 'AC 2 Tier (2A)' },
    { code: '3A', label: 'AC 3 Tier (3A)' },
    { code: 'CC', label: 'AC Chair Car (CC)' },
    { code: 'EC', label: 'Exec. Chair Car (EC)' },
    { code: 'SL', label: 'Sleeper Class (SL)' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-7 relative z-20">
      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* FROM STATION */}
          <div className="md:col-span-5 relative" ref={fromRef}>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>From Station</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fromQuery}
                onFocus={() => setFromOpen(true)}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setSelectedFrom(null);
                  setFromOpen(true);
                }}
                placeholder="City or Station Code (e.g. HWH, Howrah)"
                className="w-full pl-3.5 pr-8 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              {selectedFrom && (
                <div className="absolute right-3 top-3 text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                  {selectedFrom.code}
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {fromOpen && filteredFromStations.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50">
                {filteredFromStations.map((station) => (
                  <button
                    type="button"
                    key={station.id}
                    onClick={() => {
                      setSelectedFrom(station);
                      setFromQuery(`${station.name} (${station.code})`);
                      setFromOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-center justify-between border-b border-slate-100 last:border-0 transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{station.name}</div>
                      <div className="text-xs text-slate-500">
                        {station.city}, {station.state}
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {station.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-2 flex items-center justify-center -my-2 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              className={`p-2.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 shadow-sm transition-transform duration-300 ${
                rotateSwap ? 'rotate-180' : ''
              }`}
              title="Swap stations"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO STATION */}
          <div className="md:col-span-5 relative" ref={toRef}>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>To Station</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={toQuery}
                onFocus={() => setToOpen(true)}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setSelectedTo(null);
                  setToOpen(true);
                }}
                placeholder="City or Station Code (e.g. NDLS, New Delhi)"
                className="w-full pl-3.5 pr-8 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              {selectedTo && (
                <div className="absolute right-3 top-3 text-[10px] font-bold bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded">
                  {selectedTo.code}
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {toOpen && filteredToStations.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50">
                {filteredToStations.map((station) => (
                  <button
                    type="button"
                    key={station.id}
                    onClick={() => {
                      setSelectedTo(station);
                      setToQuery(`${station.name} (${station.code})`);
                      setToOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50/80 flex items-center justify-between border-b border-slate-100 last:border-0 transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{station.name}</div>
                      <div className="text-xs text-slate-500">
                        {station.city}, {station.state}
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {station.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECOND ROW: Date, Class, Passengers, Search button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 mt-4 items-end">
          {/* JOURNEY DATE */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Journey Date</span>
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {/* Quick date chips */}
            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded transition"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(2)}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded transition"
              >
                +2 Days
              </button>
            </div>
          </div>

          {/* CLASS SELECTOR */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-blue-600" />
              <span>Travel Class</span>
            </label>
            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {classesOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* PASSENGER COUNT */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Passengers</span>
            </label>
            <select
              value={passengersCount}
              onChange={(e) => setPassengersCount(parseInt(e.target.value, 10))}
              className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH BUTTON */}
          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Search Trains</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
