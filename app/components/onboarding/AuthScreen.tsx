"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { OnboardingScreen, pageVariants, pageTransition } from "./OnboardingScreen";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, User, AlertCircle } from "lucide-react";

interface AuthScreenProps {
    onComplete: () => void;
    onSkip: () => void;
    currentStep: number;
    totalSteps: number;
}

export function AuthScreen({ onComplete, onSkip, currentStep, totalSteps }: AuthScreenProps) {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithGoogle();
            onComplete();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to sign in with Google";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (isSignUp && password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }
            onComplete();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Authentication failed";
            // Clean up Firebase error messages
            if (message.includes("auth/invalid-credential")) {
                setError("Invalid email or password");
            } else if (message.includes("auth/email-already-in-use")) {
                setError("An account with this email already exists");
            } else if (message.includes("auth/weak-password")) {
                setError("Password is too weak");
            } else if (message.includes("auth/invalid-email")) {
                setError("Invalid email address");
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingScreen
            currentStep={currentStep}
            totalSteps={totalSteps}
            onSkip={onSkip}
            showSkip={false}
        >
            <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition as import("framer-motion").Transition}
                className="flex-1 flex flex-col justify-center px-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-mallard-green to-mallard-green-light flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSignUp
                            ? "Sign up to sync your data across devices"
                            : "Sign in to access your hunt data"}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors mb-4 disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    {isSignUp && (
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                    </button>
                </form>

                {/* Toggle Sign Up / Sign In */}
                <p className="text-center mt-6 text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError("");
                        }}
                        className="text-primary font-medium hover:underline"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </motion.div>
        </OnboardingScreen>
    );
}
