import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, MapPin, Phone, Volume2, RefreshCw, ShieldAlert, Heart, Zap, ArrowRight, Star } from 'lucide-react';
import { cn } from '../utils';

const HealthGauge = ({ score }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s) => {
        if (s > 70) return '#059669'; // success
        if (s > 40) return '#f59e0b'; // warning
        return '#dc2626'; // emergency
    };

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-full h-full -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    className="opacity-50"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50%"
                    cy="50%"
                    r={radius}
                    fill="none"
                    stroke={getColor(score)}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900 leading-none">{score}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Health Index</span>
            </div>

            {/* Pulsing Glow */}
            <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ backgroundColor: getColor(score) }} />
        </div>
    );
};

const SymptomAnalysis = ({ analysis, onReset }) => {
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!analysis) return;
        // Calculate a score based on severity if not provided
        const baseScore = analysis.severity === 'low' ? 85 : analysis.severity === 'medium' ? 65 : 45;
        const randomBonus = Math.floor(Math.random() * 10);
        setScore(baseScore + randomBonus);
    }, [analysis]);

    if (!analysis) return null;

    const severityColors = {
        low: 'bg-green-500/10 text-green-600 border-green-500/20',
        medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        emergency: 'bg-red-500/10 text-red-600 border-red-500/20 animate-pulse',
    };

    const speakResponse = () => {
        const speech = new SpeechSynthesisUtterance(analysis.response_text);
        speech.lang = analysis.is_tamil ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(speech);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-2xl mx-auto pb-32"
        >
            {/* Header / Score Region */}
            <div className="flex flex-col items-center justify-center p-10 premium-card bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Heart size={200} fill="currentColor" />
                </div>

                <HealthGauge score={score} />

                <div className="mt-8 text-center relative z-10">
                    <div className={cn(
                        "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6",
                        severityColors[analysis.severity] || severityColors.low
                    )}>
                        {analysis.severity} Priority Detection
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter italic">
                        "{analysis.response_text}"
                    </h3>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={speakResponse}
                    className="absolute top-8 right-8 p-4 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-colors"
                >
                    <Volume2 size={24} />
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Possible Conditions */}
                <div className="premium-card p-8 bg-white/50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                        <ShieldAlert size={14} className="text-blue-600" /> Neural Analysis
                    </h4>
                    <div className="space-y-3">
                        {analysis.possible_conditions?.map((condition, i) => (
                            <motion.div
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group"
                            >
                                <span className="text-slate-700 font-bold text-sm tracking-tight">{condition}</span>
                                <Star size={14} className="text-blue-200 group-hover:text-blue-500 transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="premium-card p-8 bg-blue-600 text-white">
                    <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
                        <Zap size={14} /> Recommended Path
                    </h4>
                    <div className="space-y-3">
                        {analysis.immediate_actions?.map((action, i) => (
                            <motion.div
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-start gap-4"
                            >
                                <CheckCircle2 size={18} className="text-blue-300 shrink-0 mt-0.5" />
                                <span className="font-bold text-sm leading-snug">{action}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Doctor Connect Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card p-8 bg-slate-900 text-white relative overflow-hidden group border-none"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-2xl font-black tracking-tight mb-2">Connect with Specialist</h4>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Nearest Clinical Facility</p>
                        </div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                            <MapPin size={32} className="text-blue-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                            <p className="font-bold text-sm">Online Availability</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Clinic Distance</p>
                            <p className="font-bold text-sm">2.4 km</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <a
                            href="tel:108"
                            className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                        >
                            <Phone size={16} /> Call Clinic
                        </a>
                        <button className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border border-white/10">
                            Navigate <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>

            <button
                onClick={onReset}
                className="w-full py-6 rounded-[2.5rem] bg-slate-100/50 border-2 border-slate-200/50 text-slate-900 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-slate-200/50 transition-all active:scale-95 shadow-lg shadow-slate-200/10"
            >
                <RefreshCw size={24} className="text-blue-600" />
                {analysis.is_tamil ? 'மீண்டும் பேச' : 'Re-initialize Diagnostics'}
            </button>
        </motion.div>
    );
};

export default SymptomAnalysis;
