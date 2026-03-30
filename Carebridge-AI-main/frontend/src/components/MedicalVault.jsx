import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronRight, Mic, FileText, Calendar, Trash2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { cn } from '../utils';

const MedicalVault = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchRecords = async (uid) => {
        try {
            const q = query(collection(db, `users/${uid}/records`), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            setRecords(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) fetchRecords(u.uid);
            else setLoading(false);
        });
        return unsub;
    }, []);

    const filteredRecords = records.filter(r => filter === 'all' || r.type === filter);

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
            ))}
        </div>
    );

    return (
        <div className="space-y-8 pb-32">
            {/* Header Controls */}
            <div className="flex flex-col gap-6">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search your records..."
                        className="w-full bg-white border border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-slate-900 font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                    {['all', 'symptom_check', 'medical_report'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {t.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Records List */}
            <div className="space-y-5">
                <AnimatePresence mode='popLayout'>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                key={record.id}
                                className="premium-card p-6 flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                                        record.type === 'symptom_check' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                                    )}>
                                        {record.type === 'symptom_check' ? <Mic size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-extrabold text-slate-900 tracking-tight">
                                                {record.type === 'symptom_check' ? 'Diagnosis Session' : 'Report Analysis'}
                                            </h4>
                                            {record.severity === 'emergency' && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {record.timestamp?.toDate ? record.timestamp.toDate().toLocaleDateString() : 
                                                 record.timestamp?.seconds ? new Date(record.timestamp.seconds * 1000).toLocaleDateString() : 
                                                 'Recently'}
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full border",
                                                record.severity === 'high' ? 'text-orange-600 border-orange-100 bg-orange-50/50' : 'text-slate-400 border-slate-100'
                                            )}>
                                                {record.severity || 'Normal'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                    <ArrowUpRight size={20} />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Empty Vault</h3>
                            <p className="text-sm text-slate-400 font-medium mt-1">Your secure records will appear here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MedicalVault;
