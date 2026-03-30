import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, X, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ocrService } from '../services/ocrService';
import toast from 'react-hot-toast';
import { cn } from '../utils';

const ReportUpload = ({ onAnalysisComplete }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selected);
            toast.success('Document scanned', {
                icon: '📄',
                style: { borderRadius: '20px', background: '#0f172a', color: '#fff' }
            });
            // Auto trigger upload/analysis after short delay for UX
            setTimeout(() => {
                handleUpload(selected);
            }, 1000);
        }
    };

    const handleUpload = async (fileToUse = file) => {
        const targetFile = fileToUse || file;
        if (!targetFile) return;
        setLoading(true);
        try {
            const text = await ocrService.extractTextFromImage(targetFile, (p) => {
                setProgress(Math.round(p * 100));
            });
            onAnalysisComplete(text);
        } catch (err) {
            console.error(err);
            toast.error('Scan failed. Please try again.');
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const clear = () => {
        setFile(null);
        setPreview(null);
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="premium-card p-10 max-w-lg mx-auto relative overflow-hidden"
        >
            {/* Background Hint */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50" />

            <div className="text-center mb-10">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                    Advanced Vision
                </h2>
                <p className="text-2xl font-black text-slate-900">
                    Medical Intelligence
                </p>
                <p className="text-xs font-bold text-slate-500 mt-2">
                    Upload prescriptions or lab reports for AI insight.
                </p>
            </div>

            {!preview ? (
                <label className="group block cursor-pointer">
                    <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-12 transition-all duration-500 hover:border-blue-200 hover:bg-blue-50/20 flex flex-col items-center justify-center relative">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white shadow-sm">
                            <Upload size={40} className="transition-transform" />
                        </div>
                        <p className="text-slate-900 font-extrabold text-lg mb-1">Click to Scan</p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Supports JPG, PNG, PDF</p>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
                    </div>
                </label>
            ) : (
                <div className="space-y-8">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white aspect-[4/3] group">
                        <img src={preview} alt="preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                            onClick={clear}
                            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-slate-900 shadow-xl hover:bg-white transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <ImageIcon size={20} />
                            </div>
                            <p className="text-white font-black text-sm drop-shadow-md">Current Selection</p>
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className={cn(
                            "w-full py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-95 overflow-hidden relative shadow-2xl shadow-blue-500/20",
                            loading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                <span>Analyzing Intelligence {progress}%</span>
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </>
                        ) : (
                            <>
                                <Sparkles size={24} className="text-blue-400" />
                                <span>Initiate Deep Scan</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={clear}
                        className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                    >
                        Switch Document
                    </button>
                </div>
            )}

            <div className="mt-10 flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 size={14} className="text-green-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    Military-grade OCR Processing
                </p>
            </div>
        </motion.div>
    );
};

export default ReportUpload;
