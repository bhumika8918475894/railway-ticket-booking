import React from 'react';
import { Search, FileCheck2, Ticket, CalendarClock, ShieldCheck, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const actions = [
    {
      id: 'search',
      title: 'Search Trains',
      desc: 'Live berths, schedules & seat availability',
      icon: Search,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Real-time',
    },
    {
      id: 'pnr',
      title: 'PNR Status',
      desc: 'Track 10-digit live booking confirmation',
      icon: FileCheck2,
      color: 'from-cyan-600 to-blue-600',
      badge: 'Instant',
    },
    {
      id: 'bookings',
      title: 'My Tickets',
      desc: 'View, print, download & cancel tickets',
      icon: Ticket,
      color: 'from-violet-600 to-purple-600',
      badge: 'Dashboard',
    },
    {
      id: 'schedule',
      title: 'Train Schedule',
      desc: 'Intermediate halts, route km & station maps',
      icon: CalendarClock,
      color: 'from-amber-600 to-orange-600',
      badge: 'Timetable',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={() => {
              if (act.id === 'schedule') {
                onNavigate('search');
              } else {
                onNavigate(act.id);
              }
            }}
            className="group relative text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${act.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {act.badge}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                {act.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{act.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Access Service</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
};
