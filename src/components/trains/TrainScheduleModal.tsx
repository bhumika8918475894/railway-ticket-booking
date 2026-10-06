import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { api } from '../../services/api.js';
import { TrainScheduleStop } from '../../types/index.js';
import { Train, Clock, MapPin, Milestone } from 'lucide-react';

interface TrainScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainId: string | null;
  trainName?: string;
  trainNumber?: string;
}

export const TrainScheduleModal: React.FC<TrainScheduleModalProps> = ({
  isOpen,
  onClose,
  trainId,
  trainName,
  trainNumber,
}) => {
  const [schedule, setSchedule] = useState<TrainScheduleStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainInfo, setTrainInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen && trainId) {
      setLoading(true);
      api
        .getTrainSchedule(trainId)
        .then((res) => {
          if (res.success) {
            setSchedule(res.schedule);
            setTrainInfo(res.train);
          }
        })
        .catch((err) => console.error('Failed to load schedule:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, trainId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-2">
          <Train className="w-5 h-5 text-blue-600" />
          <span>
            Route & Timetable: {trainNumber || trainInfo?.number} - {trainName || trainInfo?.name}
          </span>
        </div>
      }
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Fetching official timetable & route map...</p>
        </div>
      ) : schedule.length === 0 ? (
        <p className="py-8 text-center text-slate-500 text-sm">No route information available for this train.</p>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-center justify-between">
            <span className="font-semibold">
              Total Stops: {schedule.length} Stations
            </span>
            <span className="font-mono">
              Total Distance: {schedule[schedule.length - 1]?.distanceKm} km
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-3">Arr.</th>
                  <th className="py-2.5 px-3">Dep.</th>
                  <th className="py-2.5 px-3">Halt</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((stop, idx) => (
                  <tr
                    key={stop.stopNumber}
                    className={`hover:bg-blue-50/50 transition ${
                      idx === 0 || idx === schedule.length - 1 ? 'font-semibold bg-slate-50/70' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{stop.stopNumber}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{stop.stationName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {stop.stationCode} • {stop.city}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {stop.stopNumber === 1 ? 'Source' : stop.arrivalTime}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {idx === schedule.length - 1 ? 'Dest' : stop.departureTime}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {stop.haltMinutes > 0 ? `${stop.haltMinutes} min` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{stop.distanceKm} km</td>
                    <td className="py-2.5 px-3 text-slate-600">Day {stop.dayNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
};
