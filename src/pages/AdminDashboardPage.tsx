import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Modal } from '../components/common/Modal.js';
import { AdminStats } from '../types/index.js';
import {
  ShieldCheck,
  Users,
  Ticket,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Train,
  Plus,
  Trash2,
  RefreshCw,
  BarChart3,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'METRICS' | 'TRAINS' | 'BOOKINGS' | 'USERS'>('METRICS');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trains, setTrains] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Train Modal
  const [showAddTrainModal, setShowAddTrainModal] = useState(false);
  const [newTrainNumber, setNewTrainNumber] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newTrainType, setNewTrainType] = useState('Vande Bharat');
  const [newTrainSource, setNewTrainSource] = useState('');
  const [newTrainDest, setNewTrainDest] = useState('');
  const [newTrainDep, setNewTrainDep] = useState('06:00');
  const [newTrainArr, setNewTrainArr] = useState('14:30');
  const [newTrainDuration, setNewTrainDuration] = useState('8.5');
  const [newTrainFare, setNewTrainFare] = useState('1200');
  const [newTrainClasses, setNewTrainClasses] = useState('CC,EC');
  const [allStations, setAllStations] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trainsRes, bookingsRes, usersRes, stationsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTrains(),
        api.getAdminBookings(),
        api.getAdminUsers(),
        api.getStations(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (trainsRes.success) setTrains(trainsRes.trains);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (usersRes.success) setUsersList(usersRes.users);
      if (stationsRes.success) {
        setAllStations(stationsRes.stations);
        if (stationsRes.stations.length >= 2) {
          setNewTrainSource(stationsRes.stations[0].id);
          setNewTrainDest(stationsRes.stations[1].id);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This dashboard requires Administrator clearance. Please sign in as{' '}
          <strong className="text-slate-800">admin@railease.in</strong>.
        </p>
      </div>
    );
  }

  const handleCreateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createAdminTrain({
        number: newTrainNumber,
        name: newTrainName,
        type: newTrainType,
        sourceStationId: newTrainSource,
        destinationStationId: newTrainDest,
        departureTime: newTrainDep,
        arrivalTime: newTrainArr,
        durationHours: parseFloat(newTrainDuration),
        baseFare: parseFloat(newTrainFare),
        classesAvailable: newTrainClasses,
      });
      if (res.success) {
        showToast('New train service created with full coaches & inventory!', 'success');
        setShowAddTrainModal(false);
        setNewTrainNumber('');
        setNewTrainName('');
        fetchDashboardData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create train', 'error');
    }
  };

  const handleDeleteTrain = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this train service?')) return;
    try {
      const res = await api.deleteAdminTrain(id);
      if (res.success) {
        showToast('Train service removed', 'info');
        setTrains((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete train', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </span>
            <span className="text-xs text-slate-400">Railway Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            RailEase Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time management of trains, bookings, seat availability, and revenue statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddTrainModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Train</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
            <div className="text-[10px] text-slate-400">Registered Passengers</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Total Bookings</span>
              <Ticket className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.totalBookings}</div>
            <div className="text-[10px] text-slate-400">Processed Tickets</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Confirmed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.confirmedTickets}</div>
            <div className="text-[10px] text-emerald-700/80">Active CNF Journeys</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600">{stats.cancelledTickets}</div>
            <div className="text-[10px] text-rose-700/80">Refunds Processed</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Total Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400">Demo Gross Receipts</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
        {[
          { id: 'METRICS', label: 'Analytics & Insights' },
          { id: 'TRAINS', label: `Manage Trains (${trains.length})` },
          { id: 'BOOKINGS', label: `All Bookings (${bookings.length})` },
          { id: 'USERS', label: `Registered Users (${usersList.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 px-4 border-b-2 transition cursor-pointer ${
              activeTab === t.id
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: METRICS & CHARTS */}
      {activeTab === 'METRICS' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bookings by Class Bar Graph */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Bookings Distribution by Travel Class</span>
            </h3>

            <div className="space-y-3 pt-2">
              {stats.bookingsByClass.map((item) => {
                const max = Math.max(...stats.bookingsByClass.map((b) => b.count), 1);
                const percent = Math.round((item.count / max) * 100);
                return (
                  <div key={item.travelClass} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Class {item.travelClass}</span>
                      <span>{item.count} tickets</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick System Health */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              System Health & Architecture
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-bold text-slate-900 font-mono">SQLite / PostgreSQL via Prisma</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">API Latency:</span>
                <span className="font-bold text-emerald-600 font-mono">~12ms (Native RPC)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Total Active Trains:</span>
                <span className="font-bold text-slate-900 font-mono">{stats.totalTrains} Services</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">RAC Bookings:</span>
                <span className="font-bold text-amber-600 font-mono">{stats.racTickets} Passengers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAINS MANAGEMENT */}
      {activeTab === 'TRAINS' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Train No.</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Origin → Destination</th>
                  <th className="py-3 px-4">Timings</th>
                  <th className="py-3 px-4">Classes</th>
                  <th className="py-3 px-4">Coaches</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {trains.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{t.number}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {t.sourceStation?.code} → {t.destinationStation?.code}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {t.departureTime} - {t.arrivalTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{t.classesAvailable}</td>
                    <td className="py-3 px-4 text-slate-600">{t._count?.coaches || '-'}</td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteTrain(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete train"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">PNR</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Train</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Journey Date</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{b.pnr}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.user?.name}</td>
                    <td className="py-3 px-4 text-slate-800">
                      #{b.train?.number} {b.train?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {b.sourceStation?.code} → {b.destinationStation?.code}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.journeyDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{b.travelClass}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{b.totalFare.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTERED USERS */}
      {activeTab === 'USERS' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Bookings</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{u._count?.bookings || 0}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD TRAIN MODAL */}
      <Modal
        isOpen={showAddTrainModal}
        onClose={() => setShowAddTrainModal(false)}
        title="Add New Train Service"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateTrain} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Train Number (5 digits)</label>
              <input
                type="text"
                required
                value={newTrainNumber}
                onChange={(e) => setNewTrainNumber(e.target.value)}
                placeholder="e.g. 12953"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Train Name</label>
              <input
                type="text"
                required
                value={newTrainName}
                onChange={(e) => setNewTrainName(e.target.value)}
                placeholder="e.g. August Kranti Rajdhani"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Train Type</label>
              <select
                value={newTrainType}
                onChange={(e) => setNewTrainType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Rajdhani">Rajdhani</option>
                <option value="Vande Bharat">Vande Bharat</option>
                <option value="Shatabdi">Shatabdi</option>
                <option value="Superfast">Superfast</option>
                <option value="Express">Express</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Departure Time</label>
              <input
                type="text"
                value={newTrainDep}
                onChange={(e) => setNewTrainDep(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Arrival Time</label>
              <input
                type="text"
                value={newTrainArr}
                onChange={(e) => setNewTrainArr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Origin Station</label>
              <select
                value={newTrainSource}
                onChange={(e) => setNewTrainSource(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {allStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Destination Station</label>
              <select
                value={newTrainDest}
                onChange={(e) => setNewTrainDest(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {allStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Base Fare (₹)</label>
              <input
                type="number"
                value={newTrainFare}
                onChange={(e) => setNewTrainFare(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.1"
                value={newTrainDuration}
                onChange={(e) => setNewTrainDuration(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Classes Available</label>
              <input
                type="text"
                value={newTrainClasses}
                onChange={(e) => setNewTrainClasses(e.target.value)}
                placeholder="1A,2A,3A,SL"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setShowAddTrainModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
              Create Train Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
