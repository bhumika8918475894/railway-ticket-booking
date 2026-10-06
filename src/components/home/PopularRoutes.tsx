import React from 'react';
import { ArrowRight, Clock, Train, ShieldCheck, Zap } from 'lucide-react';

interface PopularRoutesProps {
  onSelectRoute: (from: string, to: string) => void;
}

export const PopularRoutes: React.FC<PopularRoutesProps> = ({ onSelectRoute }) => {
  const routes = [
    {
      fromCode: 'HWH',
      fromCity: 'Howrah, Kolkata',
      toCode: 'NDLS',
      toCity: 'New Delhi',
      trainName: 'Howrah Rajdhani Express',
      trainNo: '12301',
      type: 'Rajdhani',
      duration: '17h 15m',
      startingFare: 1850,
      highlight: 'High Speed & Meals Included',
      badge: 'Premier',
    },
    {
      fromCode: 'NDLS',
      fromCity: 'New Delhi',
      toCode: 'BSB',
      toCity: 'Varanasi Cantt',
      trainName: 'Vande Bharat Express',
      trainNo: '22436',
      type: 'Vande Bharat',
      duration: '8h 00m',
      startingFare: 1450,
      highlight: 'Semi-High Speed 160 km/h',
      badge: 'Vande Bharat',
    },
    {
      fromCode: 'MMCT',
      fromCity: 'Mumbai Central',
      toCode: 'NDLS',
      toCity: 'New Delhi',
      trainName: 'Mumbai Rajdhani Express',
      trainNo: '12951',
      type: 'Rajdhani',
      duration: '15h 32m',
      startingFare: 1950,
      highlight: 'Overnight Executive Flagship',
      badge: 'Popular',
    },
    {
      fromCode: 'PUNE',
      fromCity: 'Pune Junction',
      toCode: 'CSMT',
      toCity: 'Mumbai CSMT',
      trainName: 'Deccan Queen Superfast',
      trainNo: '12124',
      type: 'Superfast',
      duration: '3h 10m',
      startingFare: 380,
      highlight: 'Scenic Western Ghats Route',
      badge: 'Commuter',
    },
    {
      fromCode: 'MAS',
      fromCity: 'Chennai Central',
      toCode: 'NDLS',
      toCity: 'New Delhi',
      trainName: 'Tamil Nadu Express',
      trainNo: '12621',
      type: 'Superfast',
      duration: '32h 30m',
      startingFare: 840,
      highlight: 'Grand Trunk Corridor',
      badge: 'Long Distance',
    },
    {
      fromCode: 'MMCT',
      fromCity: 'Mumbai Central',
      toCode: 'ADI',
      toCity: 'Ahmedabad Jn',
      trainName: 'Mumbai Ahmedabad Shatabdi',
      trainNo: '12009',
      type: 'Shatabdi',
      duration: '6h 25m',
      startingFare: 980,
      highlight: 'Morning Business Express',
      badge: 'Shatabdi',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Train className="w-6 h-6 text-blue-600" />
            <span>Popular Indian Railway Routes</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Book top-rated Rajdhani, Vande Bharat, and Superfast express trains in one click
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    route.type === 'Vande Bharat'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : route.type === 'Rajdhani'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {route.type}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">#{route.trainNo}</span>
              </div>

              <h4 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors">
                {route.trainName}
              </h4>

              {/* Station segment */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-sm">{route.fromCode}</div>
                    <div className="text-[11px] text-slate-500">{route.fromCity}</div>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {route.duration}
                    </span>
                    <div className="w-16 h-0.5 bg-blue-300 relative my-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-0 -top-0.5" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono text-sm">{route.toCode}</div>
                    <div className="text-[11px] text-slate-500">{route.toCity}</div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{route.highlight}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Starting from</span>
                <span className="text-base font-extrabold text-blue-700">₹{route.startingFare}</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectRoute(route.fromCode, route.toCode)}
                className="px-3.5 py-1.5 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
