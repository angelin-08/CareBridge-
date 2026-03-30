import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Languages, Play, Square, Sparkles, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '../utils';
import { useLanguage } from '../context/LanguageContext';

const VoiceWaveform = ({ isActive }) => {
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);

    const stopAudio = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;

        const renderFrame = () => {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#8b5cf6');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

                x += barWidth;
            }
        };
        renderFrame();
    };

    const initAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            draw();
        } catch (err) {
            console.error("Audio init error:", err);
        }
    };

    useEffect(() => {
        if (isActive) {
            initAudio();
        } else {
            stopAudio();
        }
        return () => stopAudio();
    }, [isActive]);

    return (
        <div className="w-full h-12 flex items-center justify-center overflow-hidden rounded-xl opacity-80">
            <canvas ref={canvasRef} width="300" height="48" className="w-full h-full" />
        </div>
    );
};

const VoiceInput = ({ onTranscriptComplete }) => {
    const { language, toggleLanguage } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    const fullLangCode = language === 'ta' ? 'ta-IN' : 'en-US';

    const startRecording = () => {
        setTranscript('');
        setIsRecording(true);
        try {
            recognitionRef.current.start();
            toast.success('System is listening...', {
                icon: '🎤',
                style: { borderRadius: '20px', background: '#0f172a', color: '#fff' }
            });
        } catch (err) {
            console.error('Failed to start recognition:', err);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        if (transcript) {
            onTranscriptComplete(transcript, language);
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice system unavailable in this browser.', { icon: '🚫' });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // As requested
        recognition.interimResults = true;
        recognition.lang = fullLangCode;

        recognition.onresult = (event) => {
            let currentText = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentText += event.results[i][0].transcript;
            }
            setTranscript(currentText);
            
            // Emergency Detection
            const emergencyTrigger = /chest pain|heart attack|breathing|மார்பு வலி|மூச்சு திணறல்/i.test(currentText);
            if (emergencyTrigger) {
                recognition.stop();
                onTranscriptComplete(currentText, language);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                toast.error('Permission denied', { icon: '🔒' });
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            if (transcript.trim() && !isRecording) {
                 onTranscriptComplete(transcript, language);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language, transcript]); // Added transcript to ensure closure has latest

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="premium-card p-10 flex flex-col items-center gap-8 max-w-lg mx-auto overflow-hidden relative"
        >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />

            <div className="w-full flex justify-between items-center relative z-10">
                <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                        Neural Input
                    </h2>
                    <p className="text-xl font-black text-slate-900 leading-tight">
                        {language === 'ta' ? 'உங்கள் உடல்நிலை சொல்லுங்கள்' : 'Describe your feelings'}
                    </p>
                </div>
                <button
                    onClick={toggleLanguage}
                    className="p-3 px-5 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                    <Globe size={18} className="text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-widest">{language === 'ta' ? 'தமிழ்' : 'English'}</span>
                </button>
            </div>

            <div className="relative py-4 w-full h-48 flex items-center justify-center">
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.05, 0.1] }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-blue-600 rounded-full blur-3xl"
                        />
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                        "w-36 h-36 rounded-[3rem] flex items-center justify-center transition-all duration-500 relative z-10 shadow-2xl",
                        isRecording
                            ? 'bg-slate-900 text-white shadow-blue-500/20'
                            : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/40'
                    )}
                >
                    {isRecording ? (
                        <Square size={40} className="fill-white" />
                    ) : (
                        <Mic size={40} />
                    )}

                    {isRecording && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="absolute inset-0 border-4 border-dashed border-white/20 rounded-[3.5rem]"
                        />
                    )}
                </motion.button>
            </div>

            {isRecording && <VoiceWaveform isActive={isRecording} />}

            <div className="w-full relative z-10">
                <div className={cn(
                    "min-h-[140px] w-full p-8 rounded-[2.5rem] transition-all duration-500 border-2",
                    isRecording
                        ? 'border-blue-100 bg-blue-50/30'
                        : 'border-slate-50 bg-slate-50/50'
                )}>
                    {transcript ? (
                        <p className="text-slate-800 leading-relaxed text-lg font-bold italic text-center">
                            "{transcript}"
                        </p>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 py-6">
                            <Activity size={32} className="mb-4 opacity-20" />
                            <p className="font-extrabold uppercase tracking-widest text-[10px]">
                                {isRecording ? 'Listening carefully...' : 'Push to initiate checkup'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-2 bg-slate-100/50 rounded-full border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">
                    Real-time Acoustic Analysis
                </p>
            </div>
        </motion.div>
    );
};

export default VoiceInput;
