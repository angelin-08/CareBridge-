import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BodyMap = ({ onSelect }) => {
    const [selected, setSelected] = useState(null);

    const regions = [
        { id: 'head', path: "M12,2A3,3,0,0,0,9,5a3.11,3.11,0,0,0,.08.71l-1.4,2.8A2,2,0,0,0,9.47,11.3,4,4,0,0,0,12,12a4,4,0,0,0,2.53-.7,2,2,0,0,0,1.79-2.79l-1.4-2.8A3.11,3.11,0,0,0,15,5,3,3,0,0,0,12,2Z", label: "Head/Neck", name: "head" },
        { id: 'chest', path: "M12,13a5,5,0,0,0-5,5v4h10V18A5,5,0,0,0,12,13Z", label: "Chest/Torso", name: "chest" },
        { id: 'arm-l', path: "M6,17l-3,8,2,1,3-8Z", label: "Left Arm", name: "arm" },
        { id: 'arm-r', path: "M18,17l3,8-2,1-3-8Z", label: "Right Arm", name: "arm" },
        { id: 'leg-l', path: "M8,23v9l2,1,2-1v-9Z", label: "Left Leg", name: "leg" },
        { id: 'leg-r', path: "M14,23v9l2,1,2-1v-9Z", label: "Right Leg", name: "leg" },
    ];

    const handleSelect = (region) => {
        setSelected(region.id);
        onSelect(region.name);
    };

    return (
        <div className="relative flex flex-col items-center">
            <div className="text-center mb-6">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">Interactive Locator</p>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Where does it hurt?</h3>
            </div>

            <div className="relative w-64 h-96 bg-white/50 backdrop-blur-sm rounded-[3rem] p-8 border border-white/20 shadow-xl overflow-hidden">
                {/* Simple Abstract Human Silhouette */}
                <svg viewBox="0 0 24 40" className="w-full h-full drop-shadow-2xl">
                    {regions.map((region) => (
                        <motion.path
                            key={region.id}
                            d={region.path}
                            fill={selected === region.id ? "#2563eb" : "#e2e8f0"}
                            stroke={selected === region.id ? "#1d4ed8" : "#cbd5e1"}
                            strokeWidth="0.5"
                            whileHover={{ scale: 1.05, fill: selected === region.id ? "#2563eb" : "#94a3b8" }}
                            onClick={() => handleSelect(region)}
                            className="cursor-pointer transition-colors duration-300"
                        />
                    ))}

                    {/* Decorative Vital Lines */}
                    <path d="M4,15 Q12,15 12,5" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.2" className="animate-pulse" />
                    <path d="M20,15 Q12,15 12,5" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.2" className="animate-pulse" />
                </svg>

                {/* Selected Label Overlay */}
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 rounded-full shadow-lg"
                        >
                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                                {regions.find(r => r.id === selected).label} Selected
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 flex gap-3 flex-wrap justify-center max-w-xs">
                {['Fever', 'Pain', 'Injury'].map(tag => (
                    <div key={tag} className="px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                        {tag}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BodyMap;
