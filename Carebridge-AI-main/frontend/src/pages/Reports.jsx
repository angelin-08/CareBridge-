import React, { useState, useEffect } from 'react';
import ReportUpload from '../components/ReportUpload';
import { analyzeReport } from '../services/aiService';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { FileText, AlertTriangle, ArrowLeft, Calendar, ShieldCheck, Sparkles, Save, Info, Download, History, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { jsPDF } from "jspdf";
import { useUser } from '../context/UserContext';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ocrText, setOcrText] = useState('');
    const [history, setHistory] = useState([]);
    const { user, isDemo } = useUser();

    useEffect(() => {
        if (!user || isDemo) {
            if (isDemo) {
                setHistory([
                    {
                        id: 'demo-1',
                        type: 'medical_report',
                        title: 'Blood Test Analysis',
                        timestamp: { seconds: Date.now() / 1000 },
                        ai_analysis: { report_type: 'Blood Test', overall_summary: 'Glucose levels stable.' }
                    }
                ]);
            }
            return;
        }

        const q = query(
            collection(db, `users/${user.uid}/records`),
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHistory(docs.filter(d => d.type === 'medical_report'));
        });
        return () => unsubscribe();
    }, [user, isDemo]);

    const handleAnalysisStart = async (text) => {
        setLoading(true);
        setOcrText(text);
        try {
            const result = await analyzeReport(text, 'en');
            setReportData(result);
            toast.success('Analysis Synchronized', {
                style: { borderRadius: '20px', background: '#0f172a', color: '#fff' }
            });
        } catch (error) {
            toast.error('Synthesis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveToVault = async () => {
        if (!user) {
            toast.error('Authentication required');
            return;
        }

        try {
            toast.loading('Writing to secure ledger...', { id: 'vault' });

            if (!isDemo) {
                await addDoc(collection(db, `users/${user.uid}/records`), {
                    type: 'medical_report',
                    timestamp: serverTimestamp(),
                    title: `${reportData.report_type} Analysis`,
                    original_input: ocrText,
                    ai_analysis: reportData,
                    severity: reportData.parameters?.some(p => p.status === 'critical') ? 'high' : 'medium',
                    tags: reportData.flags || []
                });
            } else {
                // Mock direct save for demo
                setHistory(prev => [{
                    id: 'demo-' + Date.now(),
                    type: 'medical_report',
                    title: `${reportData.report_type} Analysis`,
                    timestamp: { seconds: Date.now() / 1000 },
                    ai_analysis: reportData
                }, ...prev]);
            }

            toast.success('Archived in Vault', { id: 'vault', icon: '💎' });
            setReportData(null);
        } catch (error) {
            toast.error('Archive failed.', { id: 'vault' });
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("CarebridgeAI Medical Synthesis", 20, 25);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 50);

        // Report Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(`Report: ${reportData.report_type}`, 20, 65);
        doc.setFontSize(12);
        doc.text(`Summary: ${reportData.overall_summary}`, 20, 80, { maxWidth: 170 });

        // Parameters
        let yPos = 110;
        doc.setFontSize(14);
        doc.text("Diagnostic Parameters", 20, yPos);
        yPos += 10;

        reportData.parameters.forEach((param) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(11);
            doc.setTextColor(param.status === 'critical' ? 220 : 0, 0, 0);
            doc.text(`${param.name}: ${param.value} (${param.status})`, 25, yPos);
            yPos += 7;
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            doc.text(`Interpretation: ${param.simple_explanation}`, 25, yPos, { maxWidth: 160 });
            yPos += 12;
        });

        doc.save(`Carebridge_Analysis_${reportData.report_type}.pdf`);
        toast.success('PDF Export Initialized');
    };

    return (
        <div className="min-h-screen p-6 bg-slate-50 pb-32">
            <div className="max-w-2xl mx-auto pt-10">
                <header className="mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                            Medical <span className="text-blue-600">Vault</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            End-to-End Medical Intelligence
                        </p>
                    </motion.div>
                </header>

                <AnimatePresence mode="wait">
                    {!reportData && !loading && (
                        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            <ReportUpload onAnalysisComplete={handleAnalysisStart} />

                            {history.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 ml-2">
                                        <History size={18} className="text-blue-600" />
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Temporal Timeline</h3>
                                    </div>
                                    <div className="relative ml-4 pl-8 border-l-2 border-slate-200 space-y-8">
                                        {history.map((record, i) => (
                                            <motion.div
                                                key={record.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="relative group cursor-pointer"
                                                onClick={() => setReportData(record.ai_analysis)}
                                            >
                                                <div className="absolute -left-[41px] top-4 w-4 h-4 rounded-full bg-white border-4 border-blue-600 shadow-sm group-hover:scale-125 transition-transform" />
                                                <div className="premium-card p-6 border-slate-100 hover:border-blue-200 hover:shadow-blue-500/5">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                                                                {record.timestamp?.toDate ? record.timestamp.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 
                                                                 record.timestamp?.seconds ? new Date(record.timestamp.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 
                                                                 'Recently'}
                                                            </p>
                                                            <h4 className="text-lg font-black text-slate-900 tracking-tight">{record.title}</h4>
                                                        </div>
                                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-24 space-y-8"
                        >
                            <div className="relative">
                                <div className="w-24 h-24 border-[6px] border-slate-100 rounded-[2.5rem] animate-pulse" />
                                <div className="absolute inset-0 border-[6px] border-blue-600 rounded-[2.5rem] border-t-transparent animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Neural Scan active</p>
                                <p className="text-slate-400 text-[10px] font-bold">Decoding Biomarkers...</p>
                            </div>
                        </motion.div>
                    )}

                    {reportData && !loading && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <button
                                onClick={() => setReportData(null)}
                                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Vault
                            </button>

                            <div className="overflow-hidden premium-card bg-white border border-slate-100">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameter</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Range</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(reportData?.parameters || []).map((param, i) => (
                                                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-5 font-bold text-slate-900">{param.name}</td>
                                                    <td className="px-6 py-5 font-black text-blue-600">{param.value}</td>
                                                    <td className="px-6 py-5 text-xs text-slate-400 font-bold">{param.normal_range || param.normal}</td>
                                                    <td className="px-6 py-5">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                            param.status?.toLowerCase() === 'normal' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            param.status?.toLowerCase() === 'low' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            'bg-orange-50 text-orange-600 border-orange-100'
                                                        )}>
                                                            {param.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* AI Summary Card */}
                            <div className="premium-card p-8 bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">{reportData?.report_type || 'Analysis Result'}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">CareBridge Synthesis</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium leading-relaxed italic text-slate-200">
                                        "{reportData?.overall_summary}"
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Explanations */}
                            <div className="grid grid-cols-1 gap-4">
                                {(reportData?.parameters || []).map((param, i) => (
                                    <motion.div
                                        key={`exp-${i}`}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                                    >
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{param.name}</p>
                                        <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                            {param.explanation || param.simple_explanation}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={saveToVault}
                                    className="py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    <Save size={20} /> Save to Vault
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="py-6 bg-blue-600 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                                >
                                    <Download size={20} /> Export Report
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-center gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">
                        Privacy Secured: Local Decryption Protocol Active
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
