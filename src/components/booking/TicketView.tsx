import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Booking } from '../../types/index.js';
import { generateTicketPDF } from '../../utils/pdfGenerator.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Train,
  CheckCircle2,
  Printer,
  FileDown,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Share2,
  Check,
} from 'lucide-react';

interface TicketViewProps {
  booking: Booking;
  onCancel?: () => void;
  onDone?: () => void;
}

export const TicketView: React.FC<TicketViewProps> = ({ booking, onCancel, onDone }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    // Generate real scannable QR Code image with complete ticket details
    const payload = JSON.stringify({
      app: 'RailEase Indian Railways',
      pnr: booking.pnr,
      bookingRef: booking.bookingReference,
      train: `${booking.train.number} ${booking.train.name}`,
      class: booking.travelClass,
      date: booking.journeyDate,
      from: `${booking.sourceStation.name} (${booking.sourceStation.code})`,
      to: `${booking.destinationStation.name} (${booking.destinationStation.code})`,
      passengers: booking.passengers.map((p) => `${p.passengerName} (Coach ${p.coachCode}-${p.seatNumber}, ${p.berthType})`),
      fare: `₹${booking.totalFare.toFixed(2)}`,
      status: booking.status,
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate ticket QR code:', err));
  }, [booking]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      showToast('Generating official RailEase E-Ticket (PDF)...', 'info');
      await generateTicketPDF(booking);
      showToast('PDF Ticket downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      showToast('Failed to generate PDF. You can also use the Print button to Save as PDF.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Action buttons (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isCancelled
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isCancelled ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{isCancelled ? 'TICKET CANCELLED' : 'BOOKING CONFIRMED'}</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">Ref: {booking.bookingReference}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket</span>
          </button>
          <button
            type="button"
            disabled={downloadingPdf}
            onClick={handleDownloadPDF}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {downloadingPdf ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF Ticket'}</span>
          </button>
          {!isCancelled && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Cancel Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Railway Electronic Reservation Slip (ERS) Printable Card */}
      <div
        ref={ticketRef}
        className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl overflow-hidden print:border-none print:shadow-none print:m-0"
      >
        {/* Ticket Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                <Train className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight">RailEase</span>
                  <span className="text-[10px] bg-blue-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded font-bold uppercase">
                    E-Ticket
                  </span>
                </div>
                <p className="text-xs text-slate-400">Electronic Reservation Slip (ERS)</p>
              </div>
            </div>

            {/* PNR Banner */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl px-5 py-3 text-left sm:text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">PNR NUMBER</div>
              <div className="text-2xl font-black font-mono tracking-widest text-cyan-400">{booking.pnr}</div>
            </div>
          </div>
        </div>

        {/* Train & Journey Bar */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Train Details</div>
                <div className="text-lg font-black text-slate-900">
                  {booking.train.number} - {booking.train.name}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Class: <strong className="text-blue-700">{booking.travelClass}</strong> • Quota: General (GN)
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Journey Date</div>
                <div className="text-base font-bold text-slate-900 font-mono">{booking.journeyDate}</div>
                <div className="text-xs text-emerald-700 font-semibold">
                  Status: {booking.status}
                </div>
              </div>
            </div>

            {/* Route & Times */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Departure From
                </span>
                <span className="text-base font-bold text-slate-900">{booking.sourceStation.name}</span>
                <span className="text-xs text-slate-500 font-mono block">
                  ({booking.sourceStation.code}) • Dep: {booking.train.departureTime}
                </span>
              </div>

              <div className="text-center sm:border-x border-slate-200 px-2 py-1">
                <span className="text-[11px] text-slate-500 font-semibold">Scheduled Non-Stop Transit</span>
                <div className="w-full h-0.5 bg-blue-300 relative my-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 absolute right-1/2 -top-0.75" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Rail Corridors India</span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Arrival At
                </span>
                <span className="text-base font-bold text-slate-900">{booking.destinationStation.name}</span>
                <span className="text-xs text-slate-500 font-mono block">
                  ({booking.destinationStation.code}) • Arr: {booking.train.arrivalTime}
                </span>
              </div>
            </div>
          </div>

          {/* Passengers Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Passenger Reservation Details
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Passenger Name</th>
                    <th className="py-2.5 px-3">Age / Sex</th>
                    <th className="py-2.5 px-3">Coach</th>
                    <th className="py-2.5 px-3">Berth / Seat</th>
                    <th className="py-2.5 px-3">Berth Type</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.passengers.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50 font-medium">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.passengerName}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {p.age} / {p.gender[0]}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {isCancelled ? '-' : p.coachCode}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {isCancelled ? '-' : p.seatNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {isCancelled ? '-' : p.berthType}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isCancelled ? 'CANCELLED' : p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Cancellation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Payment Breakdown
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Ticket Fare:</span>
                <span className="font-mono">₹{(booking.totalFare - 17.7).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IRCTC Convenience Fee:</span>
                <span className="font-mono">₹17.70</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-blue-700">₹{booking.totalFare.toFixed(2)}</span>
              </div>
              {booking.payment && (
                <div className="text-[10px] text-slate-400 pt-1 font-mono">
                  TXN ID: {booking.payment.transactionId} • Method: {booking.payment.paymentMethod}
                </div>
              )}
            </div>

            {/* Live Verification QR Code & Instructions */}
            <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Scannable Verification QR</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Point any phone camera or QR reader to instantly view PNR, train timings, and passenger berth allocation.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Booked on {new Date(booking.createdAt).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`PNR ${booking.pnr} QR Code`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Scan PNR
                </span>
              </div>
            </div>
          </div>

          {isCancelled && booking.cancellationRefund !== undefined && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900">
              <div className="font-bold text-sm mb-1">Cancellation & Refund Record:</div>
              <div>Refund Amount: <strong>₹{booking.cancellationRefund}</strong></div>
              <div>Reason: {booking.cancellationReason || 'Requested by passenger'}</div>
              <div>Demo Refund Status: Credited back to original payment method within 3-5 business days.</div>
            </div>
          )}
        </div>
      </div>

      {onDone && (
        <div className="flex justify-center print:hidden">
          <button
            type="button"
            onClick={onDone}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow transition"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
