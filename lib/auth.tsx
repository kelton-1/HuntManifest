"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import {
    User,
    getRedirectResult,
    signInWithPopup,
    signInWithRedirect,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGooglePopup: () => Promise<void>;
    signInWithGoogleRedirect: () => Promise<void>;
    signInWithGoogle: () => Promise<"popup" | "redirect">;
    completeGoogleRedirectSignIn: () => Promise<User | null>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

const shouldUseGoogleRedirectFlow = () => {
    if (typeof window === "undefined") {
        return false;
    }

    const userAgent = window.navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroidWebView = /; wv\)|Version\/\d+\.\d+.*Chrome/.test(userAgent);
    const isIOSWebView = isIOS && !/Safari/.test(userAgent);
    const isStandalonePwa = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;

    return isIOS || isAndroidWebView || isIOSWebView || isStandalonePwa;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGooglePopup = useCallback(async () => {
        await signInWithPopup(auth, googleProvider);
    }, []);

    const signInWithGoogleRedirect = useCallback(async () => {
        await signInWithRedirect(auth, googleProvider);
    }, []);

    const signInWithGoogle = useCallback(async (): Promise<"popup" | "redirect"> => {
        if (shouldUseGoogleRedirectFlow()) {
            await signInWithRedirect(auth, googleProvider);
            return "redirect";
        }

        await signInWithPopup(auth, googleProvider);
        return "popup";
    }, []);

    const completeGoogleRedirectSignIn = useCallback(async () => {
        const result = await getRedirectResult(auth);
        return result?.user ?? null;
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    }, []);

    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password);
    }, []);

    const sendPasswordReset = useCallback(async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    }, []);

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        signInWithGooglePopup,
        signInWithGoogleRedirect,
        signInWithGoogle,
        completeGoogleRedirectSignIn,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        sendPasswordReset,
    }), [user, loading, signInWithGooglePopup, signInWithGoogleRedirect, signInWithGoogle, completeGoogleRedirectSignIn, signInWithEmail, signUpWithEmail, signOut, sendPasswordReset]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
