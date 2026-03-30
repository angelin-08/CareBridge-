import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle, RefreshCw, MessageCircle, Mic, Volume2, VolumeX, Speaker } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '../services/aiService';
import { cn } from '../utils';
import { useLanguage } from '../context/LanguageContext';

const Chatbot = ({ initialText = '', onEmergencyDetected }) => {
    const { language, toggleLanguage } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    const isTamil = language === 'ta';

    const quickReplies = [
        { en: "I have fever", ta: "எனக்கு காய்ச்சல்" },
        { en: "I feel dizzy", ta: "தலைச்சுற்றல்" },
        { en: "Chest pain", ta: "மார்பு வலி" },
        { en: "Body pain", ta: "உடல் வலி" }
    ];

    useEffect(() => {
        if (initialText) {
            setInputText(initialText);
        }
    }, [initialText]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Text to Speech Function
    const speakResponse = (text) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        const isTamilText = /[\u0B80-\u0BFF]/.test(text);
        utterance.lang = isTamilText ? 'ta-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang === utterance.lang);
        if (preferredVoice) utterance.voice = preferredVoice;
        
        window.speechSynthesis.speak(utterance);
    };

    // Speech to Text Implementation
    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('Voice not supported. Please use Chrome browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = isTamil ? 'ta-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setInputText(transcript);
        };
        
        recognition.onend = () => {
            setIsListening(false);
            // Auto send after short delay to let state update
            setTimeout(() => {
                const currentInput = document.getElementById('chat-input')?.value;
                if (currentInput) handleSend(currentInput);
            }, 500);
        };
        
        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'not-allowed') {
                alert('Microphone blocked. Allow mic in browser settings.');
            }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;

        const newUserMessage = { role: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, newUserMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // Pass full conversation history
            const response = await chatWithAI(text, messages, language);
            
            const aiMessage = { 
                role: 'ai', 
                text: response.text, 
                isEmergency: response.is_emergency,
                timestamp: new Date() 
            };
            
            setMessages(prev => [...prev, aiMessage]);
            
            // Auto speak the response
            speakResponse(response.text);

            if (response.is_emergency && onEmergencyDetected) {
                onEmergencyDetected(response);
            }
        } catch (err) {
            console.error("Chat error:", err);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto premium-card bg-white flex flex-col h-[650px] overflow-hidden shadow-2xl relative"
        >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-tight leading-none mb-1">CareBridge AI</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Medical Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                    >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <button 
                        onClick={toggleLanguage}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[9px] font-black uppercase tracking-widest border border-white/10"
                    >
                        {isTamil ? 'English' : 'தமிழ்'}
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                        <MessageCircle size={48} className="text-slate-300" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start a conversation</p>
                    </div>
                )}
                
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.role === 'user' ? "ml-auto items-end" : "items-start"
                        )}
                    >
                        <div className={cn(
                            "p-4 rounded-3xl text-sm font-medium shadow-sm relative group",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-tr-none" 
                                : cn("bg-white text-slate-900 border border-slate-100 rounded-tl-none", 
                                     msg.isEmergency && "bg-red-50 border-red-200 text-red-700")
                        )}>
                            {msg.isEmergency && <AlertCircle size={14} className="inline mr-2 text-red-500" />}
                            {msg.text}
                            
                            {msg.role === 'ai' && (
                                <button 
                                    onClick={() => speakResponse(msg.text)}
                                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-100 text-slate-400 hover:text-blue-600 shadow-sm"
                                >
                                    <Speaker size={12} />
                                </button>
                            )}
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </motion.div>
                ))}
                
                {isTyping && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <div className="flex gap-1 bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                            {[1, 2, 3].map(j => (
                                <motion.div
                                    key={j}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: j * 0.2 }}
                                    className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {quickReplies.map((reply, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(isTamil ? reply.ta : reply.en)}
                            className="shrink-0 px-4 py-2 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 transition-all active:scale-95"
                        >
                            {isTamil ? reply.ta : reply.en}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 relative">
                    <div className="flex-1 relative">
                        <input
                            id="chat-input"
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isTamil ? "இங்கே டைப் செய்யவும்..." : "Ask CareBridge AI..."}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 pr-14 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-300"
                        />
                        <button
                            onClick={startVoiceInput}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                isListening ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            )}
                        >
                            <Mic size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputText.trim()}
                        className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all active:scale-90 shadow-xl disabled:opacity-20 flex-shrink-0"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Chatbot;
