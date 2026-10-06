import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import { Booking } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { AlertCircle, IndianRupee, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CancelTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onCancelled: (updatedBooking: Booking) => void;
}

export const CancelTicketModal: React.FC<CancelTicketModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCancelled,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('Change of travel plan');
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  // Approximate refund calculation
  const totalFare = booking.totalFare;
  const numPassengers = booking.passengers.length;
  const cancellationFee = Math.min(totalFare * 0.15, 240 * numPassengers);
  const refundAmount = Math.max(0, Math.round(totalFare - cancellationFee));

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const res = await api.cancelBooking(booking.id, reason);
      if (res.success) {
        showToast('Ticket cancelled successfully. Demo refund initiated!', 'success');
        onCancelled(res.booking);
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <ShieldAlert className="w-5 h-5" />
          <span>Confirm Ticket Cancellation</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Ticket Header Brief */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
            <span>PNR: {booking.pnr}</span>
            <span className="font-mono text-blue-700">{booking.train.number} - {booking.train.name}</span>
          </div>
          <div className="text-slate-500">
            Journey: {booking.sourceStation.name} → {booking.destinationStation.name} on {booking.journeyDate}
          </div>
          <div className="text-slate-600 mt-1">
            Passengers: {booking.passengers.map((p) => p.passengerName).join(', ')}
          </div>
        </div>

        {/* Cancellation Policy & Refund Breakdown */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs space-y-2">
          <div className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>RailEase Cancellation & Refund Policy</span>
          </div>

          <div className="divide-y divide-rose-200/60 pt-1 space-y-1.5 text-slate-700">
            <div className="flex justify-between pt-1">
              <span>Total Booking Fare:</span>
              <span className="font-mono font-bold">₹{totalFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 text-rose-700">
              <span>Cancellation Deductions (Policy):</span>
              <span className="font-mono font-bold">-₹{cancellationFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 text-emerald-800 font-extrabold text-sm">
              <span>Estimated Refund Amount:</span>
              <span className="font-mono">₹{refundAmount.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-1">
            * Refund will be processed back to the original payment source within 3-5 banking business days (Simulated).
          </p>
        </div>

        {/* Reason selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Reason for Cancellation
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Change of travel plan">Change of travel plan</option>
            <option value="Personal / Medical emergency">Personal / Medical emergency</option>
            <option value="Booked alternate train or flight">Booked alternate train or flight</option>
            <option value="Mistake in passenger details">Mistake in passenger details</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Keep Ticket
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmCancel}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Confirm & Cancel Ticket</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
