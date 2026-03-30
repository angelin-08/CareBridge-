import React from 'react';
import MedicationReminder from '../components/MedicationReminder';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ShieldCheck } from 'lucide-react';

const Reminders = () => {
    return (
        <div className="min-h-screen p-6 bg-slate-50 pb-32">
            <div className="max-w-2xl mx-auto pt-10">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            Global <span className="text-blue-600">Scheduler</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            Precision Health Management
                        </p>
                    </motion.div>
                </header>

                <MedicationReminder />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Lightbulb size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Lightbulb size={20} />
                            </div>
                            <h4 className="font-extrabold text-slate-900 tracking-tight uppercase text-xs">Clinical Intelligence</h4>
                        </div>
                        <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                            "Adherence to scheduled dosages is the most critical factor in treatment success. Maintain consistency for optimal bio-efficacy."
                        </p>
                    </div>
                </motion.div>

                <div className="mt-8 flex items-center justify-center gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">
                        Synchronized with Cloud Health Ledger
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reminders;
