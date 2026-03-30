import React, { useState, useEffect } from 'react';
import { Bell, Plus, Clock, Trash2, CheckCircle2, Circle, X, Calendar, Pill, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';

const MedicationReminder = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [user, setUser] = useState(null);
    const [newMed, setNewMed] = useState({
        name: '',
        dosage: '',
        times: ['08:00', '20:00'],
        takenToday: []
    });

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                const q = query(collection(db, `users/${u.uid}/reminders`));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setReminders(docs);
                    setLoading(false);
                });

                return () => unsubscribe();
            } else {
                setLoading(false);
            }
        });
        return unsubAuth;
    }, []);

    const addReminder = async (e) => {
        e.preventDefault();
        if (!user) return;
        try {
            await addDoc(collection(db, `users/${user.uid}/reminders`), {
                ...newMed,
                createdAt: serverTimestamp()
            });
            setShowAdd(false);
            setNewMed({ name: '', dosage: '', times: ['08:00', '20:00'], takenToday: [] });
            toast.success('Regimen Established', {
                style: { borderRadius: '20px', background: '#0f172a', color: '#fff' }
            });
        } catch (err) {
            toast.error('Synthesis failed.');
        }
    };

    const deleteReminder = async (id) => {
        try {
            await deleteDoc(doc(db, `users/${user.uid}/reminders`, id));
            toast.success('Entry Purged');
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const toggleTaken = async (med, slot) => {
        const isTaken = med.takenToday?.includes(slot);
        const newTaken = isTaken
            ? med.takenToday.filter(s => s !== slot)
            : [...(med.takenToday || []), slot];

        try {
            await updateDoc(doc(db, `users/${user.uid}/reminders`, med.id), {
                takenToday: newTaken
            });
            if (!isTaken) {
                toast.success('Dose Confirmed', { icon: '✅' });
            }
        } catch (err) {
            toast.error('Log failed');
        }
    };

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center premium-card p-6 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={100} />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/20">
                        <Pill size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Cabinet</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {reminders.length} Meds Active
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className={cn(
                        "p-5 rounded-2xl transition-all shadow-xl active:scale-95 group relative overflow-hidden",
                        showAdd ? "bg-slate-900 text-white" : "bg-white text-blue-600 border border-slate-100 hover:bg-blue-600 hover:text-white"
                    )}
                >
                    <Plus size={24} className={cn("transition-transform duration-500", showAdd && "rotate-45")} />
                </button>
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, scale: 0.95 }}
                        animate={{ height: 'auto', opacity: 1, scale: 1 }}
                        exit={{ height: 0, opacity: 0, scale: 0.95 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={addReminder} className="premium-card p-10 bg-slate-900 text-white space-y-8 border-none shadow-2xl shadow-blue-900/20">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="text-blue-400" />
                                <h3 className="text-lg font-black tracking-tight italic">Initialize Regimen</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Substance Identity</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Paracetamol"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold placeholder:text-white/20 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                        value={newMed.name}
                                        onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Unit Dosage</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 500mg"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold placeholder:text-white/20 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                                        value={newMed.dosage}
                                        onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">AM Slot</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:ring-4 focus:ring-blue-500/20 outline-none transition-all [color-scheme:dark]"
                                        value={newMed.times[0]}
                                        onChange={e => setNewMed({ ...newMed, times: [e.target.value, newMed.times[1]] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">PM Slot</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-bold focus:ring-4 focus:ring-blue-500/20 outline-none transition-all [color-scheme:dark]"
                                        value={newMed.times[1]}
                                        onChange={e => setNewMed({ ...newMed, times: [newMed.times[0], e.target.value] })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black tracking-[0.2em] uppercase text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                            >
                                Secure Registration
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                <AnimatePresence mode='popLayout'>
                    {reminders.length > 0 ? (
                        reminders.map((med, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.1 }}
                                key={med.id}
                                className="premium-card p-2 bg-white flex flex-col group hover-tilt perspective-1000"
                            >
                                <div className="p-6 pb-2 preserve-3d">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12 shadow-sm border border-blue-100">
                                            <Pill size={32} />
                                        </div>
                                        <button
                                            onClick={() => deleteReminder(med.id)}
                                            className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2">{med.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">{med.dosage}</span>
                                            <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                <Clock size={12} /> Cycle Ready
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 p-2 mt-auto">
                                    {med.times.map((slot, idx) => {
                                        const isTaken = med.takenToday?.includes(slot);
                                        return (
                                            <motion.button
                                                key={idx}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => toggleTaken(med, slot)}
                                                className={cn(
                                                    "p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3",
                                                    isTaken
                                                        ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-600/30'
                                                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                                                )}
                                            >
                                                {isTaken ? <CheckCircle2 size={24} /> : <Circle size={24} className="opacity-40" />}
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{slot}</p>
                                                    <p className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest opacity-60",
                                                        isTaken ? "text-blue-100" : "text-slate-400"
                                                    )}>
                                                        {isTaken ? 'Secured' : 'Missing'}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8 border-2 border-dashed border-slate-200">
                                <Pill size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Regimen Offline</h3>
                            <p className="text-sm text-slate-400 font-medium mt-2">Initialize your medication scheduler to begin tracking.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MedicationReminder;
