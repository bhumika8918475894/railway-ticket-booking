import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Coach, Seat } from '../../types/index.js';
import { api } from '../../services/api.js';
import { Train, Check, Info, Armchair } from 'lucide-react';

interface SeatLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainId: string | null;
  trainName?: string;
  trainNumber?: string;
  travelClass?: string;
  selectedSeatIds: string[];
  onSelectSeat?: (seat: Seat, coachCode: string) => void;
  maxSelectable?: number;
}

export const SeatLayoutModal: React.FC<SeatLayoutModalProps> = ({
  isOpen,
  onClose,
  trainId,
  trainName,
  trainNumber,
  travelClass,
  selectedSeatIds,
  onSelectSeat,
  maxSelectable = 1,
}) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCoachIndex, setActiveCoachIndex] = useState(0);

  useEffect(() => {
    if (isOpen && trainId) {
      setLoading(true);
      api
        .getTrainSeats(trainId, travelClass && travelClass !== 'ALL' ? travelClass : undefined)
        .then((res) => {
          if (res.success && res.coaches) {
            setCoaches(res.coaches);
            setActiveCoachIndex(0);
          }
        })
        .catch((err) => console.error('Failed to load coach seats:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, trainId, travelClass]);

  const currentCoach = coaches[activeCoachIndex];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={
        <div className="flex items-center gap-2">
          <Armchair className="w-5 h-5 text-blue-600" />
          <span>
            Coach & Berth Layout: #{trainNumber} {trainName}
          </span>
        </div>
      }
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Generating coach seating configuration...</p>
        </div>
      ) : coaches.length === 0 ? (
        <p className="py-8 text-center text-slate-500 text-sm">No coaches found for this class.</p>
      ) : (
        <div className="space-y-4">
          {/* Coach Tab Selectors */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <span className="text-xs font-semibold text-slate-500 mr-1">Select Coach:</span>
            {coaches.map((c, idx) => {
              const availableInCoach = c.seats.filter((s) => s.isAvailable).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCoachIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    activeCoachIndex === idx
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.coachCode} ({c.coachType})</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeCoachIndex === idx
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {availableInCoach} left
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-400" />
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-blue-600 border border-blue-700" />
                <span className="text-slate-600">Selected ({selectedSeatIds.length}/{maxSelectable})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
                <span className="text-slate-400">Booked / Reserved</span>
              </div>
            </div>
            <div className="text-slate-500 text-[11px] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>Click available seats to select for your journey</span>
            </div>
          </div>

          {/* Coach Cabin / Compartment Layout */}
          {currentCoach && (
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between px-2">
                <span>← Coach Entry & Restroom</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-800">
                  {currentCoach.coachCode} ({currentCoach.coachType})
                </span>
                <span>Inter-Coach Vestibule →</span>
              </div>

              {/* Grid of seats */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[420px] overflow-y-auto p-2">
                {currentCoach.seats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isAvailable = seat.isAvailable;

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onSelectSeat && onSelectSeat(seat, currentCoach.coachCode)}
                      className={`relative p-2 rounded-xl flex flex-col items-center justify-center transition border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                          : isAvailable
                          ? 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-400 shadow-sm cursor-pointer'
                          : 'bg-slate-200/80 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{seat.seatNumber}</div>
                      <div
                        className={`text-[9px] font-medium leading-tight truncate max-w-full ${
                          isSelected ? 'text-blue-100' : isAvailable ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {seat.berthType}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-white text-blue-600 rounded-full p-0.5 shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Done Selecting
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
