import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShieldCheck, Globe, User, Zap, Heart, CheckCircle2 } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        language: 'en'
    });

    const steps = [
        {
            title: "Select Your Context",
            subtitle: "Language & Localization",
            icon: <Globe className="text-blue-600" size={40} />,
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setProfile({ ...profile, language: 'en' })}
                            className={`p-6 rounded-[2rem] border-2 transition-all ${profile.language === 'en' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white'}`}
                        >
                            <span className="text-3xl mb-2 block">🇺🇸</span>
                            <p className="font-black text-xs uppercase tracking-widest text-slate-900">English</p>
                        </button>
                        <button
                            onClick={() => setProfile({ ...profile, language: 'ta' })}
                            className={`p-6 rounded-[2rem] border-2 transition-all ${profile.language === 'ta' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white'}`}
                        >
                            <span className="text-3xl mb-2 block">🇮🇳</span>
                            <p className="font-black text-xs uppercase tracking-widest text-slate-900">Tamil</p>
                        </button>
                    </div>
                </div>
            )
        },
        {
            title: "Neural Profile",
            subtitle: "Basic Biometrics",
            icon: <User className="text-indigo-600" size={40} />,
            content: (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Identity</label>
                        <input
                            type="text"
                            placeholder="Ex: Sanjay Kumar"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Age Bracket</label>
                        <input
                            type="number"
                            placeholder="24"
                            value={profile.age}
                            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none"
                        />
                    </div>
                </div>
            )
        },
        {
            title: "Access Initialized",
            subtitle: "Medical Intelligence Ready",
            icon: <Zap className="text-yellow-500" size={40} />,
            content: (
                <div className="space-y-4">
                    {[
                        { icon: <ShieldCheck size={16} />, text: "Encrypted Health Vault" },
                        { icon: <Heart size={16} />, text: "AI Symptom Synthesis" },
                        { icon: <CheckCircle2 size={16} />, text: "Precision Medication" }
                    ].map((item, i) => (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100"
                        >
                            <div className="text-blue-600">{item.icon}</div>
                            <p className="text-xs font-bold text-slate-700">{item.text}</p>
                        </motion.div>
                    ))}
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1);
        else onComplete(profile);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full">
                <div className="mb-12 flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-12 bg-blue-600' : 'w-4 bg-slate-200'}`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="premium-card p-10 bg-white"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
                            {steps[step].icon}
                        </div>

                        <div className="text-center mb-10">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">
                                {steps[step].subtitle}
                            </p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                {steps[step].title}
                            </h2>
                        </div>

                        {steps[step].content}

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNext}
                            className="w-full mt-10 flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/20"
                        >
                            {step === steps.length - 1 ? 'Start Journey' : 'Continue'}
                            <ChevronRight size={16} />
                        </motion.button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Onboarding;
