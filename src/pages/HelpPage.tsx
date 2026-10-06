import React, { useState } from 'react';
import {
  HelpCircle,
  Clock,
  ShieldAlert,
  ChevronDown,
  PhoneCall,
  Mail,
  FileText,
  AlertCircle,
  Train,
  CheckCircle2,
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the Indian Railways Tatkal quota booking timing?',
      a: 'Tatkal bookings open at 10:00 AM IST for AC classes (1A, 2A, 3A, CC, EC) and at 11:00 AM IST for Non-AC classes (SL, 2S), one day in advance of the actual train departure date from the originating station.',
    },
    {
      q: 'What is the ticket cancellation fee and refund structure?',
      a: 'If a confirmed ticket is cancelled more than 48 hours before scheduled departure, flat cancellation charges apply (₹240 for 1A/EC, ₹200 for 2A, ₹180 for 3A/CC, ₹120 for Sleeper). Between 48 hours and 12 hours, 25% of the fare is deducted. Between 12 hours and 4 hours, 50% is deducted. After chart preparation, no refund is granted on confirmed tickets.',
    },
    {
      q: 'What is the difference between RAC and Waiting List (WL)?',
      a: 'RAC (Reservation Against Cancellation) guarantees that you have boarding permission on the train and will be allocated a sitting berth (shared lower berth in sleeper/3A). If any confirmed passenger cancels, your RAC berth upgrades automatically to CNF. Waiting List (WL) passengers cannot board reserved coaches unless their ticket reaches RAC or CNF before chart preparation.',
    },
    {
      q: 'Which identity cards are acceptable for train travel in India?',
      a: 'Passengers must carry an original valid photo identity card such as: Aadhaar Card, Voter Identity Card, Passport, Driving License, Student ID issued by recognized institution, Nationalized Bank Passbook with photo, or Government Employee ID.',
    },
    {
      q: 'Is RailEase a real IRCTC booking agent or a simulation?',
      a: 'RailEase is an original, production-architecture educational demo web platform showcasing full-stack railway engineering with live Express/Prisma databases, realistic Indian Railway timetables, coach berth layouts, and simulated payments without charging real money.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>Support & Guidelines</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          RailEase Help Center & Railway FAQs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Common queries regarding Indian Railway ticket bookings, Tatkal timings, berth quotas, and cancellations.
        </p>
      </div>

      {/* Support Helpline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Railway Helpline</h4>
          <p className="text-xs text-slate-500 font-mono font-bold text-blue-700">Dial 139 (Toll Free)</p>
          <span className="text-[10px] text-slate-400 block">24x7 Customer Assistance</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Customer Care Email</h4>
          <p className="text-xs text-slate-500 font-mono text-slate-700">support@railease.in</p>
          <span className="text-[10px] text-slate-400 block">Typical response within 2 hours</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Booking Hours</h4>
          <p className="text-xs text-slate-500 font-mono font-bold text-slate-800">00:20 - 23:45 IST</p>
          <span className="text-[10px] text-slate-400 block">Daily 35m server maintenance</span>
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition gap-3"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Demo Guidelines Note */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">RailEase Prototype Disclaimer:</span>
          <p className="text-slate-600">
            This platform uses realistic demo stations, timings, and coach data. It is not connected to CRIS/IRCTC servers and does not issue valid Indian Railways journey tickets for real trains.
          </p>
        </div>
      </div>
    </div>
  );
};
