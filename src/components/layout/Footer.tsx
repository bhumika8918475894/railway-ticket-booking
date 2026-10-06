import React from 'react';
import { Train, ShieldCheck, Clock, Award, PhoneCall, HelpCircle, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-sm">
      {/* Features Bar */}
      <div className="border-b border-slate-900/80 bg-slate-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Official Prototype</h4>
              <p className="text-xs text-slate-400">Strict safety & database integrity</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Real-Time Allocation</h4>
              <p className="text-xs text-slate-400">Instant coach & berth confirmation</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Zero Fee Cancellation</h4>
              <p className="text-xs text-slate-400">Simulated instant demo refunds</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">24x7 Assistance</h4>
              <p className="text-xs text-slate-400">Toll-free demo helpline support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Rail<span className="text-cyan-400">Ease</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              RailEase is an original, next-generation Indian railway ticketing application providing seamless journey booking, live berth selection, and PNR tracking.
            </p>
            <div className="inline-block bg-blue-900/30 border border-blue-800/40 text-blue-300 text-[11px] px-2.5 py-1 rounded">
              Demo Educational Platform
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Railway Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-cyan-400 transition">
                  Book Train Tickets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pnr')} className="hover:text-cyan-400 transition">
                  10-Digit PNR Status
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bookings')} className="hover:text-cyan-400 transition">
                  Cancel Ticket & Refund
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-cyan-400 transition">
                  Tatkal Quota Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Major Train Zones */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Top Routes</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-300">Howrah ⇄ New Delhi</span> (Rajdhani)
              </li>
              <li>
                <span className="text-slate-300">New Delhi ⇄ Varanasi</span> (Vande Bharat)
              </li>
              <li>
                <span className="text-slate-300">Mumbai Central ⇄ New Delhi</span> (Rajdhani)
              </li>
              <li>
                <span className="text-slate-300">Chennai Central ⇄ New Delhi</span> (Tamil Nadu SF)
              </li>
              <li>
                <span className="text-slate-300">Pune ⇄ CSMT Mumbai</span> (Deccan Queen)
              </li>
            </ul>
          </div>

          {/* Support & Disclaimer */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Security & Compliance</h4>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              Designed as a professional demo showcasing modern railway software engineering. Real banking and payment gateways are not connected.
            </p>
            <button
              onClick={() => onNavigate('help')}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Read RailEase Help Center</span>
            </button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 RailEase Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Indian Railway Travelers
          </p>
        </div>
      </div>
    </footer>
  );
};
