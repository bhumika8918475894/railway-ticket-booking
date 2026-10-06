import React, { useState } from 'react';
import { TrainSearchResult, TrainClassInfo } from '../../types/index.js';
import { Train, Clock, ArrowRight, Calendar, Armchair, ChevronRight } from 'lucide-react';

interface TrainCardProps {
  train: TrainSearchResult;
  selectedClassCode?: string;
  onSelectClass?: (train: TrainSearchResult, classCode: string) => void;
  onBookNow: (train: TrainSearchResult, classCode: string) => void;
  onViewSchedule: (train: TrainSearchResult) => void;
  onViewSeats: (train: TrainSearchResult, classCode: string) => void;
}

export const TrainCard: React.FC<TrainCardProps> = ({
  train,
  selectedClassCode,
  onSelectClass,
  onBookNow,
  onViewSchedule,
  onViewSeats,
}) => {
  // Local active class fallback to first available or selected
  const [activeClassCode, setActiveClassCode] = useState<string>(
    selectedClassCode || train.classes[0]?.classCode || '3A'
  );

  const activeClass = train.classes.find((c) => c.classCode === activeClassCode) || train.classes[0];

  const handleClassClick = (cls: TrainClassInfo) => {
    setActiveClassCode(cls.classCode);
    if (onSelectClass) onSelectClass(train, cls.classCode);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Top Banner: Train Name, Number, Type */}
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">{train.name}</span>
              <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                #{train.number}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Type: <strong className="text-slate-700">{train.type}</strong> • Runs on:{' '}
              <span className="font-medium text-slate-600">{train.runsOnDays}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewSchedule(train)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 transition"
          >
            View Timetable
          </button>
        </div>
      </div>

      {/* Train Schedule Timings Banner */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Departure */}
          <div className="md:col-span-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {train.departureTime}
            </div>
            <div className="text-xs font-bold text-slate-800">{train.sourceStation.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">({train.sourceStation.code})</div>
          </div>

          {/* Duration line */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{Math.floor(train.durationHours)}h {Math.round((train.durationHours % 1) * 60)}m</span>
            </span>
            <div className="w-full max-w-[140px] flex items-center my-1.5">
              <div className="w-2 h-2 rounded-full border-2 border-blue-600 bg-white" />
              <div className="h-0.5 flex-1 bg-slate-200 relative">
                <div className="absolute inset-0 bg-blue-500/40" />
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <span className="text-[10px] text-slate-400">Direct Express Corridor</span>
          </div>

          {/* Arrival */}
          <div className="md:col-span-3 text-left md:text-right">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {train.arrivalTime}
            </div>
            <div className="text-xs font-bold text-slate-800">{train.destinationStation.name}</div>
            <div className="text-[11px] text-slate-500 font-mono">({train.destinationStation.code})</div>
          </div>

          {/* Min Fare Preview */}
          <div className="md:col-span-3 text-left md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
            <span className="text-[11px] text-slate-400 block">Current Fare</span>
            <span className="text-2xl font-black text-blue-700">₹{activeClass?.fare || train.minFare}</span>
            <span className="text-[10px] text-slate-400 block">per passenger</span>
          </div>
        </div>

        {/* Classes Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Select Travel Class:</span>
            <span className="text-[11px] font-normal text-slate-500">Click a class to view berths</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {train.classes.map((cls) => {
              const isSelected = activeClassCode === cls.classCode;
              return (
                <button
                  key={cls.classCode}
                  type="button"
                  onClick={() => handleClassClick(cls)}
                  className={`p-3 rounded-xl text-left border transition relative cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-slate-900">{cls.classCode}</span>
                    <span className="text-xs font-bold text-slate-700">₹{cls.fare}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mb-1.5">{cls.className.split('(')[0]}</div>

                  {/* Availability Badge */}
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        cls.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cls.status === 'RAC'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cls.badgeText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewSeats(train, activeClassCode)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Armchair className="w-3.5 h-3.5 text-blue-600" />
              <span>View Coach & Seats</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBookNow(train, activeClassCode)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Book Class {activeClassCode}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
