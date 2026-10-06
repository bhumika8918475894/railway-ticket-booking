import React, { useState } from 'react';
import { Modal } from '../common/Modal.js';
import {
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onProcessPayment: (method: string, shouldSucceed: boolean) => Promise<void>;
  loading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onProcessPayment,
  loading,
}) => {
  const [method, setMethod] = useState<'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'NET_BANKING'>('UPI');
  const [simulateSuccess, setSimulateSuccess] = useState(true);

  // Form mock inputs
  const [upiId, setUpiId] = useState('passenger@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [cardName, setCardName] = useState('Rohan Sharma');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcessPayment(method, simulateSuccess);
  };

  const banks = [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank (PNB)',
    'Bank of Baroda',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>RailEase Secure Payment Gateway (Demo)</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prominent Demo Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">DEMO PAYMENT NOTICE:</strong> No real bank cards or accounts are charged. All transactions simulate real-world Indian Railway banking protocols.
          </div>
        </div>

        {/* Amount bar */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Amount Payable</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Encryption: 256-bit TLS</span>
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1 justify-end">
              <Lock className="w-3 h-3" /> RailEase Pay Verified
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Payment Method:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'UPI', label: 'UPI / QR', icon: QrCode },
              { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
              { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
              { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = method === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setMethod(tab.id as any)}
                  className={`p-2.5 rounded-xl text-center border transition flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Method Detail Inputs */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          {method === 'UPI' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Virtual Payment Address (UPI ID)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {['@okhdfcbank', '@okaxis', '@ybl', '@paytm'].map((handle) => (
                  <button
                    type="button"
                    key={handle}
                    onClick={() => setUpiId(`traveler${handle}`)}
                    className="px-2 py-0.5 text-[11px] bg-white border border-slate-200 rounded text-slate-600 hover:text-blue-600 font-mono transition"
                  >
                    {handle}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Supported apps: Google Pay, PhonePe, Paytm, BHIM, CRED UPI.
              </div>
            </div>
          )}

          {(method === 'DEBIT_CARD' || method === 'CREDIT_CARD') && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4532 0000 0000 8892"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Cardholder Name"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {method === 'NET_BANKING' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Demo Simulation Switch */}
        <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Test Simulation Result:</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSimulateSuccess(true)}
              className={`px-2.5 py-1 rounded font-bold transition ${
                simulateSuccess
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              Simulate Success
            </button>
            <button
              type="button"
              onClick={() => setSimulateSuccess(false)}
              className={`px-2.5 py-1 rounded font-bold transition ${
                !simulateSuccess
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              Simulate Failure
            </button>
          </div>
        </div>

        {/* Pay Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
            simulateSuccess
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
          }`}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {simulateSuccess
                  ? `Authorize Payment of ₹${totalAmount.toFixed(2)}`
                  : `Trigger Failed Payment Simulation`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};
