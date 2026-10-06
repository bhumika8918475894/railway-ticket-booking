import React from 'react';
import { HeroSearch } from '../components/home/HeroSearch.js';
import { QuickActions } from '../components/home/QuickActions.js';
import { PopularRoutes } from '../components/home/PopularRoutes.js';
import {
  Train,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

interface HomePageProps {
  onSearch: (params: any) => void;
  onNavigate: (tab: string, meta?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSearch, onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-12 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-blue-500/5 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Indian Railway Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Book Your Train Journey with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                RailEase
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Live seat availability, interactive coach layouts, instant 10-digit PNR tracking, and hassle-free cancellation.
            </p>
          </div>

          {/* Interactive Search Widget */}
          <div className="max-w-4xl mx-auto">
            <HeroSearch onSearch={onSearch} />
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Quick Railway Services</h2>
          <p className="text-xs text-slate-500">Fast access to key ticketing tools and status verification</p>
        </div>
        <QuickActions onNavigate={onNavigate} />
      </section>

      {/* POPULAR ROUTES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PopularRoutes
          onSelectRoute={(from, to) => {
            onSearch({ from, to, date: new Date().toISOString().split('T')[0], travelClass: 'ALL' });
          }}
        />
      </section>

      {/* WHY CHOOSE RAILEASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-3xl text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative blur ball */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full inline-block">
                Modern Passenger Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                Experience Hassle-Free Indian Rail Ticketing
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                RailEase replaces frustrating booking delays with ultra-responsive seat confirmation, transparent cancellation refund calculations, and real-time coach mapping.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Real-Time Live Seat Inventories',
                  'Interactive Visual Coach Maps',
                  'Instant 10-Digit PNR Tracking',
                  'Simulated Instant Refund Policy',
                  'Saved Passenger Fast-Fill',
                  'Direct Train Timetable Routes',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('search')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2"
                >
                  <Train className="w-4 h-4" />
                  <span>Start Searching Trains</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('pnr')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Check PNR Status</span>
                </button>
              </div>
            </div>

            {/* Right Card: Demo Platform Info */}
            <div className="lg:col-span-6 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Full-Stack Architecture
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  LIVE REST API
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 font-mono">
                <div className="flex justify-between p-2 rounded bg-slate-800/60">
                  <span className="text-slate-400">Backend Server:</span>
                  <span className="text-cyan-300">Node.js Express + TS</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-800/60">
                  <span className="text-slate-400">Database Layer:</span>
                  <span className="text-cyan-300">Prisma ORM (PostgreSQL/SQLite)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-800/60">
                  <span className="text-slate-400">Active Stations:</span>
                  <span className="text-cyan-300">20 Major Indian Railway Hubs</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-800/60">
                  <span className="text-slate-400">Active Trains:</span>
                  <span className="text-cyan-300">Rajdhani, Vande Bharat, Shatabdi</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Demo Prototype: Pre-seeded with Rohan Sharma's sample journey (PNR: 2456891024) and Admin credentials.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
