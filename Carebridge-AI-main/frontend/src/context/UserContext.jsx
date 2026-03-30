import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        // Check if we were in demo mode previously
        const savedDemo = localStorage.getItem('carebridge_demo_mode');
        if (savedDemo === 'true') {
            setIsDemo(true);
            setUser({
                uid: 'demo-user-123',
                displayName: 'Demo User',
                email: 'demo@carebridge.ai',
                photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
            });
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
                setIsDemo(false);
            } else if (!isDemo) {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginAsDemo = () => {
        const demoUser = {
            uid: 'demo-user-123',
            displayName: 'Demo User',
            email: 'demo@carebridge.ai',
            photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
        };
        setUser(demoUser);
        setIsDemo(true);
        localStorage.setItem('carebridge_demo_mode', 'true');
    };

    const logout = async () => {
        if (isDemo) {
            setIsDemo(false);
            setUser(null);
            localStorage.removeItem('carebridge_demo_mode');
        } else {
            await firebaseSignOut(auth);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, isDemo, loginAsDemo, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
