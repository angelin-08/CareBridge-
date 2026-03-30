import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Upload, Bell, Shield, TrendingUp, Sparkles, LogOut, ChevronRight, Activity, Brain, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { cn } from '../utils';
import toast from 'react-hot-toast';
import { useUser } from '../context/UserContext';

const HealthInsights = ({ stats, lastRecord }) => {
    const [insight, setInsight] = useState("Initializing neural analysis...");

    useEffect(() => {
        if (stats.checks === 0 && stats.reports === 0) {
            setInsight("Welcome. Begin your health journey by uploading a report or starting a voice checkup.");
        } else if (lastRecord?.severity === 'high') {
            setInsight("Critical attention recommended. Review your latest report regarding " + (lastRecord.title || "unspecified concerns") + ".");
        } else {
            setInsight("Neural patterns stable. Your adherence score is within optimal range. Keep maintaining your regimen.");
        }
    }, [stats, lastRecord]);

    return (
        <div className="premium-card p-8 bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Brain size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Neural Insights</h4>
                        <p className="text-[10px] font-bold text-slate-500">CarebridgeAI Oracle</p>
                    </div>
                </div>
                <p className="text-xl font-black leading-tight italic mb-6">
                    "{insight}"
                </p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
                        <CheckCircle2 size={12} className="text-green-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Protocol Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
                        <Activity size={12} className="text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Bio-Metric Sync</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const { user, loading, isDemo, loginAsDemo, logout } = useUser();
    const [stats, setStats] = useState({ checks: 0, reports: 0, meds: 0 });
    const [lastRecord, setLastRecord] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || isDemo) {
            if (isDemo) {
                setStats({ checks: 5, reports: 2, meds: 3 });
                setLastRecord({ title: "Demo Profile Analysis", severity: "low" });
            }
            return;
        }

        const loadUserData = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        name: user.displayName || 'User',
                        email: user.email,
                        createdAt: new Date()
                    });
                }

                const recordsRef = collection(db, `users/${user.uid}/records`);
                const q = query(recordsRef, orderBy('timestamp', 'desc'));
                const recordsSnap = await getDocs(q);

                const remindersRef = collection(db, `users/${user.uid}/reminders`);
                const remindersSnap = await getDocs(remindersRef);

                const docs = recordsSnap.docs.map(d => d.data());
                setStats({
                    checks: docs.filter(d => d.type === 'symptom_check').length,
                    reports: docs.filter(d => d.type === 'medical_report').length,
                    meds: remindersSnap.size
                });

                if (docs.length > 0) {
                    setLastRecord(docs[0]);
                }
            } catch (err) {
                console.error("Firestore Error:", err);
                toast.error("Cloud sync failed. Using local mode.");
            }
        };

        loadUserData();
    }, [user, isDemo]);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast.success('Welcome to CarebridgeAI');
        } catch (err) {
            console.error(err);
            toast.error('Authentication failed. Launching demo mode...');
            loginAsDemo();
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center"
            >
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </motion.div>
        </div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -ml-48 -mb-48 opacity-50" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/20 relative"
                >
                    <Shield size={64} className="text-white" />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-white rounded-[2.5rem]"
                    />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center w-full max-w-sm"
                >
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                        Carebridge<span className="text-blue-600">AI</span>
                    </h1>
                    <p className="text-slate-500 font-medium mb-12 mx-auto leading-relaxed">
                        Access world-class healthcare advice through simple voice checks.
                        Designed for <span className="text-slate-900 font-bold">Global Accessibility</span>.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={login}
                            className="group relative w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-95 overflow-hidden"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                            />
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 z-10" alt="google" />
                            <span className="z-10">Neural Login</span>
                        </button>

                        <button
                            onClick={loginAsDemo}
                            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-[2rem] font-bold text-lg hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Brain size={20} className="text-blue-600" />
                            <span>Demo Access</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <header className="px-6 py-8 bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-40 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            Carebridge<span className="text-blue-600">AI</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                Neural Link Active
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <main className="p-6 max-w-lg mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <img
                        src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + (user?.displayName || 'User')}
                        alt="profile"
                        className="w-16 h-16 rounded-3xl border-4 border-white shadow-xl shadow-slate-200 object-cover"
                    />
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Authenticated User</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {user?.displayName?.split(' ')[0] || 'Member'}
                        </h3>
                    </div>
                </div>

                <HealthInsights stats={stats || { checks: 0, reports: 0, meds: 0 }} lastRecord={lastRecord} />

                <div className="grid grid-cols-2 gap-5">
                    <motion.button
                        whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/symptoms')}
                        className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] shadow-2xl shadow-blue-500/30 relative overflow-hidden group h-48"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform"><Mic size={100} /></div>
                        <Mic size={40} className="mb-4 relative z-10" />
                        <span className="font-black text-lg relative z-10">Voice Check</span>
                        <p className="text-[10px] font-bold text-blue-100/70 uppercase tracking-widest mt-1 relative z-10">AI Diagnosis</p>
                    </motion.button>

                    <motion.button
                        whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/reports')}
                        className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 text-slate-800 rounded-[2.5rem] shadow-lg shadow-slate-200/50 relative overflow-hidden group h-48"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600 group-hover:scale-150 transition-transform"><Upload size={100} /></div>
                        <Upload size={40} className="mb-4 text-blue-600 relative z-10" />
                        <span className="font-black text-lg relative z-10">Lab Scan</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">OCR Analysis</p>
                    </motion.button>
                </div>

                <div className="premium-card p-8 grid grid-cols-3 gap-8">
                    <div className="text-center group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mb-3 mx-auto flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><Activity size={22} /></div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats?.checks || 0}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checks</p>
                    </div>
                    <div className="text-center group">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 mx-auto flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><Bell size={22} /></div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats?.meds || 0}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meds</p>
                    </div>
                    <div className="text-center group">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl mb-3 mx-auto flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all"><FileText size={22} /></div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{stats?.reports || 0}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports</p>
                    </div>
                </div>

                <div className="premium-card p-6 border-l-4 border-l-blue-600 cursor-pointer hover:bg-slate-50 transition-all group" onClick={() => navigate('/reminders')}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"><Bell size={24} /></div>
                            <div>
                                <h3 className="font-black text-slate-900 leading-none mb-1">Scheduled Meds</h3>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Adherence Protocol Active</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
