import React from 'react';
import MedicalVault from '../components/MedicalVault';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    return (
        <div className="min-h-screen p-6 bg-slate-50 pb-32">
            <div className="max-w-2xl mx-auto pt-10">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            Secure <span className="text-blue-600">Vault</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            Global Health History
                        </p>
                    </motion.div>
                </header>

                <MedicalVault />
            </div>
        </div>
    );
};

export default Dashboard;
