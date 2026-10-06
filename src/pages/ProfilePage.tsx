import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Plus,
  Trash2,
  Bookmark,
  Calendar,
  Save,
  Ticket,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // New saved passenger form
  const [showAddPassenger, setShowAddPassenger] = useState(false);
  const [passName, setPassName] = useState('');
  const [passAge, setPassAge] = useState('');
  const [passGender, setPassGender] = useState('Male');
  const [passBerth, setPassBerth] = useState('Lower');
  const [addingPassenger, setAddingPassenger] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({ name, phone });
      if (res.success) {
        showToast('Profile information updated successfully!', 'success');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passName || !passAge) return;
    setAddingPassenger(true);
    try {
      const res = await api.addSavedPassenger({
        fullName: passName,
        age: parseInt(passAge, 10),
        gender: passGender,
        berthPreference: passBerth,
      });
      if (res.success) {
        showToast('Saved passenger profile added!', 'success');
        setPassName('');
        setPassAge('');
        setShowAddPassenger(false);
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add passenger', 'error');
    } finally {
      setAddingPassenger(false);
    }
  };

  const handleDeletePassenger = async (id: string) => {
    try {
      await api.deleteSavedPassenger(id);
      showToast('Saved passenger removed', 'info');
      await refreshUser();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete passenger', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              {user.role === 'ADMIN' && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('bookings')}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Ticket className="w-4 h-4" />
          <span>View My Bookings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Edit Section */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
            Personal Information
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400">Email cannot be changed</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Saved Passengers Section */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-blue-600" />
              <span>Saved Passengers ({user.savedPassengers?.length || 0})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddPassenger(!showAddPassenger)}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {/* Add Passenger Form */}
          {showAddPassenger && (
            <form
              onSubmit={handleAddPassenger}
              className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3.5 space-y-3 text-xs"
            >
              <span className="font-bold text-blue-900 block">Add Traveler Profile</span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={passName}
                  onChange={(e) => setPassName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  placeholder="Age"
                  value={passAge}
                  onChange={(e) => setPassAge(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                />
                <select
                  value={passGender}
                  onChange={(e) => setPassGender(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Other</option>
                </select>
              </div>
              <div>
                <select
                  value={passBerth}
                  onChange={(e) => setPassBerth(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Lower">Lower Berth</option>
                  <option value="Middle">Middle Berth</option>
                  <option value="Upper">Upper Berth</option>
                  <option value="Side Lower">Side Lower</option>
                  <option value="Side Upper">Side Upper</option>
                  <option value="Window">Window Seat</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPassenger(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingPassenger}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Save Passenger
                </button>
              </div>
            </form>
          )}

          {/* Saved passengers list */}
          <div className="space-y-2">
            {!user.savedPassengers || user.savedPassengers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No saved family or traveler members yet. Add members for 1-click booking!
              </p>
            ) : (
              user.savedPassengers.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{p.fullName}</div>
                    <div className="text-slate-500">
                      {p.age} yrs • {p.gender} • Pref: {p.berthPreference}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePassenger(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete saved passenger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
