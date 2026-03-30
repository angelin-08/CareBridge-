import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Mic, Bell, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { language, toggleLanguage } = useLanguage();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/symptoms', icon: Mic, label: 'Check' },
        { path: '/reports', icon: ClipboardList, label: 'Vault' },
        { path: '/reminders', icon: Bell, label: 'Meds' },
        { path: '/metrics', icon: Activity, label: 'Impact' },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg">
            <div className="glass rounded-[2rem] p-2 flex items-center justify-between shadow-2xl shadow-blue-500/10 border border-white/40">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 group min-w-[60px]",
                            isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-blue-50 rounded-2xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon
                                    size={22}
                                    className={cn(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        isActive && "scale-110"
                                    )}
                                />
                                <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLanguage}
                    className="flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 group min-w-[60px] text-slate-400 hover:text-blue-600"
                >
                    <div className="relative">
                        <Globe size={22} />
                        <motion.div
                            animate={{ rotate: language === 'en' ? 0 : 180 }}
                            className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"
                        />
                    </div>
                    <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">
                        {language === 'en' ? 'EN' : 'TA'}
                    </span>
                </motion.button>
            </div>
        </nav>
    );
};

export default Navbar;
