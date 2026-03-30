import React from 'react';
import { AlertTriangle, Phone, MapPin, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyAlert = ({ data, onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-8 text-white text-center selection:bg-white selection:text-red-600"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 via-red-600 to-red-800 opacity-50" />

            <button
                onClick={onDismiss}
                className="absolute top-8 right-8 p-4 rounded-3xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90"
            >
                <X size={24} />
            </button>

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 flex flex-col items-center max-w-lg w-full"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-red-950/40"
                >
                    <AlertTriangle size={64} className="text-red-600" />
                </motion.div>

                <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter leading-none italic">
                    Emergency <br /> <span className="bg-white text-red-600 px-4 py-1 rounded-2xl not-italic shadow-xl">Detected</span>
                </h1>

                <p className="text-2xl font-black mb-12 leading-tight opacity-90">
                    {data.emergency_message || "Critical condition identified. Please act immediately."}
                </p>

                <div className="w-full space-y-6">
                    <motion.a
                        href="tel:108"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-6 w-full bg-white text-red-600 py-8 rounded-[2.5rem] text-3xl font-black shadow-2xl shadow-red-950/50"
                    >
                        <Phone size={40} className="animate-pulse" />
                        DIAL 108
                    </motion.a>

                    <motion.a
                        href="https://www.google.com/maps/search/nearest+hospital"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 w-full bg-red-800 text-white py-5 rounded-[2rem] text-lg font-black border-2 border-red-400/30 backdrop-blur-sm"
                    >
                        <MapPin size={24} />
                        Find Nearest Hospital
                    </motion.a>
                </div>

                <div className="mt-16 p-6 bg-black/20 backdrop-blur-xl rounded-[2rem] border border-white/10 w-full text-left">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldAlert size={20} className="text-red-400" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-red-400">Patient Signal Analysis</p>
                    </div>
                    <p className="text-lg font-bold leading-relaxed italic opacity-80">
                        "{data.original_input || "Critical neurological or systemic distress reported."}"
                    </p>
                </div>

                <p className="mt-10 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
                    CarebridgeAI Rapid Response Unit
                </p>
            </motion.div>
        </motion.div>
    );
};

export default EmergencyAlert;
