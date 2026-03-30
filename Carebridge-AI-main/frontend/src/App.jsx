import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Onboarding from './components/Onboarding';
import ParticleBackground from './components/ParticleBackground';

// Lazy loading for premium performance
const Home = lazy(() => import('./pages/Home'));
const Symptoms = lazy(() => import('./pages/Symptoms'));
const Reports = lazy(() => import('./pages/Reports'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Metrics = lazy(() => import('./pages/Metrics'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) {
    console.error("Global Neural Error:", error, errorInfo);
    toast.error(`Neural Link Severed: ${error.message}`, { duration: 10000 });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 animate-pulse border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Application Error</h1>
          <p className="text-slate-500 font-medium mb-8 max-w-sm">An unexpected issue occurred. We've logged the error and are ready to recover.</p>
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl mb-8 max-w-lg w-full text-left">
            <p className="text-slate-600 text-[10px] font-mono whitespace-pre-wrap">{this.state.error?.toString()}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
          >
            Reload Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    const onboarded = localStorage.getItem('carebridge_onboarded');
    return !!onboarded;
  });

  const handleOnboardingComplete = (data) => {
    localStorage.setItem('carebridge_onboarded', 'true');
    localStorage.setItem('carebridge_profile', JSON.stringify(data));
    setIsOnboarded(true);
  };

  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-50 relative selection:bg-blue-600 selection:text-white overflow-x-hidden">
          <ParticleBackground />

          <Toaster
            position="top-center"
            toastOptions={{
              className: 'glass-card',
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '16px 24px',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          />

          <AnimatePresence mode="wait">
            {!isOnboarded ? (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Onboarding onComplete={handleOnboardingComplete} />
              </motion.div>
            ) : (
              <motion.div
                key="app-main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10"
              >
                <Suspense fallback={
                  <div className="h-screen flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-[6px] border-slate-100 border-t-blue-600 rounded-[2rem] animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Initializing Core...</p>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/symptoms" element={<Symptoms />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/metrics" element={<Metrics />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </Suspense>
                <Navbar />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
