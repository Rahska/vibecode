"use client";

import { useRahatStore, Location, LocationType } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, Users, UploadCloud, Plus, Pencil, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from "react";
import { toast } from "sonner";

const MOCK_CHART_DATA = [
  { name: 'Mon', revenue: 4000, bookings: 4 },
  { name: 'Tue', revenue: 3000, bookings: 3 },
  { name: 'Wed', revenue: 5200, bookings: 6 },
  { name: 'Thu', revenue: 2780, bookings: 3 },
  { name: 'Fri', revenue: 6890, bookings: 8 },
  { name: 'Sat', revenue: 9200, bookings: 11 },
  { name: 'Sun', revenue: 7490, bookings: 9 },
];

const LOCATION_TYPES: LocationType[] = ['YURT', 'TAPCHAN', 'VIP', 'FIELD', 'GAZEBO', 'BBQ'];
const GLOW_COLORS = ['glow-cyan', 'glow-blue', ''];

interface LocationFormData {
  name: string;
  type: LocationType;
  pricePerHour: number;
  capacity: number;
  features: string;
  glowColor: string;
}

const DEFAULT_FORM: LocationFormData = {
  name: '', type: 'YURT', pricePerHour: 50, capacity: 10, features: '', glowColor: 'glow-cyan'
};

export default function DashboardPage() {
  const { locations, bookings, uploadPhoto, deleteLocation, addLocation, updateLocation, activities, deletePhoto } = useRahatStore();
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]?.id || "");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationFormData>(DEFAULT_FORM);

  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!selectedLocation) return;
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Image too large. Max 5MB."); return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadPhoto(selectedLocation, e.target?.result as string);
        toast.success("Photo uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  }, [selectedLocation, uploadPhoto]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const openAddModal = () => { setFormData(DEFAULT_FORM); setEditingId(null); setShowAddModal(true); };
  
  const openEditModal = (loc: Location) => {
    setFormData({ name: loc.name, type: loc.type, pricePerHour: loc.pricePerHour, capacity: loc.capacity, features: loc.features.join(', '), glowColor: loc.glowColor || '' });
    setEditingId(loc.id);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) { toast.error("Name is required"); return; }
    const locationData = {
      name: formData.name,
      type: formData.type,
      pricePerHour: Number(formData.pricePerHour),
      capacity: Number(formData.capacity),
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      glowColor: formData.glowColor,
      isActive: true,
    };

    if (editingId) {
      updateLocation(editingId, locationData);
      toast.success(`"${formData.name}" updated successfully`);
    } else {
      addLocation({
        id: Math.random().toString(36).substr(2, 9),
        rating: 4.5,
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'],
        ...locationData,
      });
      toast.success(`"${formData.name}" added to catalog`);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteLocation(id);
      toast.success(`"${name}" deleted`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-6 lg:p-14 w-full"
    >
      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Location' : 'Add New Location'}</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-semibold uppercase tracking-wider">Name</label>
                  <input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                    placeholder="e.g. Royal Yurt V2"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-semibold uppercase tracking-wider">Type</label>
                    <select value={formData.type} onChange={e => setFormData(p => ({...p, type: e.target.value as LocationType}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                      {LOCATION_TYPES.map(t => <option key={t} value={t} className="bg-[#111827]">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-semibold uppercase tracking-wider">Price / Hour ($)</label>
                    <input type="number" value={formData.pricePerHour} onChange={e => setFormData(p => ({...p, pricePerHour: Number(e.target.value)}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-semibold uppercase tracking-wider">Capacity (guests)</label>
                  <input type="number" value={formData.capacity} onChange={e => setFormData(p => ({...p, capacity: Number(e.target.value)}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50" />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-semibold uppercase tracking-wider">Features (comma-separated)</label>
                  <input value={formData.features} onChange={e => setFormData(p => ({...p, features: e.target.value}))}
                    placeholder="Wi-Fi, BBQ Grill, Smart TV"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />{editingId ? 'Update' : 'Add Location'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
            Admin <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg">Manage your platform in real time.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <Plus className="w-5 h-5" /> Add Location
        </button>
      </motion.header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'cyan', border: 'border-l-cyan-500' },
          { label: 'Total Bookings', value: bookings.length, icon: TrendingUp, color: 'blue', border: 'border-l-blue-500' },
          { label: 'Confirmed', value: confirmedBookings.length, icon: Users, color: 'green', border: 'border-l-green-500' },
          { label: 'Locations', value: locations.length, icon: Users, color: 'purple', border: 'border-l-purple-500' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-card p-5 flex items-center gap-4 border-l-4 ${stat.border}`}>
            <div className={`w-10 h-10 rounded-full bg-${stat.color}-500/20 flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{stat.label}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Revenue (This Week)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MOCK_CHART_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Bookings (This Week)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MOCK_CHART_DATA}>
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="bookings" fill="#3B82F6" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Management Table */}
      <div className="glass-panel p-6 mb-10">
        <h3 className="text-xl font-semibold text-white mb-6">Location Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Location', 'Type', 'Price/hr', 'Capacity', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-4 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={loc.images[0]} alt={loc.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <span className="font-semibold text-white text-sm">{loc.name}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-6"><span className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-300">{loc.type}</span></td>
                  <td className="py-4 pr-6 text-white font-bold">${loc.pricePerHour}</td>
                  <td className="py-4 pr-6 text-slate-300">{loc.capacity}</td>
                  <td className="py-4 pr-6">
                    <span className="text-yellow-400 font-bold">★ {loc.rating}</span>
                  </td>
                  <td className="py-4 pr-6">
                    <button onClick={() => updateLocation(loc.id, { isActive: !loc.isActive })}
                      className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${loc.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {loc.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {loc.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(loc)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(loc.id, loc.name)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Upload + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Photo Management</h3>
          <div className="mb-4">
            <label className="text-slate-400 text-xs mb-2 block font-semibold uppercase">Select Location</label>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50">
              {locations.map(loc => <option key={loc.id} value={loc.id} className="bg-[#111827] text-white">{loc.name}</option>)}
            </select>
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragActive ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]' : 'border-white/10 hover:border-white/20 bg-white/5'}`}>
            <input {...getInputProps()} />
            <UploadCloud className={`w-10 h-10 mb-3 ${isDragActive ? 'text-cyan-400' : 'text-slate-400'}`} />
            <p className="text-sm font-semibold text-white mb-1">{isDragActive ? "Drop here!" : "Drag & Drop photos"}</p>
            <p className="text-xs text-slate-500">PNG, JPG, WEBP · Max 5MB</p>
          </div>

          {/* Photo Gallery for selected location */}
          {(() => {
            const loc = locations.find(l => l.id === selectedLocation);
            if (!loc || loc.images.length === 0) return null;
            return (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {loc.images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
                    <img src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
                    <button onClick={() => deletePhoto(loc.id, i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Live Activity Feed</h3>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No activity yet</div>
            ) : activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mt-1.5 flex-shrink-0" />
                <div className="flex-1 text-sm text-slate-300">{activity.message}</div>
                <div className="text-xs text-slate-500 font-medium whitespace-nowrap">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      {bookings.length > 0 && (
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Location', 'Date', 'Time', 'Total', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-4 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...bookings].reverse().slice(0, 10).map(b => {
                  const loc = locations.find(l => l.id === b.locationId);
                  return (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-6 font-mono text-xs text-slate-400">#{b.id.toUpperCase().slice(0,6)}</td>
                      <td className="py-3 pr-6 text-white text-sm font-medium">{loc?.name || 'Unknown'}</td>
                      <td className="py-3 pr-6 text-slate-300 text-sm">{b.date}</td>
                      <td className="py-3 pr-6 text-slate-300 text-sm">{b.startHour}:00 – {b.endHour}:00</td>
                      <td className="py-3 pr-6 text-white font-bold">${b.totalPrice}</td>
                      <td className="py-3 pr-6">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${b.status === 'CONFIRMED' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
