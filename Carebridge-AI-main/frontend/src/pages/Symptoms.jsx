import React, { useState } from 'react';
import VoiceInput from '../components/VoiceInput';
import SymptomAnalysis from '../components/SymptomAnalysis';
import EmergencyAlert from '../components/EmergencyAlert';
import BodyMap from '../components/BodyMap';
import Chatbot from '../components/Chatbot';
import { analyzeSymptoms } from '../services/aiService';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

const Symptoms = () => {
    const { language } = useLanguage();
    const { user, isDemo } = useUser();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [emergencyData, setEmergencyData] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [showMap, setShowMap] = useState(true);
    const [syncedText, setSyncedText] = useState('');

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setShowMap(false);
        toast.success(`${region.charAt(0).toUpperCase() + region.slice(1)} region locked.`, {
            icon: '🎯',
            style: { borderRadius: '20px', background: '#0f172a', color: '#fff' }
        });
    };

    const handleTranscript = async (text) => {
        setLoading(true);
        setAnalysis(null);
        setEmergencyData(null);

        // Append region context to text for better AI analysis
        const augmentedText = selectedRegion ? `${text} (Affected Region: ${selectedRegion})` : text;

        try {
            const result = await analyzeSymptoms(augmentedText, language);

            if (result.is_emergency) {
                setEmergencyData(result);
            } else {
                setAnalysis(result);

                if (user && !isDemo) {
                    await addDoc(collection(db, `users/${user.uid}/records`), {
                        type: 'symptom_check',
                        timestamp: serverTimestamp(),
                        title: `Diagnostic Session (${language === 'ta' ? 'தமிழ்' : 'English'})`,
                        original_input: text,
                        region: selectedRegion,
                        ai_analysis: result,
                        severity: result.severity,
                        tags: result.possible_conditions || []
                    });
                }
                toast.success('Diagnosis Complete', {
                    style: { borderRadius: '20px', background: '#0f172a', color: '#fff' }
                });
            }
        } catch (error) {
            toast.error('Synthesis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setAnalysis(null);
        setLoading(false);
        setEmergencyData(null);
        setSelectedRegion(null);
        setShowMap(true);
    };

    if (emergencyData) {
        return <EmergencyAlert data={emergencyData} onDismiss={reset} />;
    }

    return (
        <div className="min-h-screen p-6 bg-slate-50 pb-32 relative">
            <div className="max-w-2xl mx-auto pt-10 relative z-10">
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2 italic">
                            Carebridge<span className="text-blue-600">AI</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            Global Neural Diagnostic
                        </p>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {showMap && !analysis && !loading && (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <BodyMap onSelect={handleRegionSelect} />
                        </motion.div>
                    )}

                    {!showMap && !analysis && !loading && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <button
                                onClick={() => setShowMap(true)}
                                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors mb-4"
                            >
                                ← Reselect Region
                            </button>
                            <VoiceInput onTranscriptComplete={(text) => setSyncedText(text)} />
                            
                            <div className="relative py-12">
                                <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" />
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-6">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Neural Chat Interface</p>
                                </div>
                            </div>

                            <Chatbot 
                                initialText={syncedText} 
                                onEmergencyDetected={(data) => setEmergencyData(data)} 
                            />
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 space-y-8"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 border-[6px] border-slate-100 rounded-[2.5rem] animate-pulse" />
                                <div className="absolute inset-0 border-[6px] border-blue-600 rounded-[2.5rem] border-t-transparent animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2">
                                    Synthesizing Symptoms
                                </p>
                                <p className="text-slate-400 text-[10px] font-bold">Accessing Medical Intelligence...</p>
                            </div>
                        </motion.div>
                    )}

                    {analysis && !loading && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <SymptomAnalysis analysis={analysis} onReset={reset} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Symptoms;
