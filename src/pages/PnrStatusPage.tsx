import React, { useState, useEffect } from 'react';
import { PnrStatusData } from '../types/index.js';
import { api } from '../services/api.js';
import {
  FileCheck2,
  Search,
  Train,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface PnrStatusPageProps {
  initialPnr?: string;
  onNavigate?: (tab: string, meta?: any) => void;
}

export const PnrStatusPage: React.FC<PnrStatusPageProps> = ({ initialPnr, onNavigate }) => {
  const [pnrInput, setPnrInput] = useState(initialPnr || '');
  const [loading, setLoading] = useState(false);
  const [pnrData, setPnrData] = useState<PnrStatusData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPnr = async (numberToLookup: string) => {
    if (!numberToLookup || numberToLookup.trim().length === 0) {
      setErrorMsg('Please enter a 10-digit Indian Railway PNR number');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.checkPnr(numberToLookup.trim());
      if (res.success && res.pnrInfo) {
        setPnrData(res.pnrInfo);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'PNR not found. Please check the 10-digit number.');
      setPnrData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPnr) {
      fetchPnr(initialPnr);
    }
  }, [initialPnr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPnr(pnrInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-Time PNR Enquiry</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Track Your Indian Railway PNR Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Get real-time confirmation status, assigned coach numbers, and berth allocations.
        </p>
      </div>

      {/* PNR Search Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={10}
              required
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-Digit PNR Number (e.g. 2456891024)"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-base font-mono font-bold text-slate-900 tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Check PNR Status</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick PNR Prefill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Try Seeded Demo PNR:
          </span>
          <button
            type="button"
            onClick={() => {
              setPnrInput('2456891024');
              fetchPnr('2456891024');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg font-mono font-bold transition"
          >
            2456891024 (Rohan Sharma)
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">PNR Lookup Unsuccessful</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* PNR Response Card */}
      {pnrData && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-xl overflow-hidden space-y-6">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                10-Digit PNR
              </div>
              <div className="text-3xl font-black font-mono tracking-widest text-cyan-400">
                {pnrData.pnr}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">
                Ref: {pnrData.bookingReference}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  pnrData.bookingStatus === 'CONFIRMED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : pnrData.bookingStatus === 'CANCELLED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {pnrData.bookingStatus}
              </span>
              <div className="text-xs text-slate-400 mt-1">Class: {pnrData.travelClass}</div>
            </div>
          </div>

          {/* Train & Journey details */}
          <div className="px-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <div className="text-sm font-black text-slate-900">
                    {pnrData.trainNumber} - {pnrData.trainName}
                  </div>
                  <div className="text-xs text-slate-500">
                    Type: {pnrData.trainType} • Date: <strong className="text-slate-800">{pnrData.journeyDate}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 font-mono">
                    Total Fare: ₹{pnrData.totalFare}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">FROM STATION</span>
                  <span className="text-sm font-bold text-slate-900">{pnrData.fromStation.name}</span>
                  <span className="text-slate-500 block font-mono">
                    ({pnrData.fromStation.code}) • Dep: {pnrData.departureTime}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-slate-400 block font-semibold">TO STATION</span>
                  <span className="text-sm font-bold text-slate-900">{pnrData.toStation.name}</span>
                  <span className="text-slate-500 block font-mono">
                    ({pnrData.toStation.code}) • Arr: {pnrData.arrivalTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger Status Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Passenger Live Berth Status
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Passenger</th>
                      <th className="py-2.5 px-3">Age / Sex</th>
                      <th className="py-2.5 px-3">Booking Status</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3">Coach</th>
                      <th className="py-2.5 px-3">Berth / Seat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {pnrData.passengers.map((p) => (
                      <tr key={p.number} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{p.number}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {p.age} / {p.gender[0]}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.bookingStatus}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{p.currentStatus}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.coach}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.berth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {pnrData.cancellationRefund !== undefined && pnrData.cancellationRefund !== null && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
                Ticket was cancelled. Demo refund amount: <strong>₹{pnrData.cancellationRefund}</strong>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-200 p-4 text-center">
            <span className="text-xs text-slate-500">
              Chart preparation typically occurs 4 hours prior to train departure at the originating station.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
