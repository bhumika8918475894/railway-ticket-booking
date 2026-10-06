import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { TrainSearchResult, PassengerInput, Booking, Seat } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { PassengerForm } from './PassengerForm.js';
import { PaymentModal } from './PaymentModal.js';
import { TicketView } from './TicketView.js';
import { SeatLayoutModal } from '../trains/SeatLayoutModal.js';
import {
  Train,
  CheckCircle2,
  Users,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Armchair,
  FileCheck2,
} from 'lucide-react';

interface BookingWizardProps {
  train: TrainSearchResult;
  initialClassCode: string;
  journeyDate: string;
  initialPassengerCount?: number;
  onBackToSearch: () => void;
  onViewMyBookings: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  train,
  initialClassCode,
  journeyDate,
  initialPassengerCount = 1,
  onBackToSearch,
  onViewMyBookings,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  // Booking Flow Steps:
  // Step 1: Review Selection & Choose Specific Seats (Optional visual picker)
  // Step 2: Passenger Details
  // Step 3: Journey Review & Fare Summary
  // Step 4: Payment (Handled via Modal)
  // Step 5: Confirmed Booking Ticket
  const [step, setStep] = useState<1 | 2 | 3 | 5>(1);
  const [selectedClass, setSelectedClass] = useState<string>(initialClassCode);

  const [passengers, setPassengers] = useState<PassengerInput[]>(() => {
    const list: PassengerInput[] = [];
    const count = Math.max(1, Math.min(initialPassengerCount, 6));
    for (let i = 0; i < count; i++) {
      list.push({
        fullName: i === 0 && user ? user.name : '',
        age: '',
        gender: 'Male',
        berthPreference: 'No Preference',
        nationality: 'Indian',
      });
    }
    return list;
  });

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedSeatLabels, setSelectedSeatLabels] = useState<string[]>([]);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const activeClassInfo = train.classes.find((c) => c.classCode === selectedClass) || train.classes[0];
  const ticketFarePerPassenger = activeClassInfo?.fare || 1000;
  const convenienceFee = 17.7;
  const totalAmount = ticketFarePerPassenger * passengers.length + convenienceFee;

  // Toggle seat selection from layout modal
  const handleSeatClick = (seat: Seat, coachCode: string) => {
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      setSelectedSeatLabels((prev) => prev.filter((l) => !l.startsWith(`${coachCode}-${seat.seatNumber}`)));
    } else {
      if (selectedSeatIds.length >= passengers.length) {
        showToast(`You have selected ${passengers.length} seat(s) for ${passengers.length} passenger(s). Remove one to choose another.`, 'info');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
      setSelectedSeatLabels((prev) => [...prev, `${coachCode}-${seat.seatNumber} (${seat.berthType})`]);
    }
  };

  // Step 2 -> Step 3 validation
  const validatePassengers = (): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName || p.fullName.trim().length < 2) {
        showToast(`Please enter valid full name for Passenger #${i + 1}`, 'error');
        return false;
      }
      const age = parseInt(String(p.age), 10);
      if (isNaN(age) || age < 1 || age > 120) {
        showToast(`Please enter a valid age (1-120) for Passenger #${i + 1}`, 'error');
        return false;
      }
    }
    return true;
  };

  const handleProceedToReview = () => {
    if (!validatePassengers()) return;
    setStep(3);
  };

  const handleOpenPayment = () => {
    if (!user) {
      showToast('Please sign in or register to complete your booking reservation', 'info');
      openAuthModal('login');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleExecutePayment = async (paymentMethod: string, shouldSucceed: boolean) => {
    if (!shouldSucceed) {
      showToast('Payment declined by simulated bank gateway. Please try another method or retry.', 'error');
      setIsPaymentModalOpen(false);
      return;
    }

    setProcessingBooking(true);
    try {
      const res = await api.createBooking({
        trainId: train.id,
        sourceStationId: train.sourceStation.id,
        destinationStationId: train.destinationStation.id,
        journeyDate,
        travelClass: selectedClass,
        passengers,
        paymentMethod,
        selectedSeatIds,
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setIsPaymentModalOpen(false);
        setStep(5);
        showToast('Ticket booked and confirmed successfully!', 'success');

        // Confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Booking transaction failed', 'error');
    } finally {
      setProcessingBooking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Progress Steps Header */}
      {step !== 5 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Train & Class', stepId: 1 },
              { num: 2, label: 'Passengers', stepId: 2 },
              { num: 3, label: 'Review & Pay', stepId: 3 },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition ${
                      step === s.stepId
                        ? 'bg-blue-600 text-white shadow-md'
                        : step > s.stepId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.stepId ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs mt-1 font-semibold ${
                      step === s.stepId ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition ${
                      step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Confirm Train & Select Class / Optional Seats */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {train.number} - {train.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {train.type} • Journey Date: <strong className="text-slate-800">{journeyDate}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToSearch}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Train</span>
              </button>
            </div>

            {/* Station Route Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Boarding Station</span>
                <span className="text-sm font-bold text-slate-900">{train.sourceStation.name}</span>
                <span className="text-xs text-slate-500 block font-mono">
                  {train.sourceStation.code} • Dep: {train.departureTime}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{train.durationHours} hrs</span>
                </span>
                <div className="w-24 h-0.5 bg-blue-300 mx-auto my-1" />
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Deboarding Station</span>
                <span className="text-sm font-bold text-slate-900">{train.destinationStation.name}</span>
                <span className="text-xs text-slate-500 block font-mono">
                  {train.destinationStation.code} • Arr: {train.arrivalTime}
                </span>
              </div>
            </div>

            {/* Travel Class Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirm Travel Class:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {train.classes.map((cls) => {
                  const isSelected = selectedClass === cls.classCode;
                  return (
                    <button
                      key={cls.classCode}
                      type="button"
                      onClick={() => setSelectedClass(cls.classCode)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-sm text-slate-900">
                        <span>{cls.classCode}</span>
                        <span>₹{cls.fare}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{cls.className.split('(')[0]}</div>
                      <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {cls.badgeText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Coach Seat Pre-selection Option */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-blue-600" />
                  <span>Interactive Berth Selection</span>
                </span>
                <p className="text-xs text-slate-500">
                  {selectedSeatIds.length > 0
                    ? `Selected ${selectedSeatIds.length} seat(s): ${selectedSeatLabels.join(', ')}`
                    : 'Optionally pick specific lower, window, or aisle berths on the visual coach map'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSeatModalOpen(true)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shrink-0"
              >
                {selectedSeatIds.length > 0 ? 'Edit Seat Selection' : 'Open Coach Seat Map'}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onBackToSearch}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Back to Search Results
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Passenger Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Passenger Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Passenger Information</h3>
                <p className="text-xs text-slate-500">
                  Provide identification details as requested by Indian Railways guidelines
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Class: {selectedClass}
              </span>
            </div>

            <PassengerForm
              passengers={passengers}
              onChange={setPassengers}
              savedPassengers={user?.savedPassengers}
              travelClass={selectedClass}
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleProceedToReview}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review Journey & Fare</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Journey Review & Fare Summary */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Journey & Passengers Review */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Review Journey Details
              </h3>

              {/* Train Banner */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">
                    {train.number} - {train.name}
                  </span>
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {selectedClass} Class
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  {train.sourceStation.name} ({train.sourceStation.code}) →{' '}
                  {train.destinationStation.name} ({train.destinationStation.code})
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Journey Date: <strong className="text-slate-800">{journeyDate}</strong> • Departure: {train.departureTime}
                </div>
              </div>

              {/* Passenger List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Passengers ({passengers.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">
                          {idx + 1}. {p.fullName}
                        </div>
                        <div className="text-slate-500">
                          Age: {p.age} • Gender: {p.gender} • Nationality: {p.nationality}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Pref: {p.berthPreference}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Passengers</span>
              </button>
            </div>
          </div>

          {/* Right: Fare Breakdown Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 sticky top-20">
              <h4 className="font-black text-slate-900 text-base">Payment Summary</h4>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between text-slate-600 pb-1.5">
                  <span>
                    Base Fare ({passengers.length} × ₹{ticketFarePerPassenger})
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    ₹{(ticketFarePerPassenger * passengers.length).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-2 pb-1.5">
                  <span>IRCTC Convenience Fee (GST Inc.)</span>
                  <span className="font-mono font-bold text-slate-800">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-2 pb-1.5">
                  <span>Travel Insurance (Complimentary)</span>
                  <span className="font-mono text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-3">
                  <span>Total Amount Payable</span>
                  <span className="font-mono text-blue-700">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulated zero-risk instant booking with automated PNR generation.</span>
              </div>

              <button
                type="button"
                onClick={handleOpenPayment}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Demo Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Booking Confirmed & E-Ticket View */}
      {step === 5 && confirmedBooking && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-emerald-950">Railway Booking Confirmed!</h2>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Your ticket has been booked on the live train inventory. 10-digit PNR{' '}
              <strong className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded shadow-xs">
                {confirmedBooking.pnr}
              </strong>{' '}
              is allocated.
            </p>
          </div>

          <TicketView
            booking={confirmedBooking}
            onDone={onViewMyBookings}
          />
        </div>
      )}

      {/* Visual Coach Seat Layout Modal */}
      <SeatLayoutModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        trainId={train.id}
        trainName={train.name}
        trainNumber={train.number}
        travelClass={selectedClass}
        selectedSeatIds={selectedSeatIds}
        onSelectSeat={handleSeatClick}
        maxSelectable={passengers.length}
      />

      {/* Demo Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onProcessPayment={handleExecutePayment}
        loading={processingBooking}
      />
    </div>
  );
};
