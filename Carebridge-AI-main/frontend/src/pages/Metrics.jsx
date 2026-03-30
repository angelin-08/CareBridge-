import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, ClipboardCheck, Activity, ShieldCheck, Zap, Heart, Trophy } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { useUser } from '../context/UserContext';

const Metrics = () => {
    const [data, setData] = useState([
        { name: 'Symptom Checks', value: 0, color: '#3b82f6' },
        { name: 'Reports Analyzed', value: 0, color: '#8b5cf6' },
        { name: 'Meds Tracked', value: 0, color: '#10b981' },
        { name: 'Health IQ', value: 85, color: '#f59e0b' },
    ]);
    const [loading, setLoading] = useState(true);

    const { user, isDemo } = useUser();

    useEffect(() => {
        if (!user || isDemo) {
            if (isDemo) {
                setData([
                    { name: 'Symptom Checks', value: 5, color: '#3b82f6' },
                    { name: 'Reports Analyzed', value: 2, color: '#8b5cf6' },
                    { name: 'Meds Tracked', value: 3, color: '#10b981' },
                    { name: 'Health IQ', value: 92, color: '#f59e0b' },
                ]);
            }
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const recordsSnap = await getDocs(collection(db, `users/${user.uid}/records`));
                const remindersSnap = await getDocs(collection(db, `users/${user.uid}/reminders`));

                const symptomChecks = recordsSnap.docs.filter(d => d.data().type === 'symptom_check').length;
                const reports = recordsSnap.docs.filter(d => d.data().type === 'medical_report').length;
                const meds = remindersSnap.size;

                setData([
                    { name: 'Symptom Checks', value: symptomChecks, color: '#3b82f6' },
                    { name: 'Reports Analyzed', value: reports, color: '#8b5cf6' },
                    { name: 'Meds Tracked', value: meds, color: '#10b981' },
                    { name: 'Health IQ', value: 85 + reports + meds, color: '#f59e0b' },
                ]);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        loadData();
    }, [user, isDemo]);

    if (loading) return (
        <div className="space-y-4 max-w-2xl mx-auto pt-10">
            <div className="h-40 bg-slate-100 rounded-[2.5rem] animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
                <div className="h-32 bg-slate-100 rounded-[2rem] animate-pulse" />
            </div>
            <div className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />
        </div>
    );

    return (
        <div className="min-h-screen p-6 bg-slate-50 pb-32">
            <div className="max-w-2xl mx-auto pt-10">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            Health <span className="text-blue-600">Intelligence</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            Biometric Impact Analysis
                        </p>
                    </motion.div>
                </header>

                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card p-10 bg-slate-900 text-white flex items-center justify-between mb-8 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10">
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Overall Vitality Score</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter">
                                {data[3]?.value || 0}
                            </span>
                            <span className="text-xl font-bold text-slate-500">/100</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                            <Zap size={14} className="text-blue-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Elite Performance Level</p>
                        </div>
                    </div>
                    <div className="relative z-10 w-24 h-24 rounded-full border-[8px] border-blue-600/20 flex items-center justify-center">
                        <Activity className="text-blue-500" size={40} />
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="42%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray="264"
                                strokeDashoffset={264 - (264 * (data[3]?.value || 0)) / 100}
                                className="text-blue-600 transition-all duration-1000 ease-out"
                            />
                        </svg>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="premium-card p-8 group border-l-4 border-l-blue-600"
                    >
                        <Users className="text-blue-600 mb-4 transition-transform group-hover:scale-110" size={28} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Diagnostic Checks</p>
                        <p className="text-4xl font-black text-slate-900">{data[0].value}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="premium-card p-8 group border-l-4 border-l-indigo-600"
                    >
                        <ClipboardCheck className="text-indigo-600 mb-4 transition-transform group-hover:scale-110" size={28} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Report Synthesis</p>
                        <p className="text-4xl font-black text-slate-900">{data[1].value}</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="premium-card p-10 mb-8"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">System Utilization</h3>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100 px-3 py-1 rounded-full">Real-time Data</p>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.slice(0, 3)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                                    dy={15}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50} animationBegin={500} animationDuration={1000}>
                                    {data.slice(0, 3).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <div className="mt-12 flex items-center justify-center gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none">
                        Certified Health Monitoring Output
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Metrics;
