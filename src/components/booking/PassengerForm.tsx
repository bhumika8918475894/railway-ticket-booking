import React from 'react';
import { PassengerInput, SavedPassenger } from '../../types/index.js';
import { User, Plus, Trash2, Bookmark, Check } from 'lucide-react';

interface PassengerFormProps {
  passengers: PassengerInput[];
  onChange: (passengers: PassengerInput[]) => void;
  savedPassengers?: SavedPassenger[];
  travelClass: string;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  passengers,
  onChange,
  savedPassengers = [],
  travelClass,
}) => {
  const isChairCar = ['CC', 'EC', '2S'].includes(travelClass);

  const berthOptions = isChairCar
    ? ['No Preference', 'Window', 'Aisle']
    : ['No Preference', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];

  const handleFieldChange = (index: number, field: keyof PassengerInput, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addPassenger = () => {
    if (passengers.length >= 6) return;
    onChange([
      ...passengers,
      {
        fullName: '',
        age: '',
        gender: 'Male',
        berthPreference: 'No Preference',
        nationality: 'Indian',
      },
    ]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    const updated = passengers.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleAddFromSaved = (saved: SavedPassenger) => {
    // If first passenger is empty placeholder, replace it
    if (passengers.length === 1 && !passengers[0].fullName) {
      onChange([
        {
          fullName: saved.fullName,
          age: saved.age,
          gender: saved.gender,
          berthPreference: saved.berthPreference || 'No Preference',
          nationality: saved.nationality || 'Indian',
        },
      ]);
      return;
    }

    if (passengers.length < 6) {
      onChange([
        ...passengers,
        {
          fullName: saved.fullName,
          age: saved.age,
          gender: saved.gender,
          berthPreference: saved.berthPreference || 'No Preference',
          nationality: saved.nationality || 'Indian',
        },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Saved Passengers Bar */}
      {savedPassengers.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4">
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick-Add Saved Passengers:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPassengers.map((saved) => {
              const isAlreadyAdded = passengers.some((p) => p.fullName === saved.fullName);
              return (
                <button
                  type="button"
                  key={saved.id}
                  disabled={isAlreadyAdded || passengers.length >= 6}
                  onClick={() => handleAddFromSaved(saved)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                    isAlreadyAdded
                      ? 'bg-blue-200/50 text-blue-800 border-blue-300 opacity-70 cursor-default'
                      : 'bg-white hover:bg-blue-100/60 text-slate-800 border-blue-200 shadow-sm cursor-pointer'
                  }`}
                >
                  <span>
                    {saved.fullName} ({saved.age}, {saved.gender[0]})
                  </span>
                  {isAlreadyAdded ? <Check className="w-3 h-3 text-blue-700" /> : <Plus className="w-3 h-3 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Passengers List */}
      <div className="space-y-4">
        {passengers.map((p, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Passenger #{idx + 1}</span>
              </span>

              {passengers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(idx)}
                  className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Full Name */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={p.fullName}
                  onChange={(e) => handleFieldChange(idx, 'fullName', e.target.value)}
                  placeholder="As on Government ID"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Age */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={p.age}
                  onChange={(e) => handleFieldChange(idx, 'age', e.target.value)}
                  placeholder="Years"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Gender */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={p.gender}
                  onChange={(e) => handleFieldChange(idx, 'gender', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              {/* Berth Preference */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Berth Preference
                </label>
                <select
                  value={p.berthPreference}
                  onChange={(e) => handleFieldChange(idx, 'berthPreference', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {berthOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add passenger button */}
      {passengers.length < 6 && (
        <button
          type="button"
          onClick={addPassenger}
          className="w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 rounded-2xl text-xs font-bold text-blue-700 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Passenger (Max 6)</span>
        </button>
      )}
    </div>
  );
};
