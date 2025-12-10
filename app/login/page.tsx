"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();

    // State
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Handlers
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithGoogle();
            router.push("/profile"); // Redirect to profile or home
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to sign in with Google";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address to reset your password.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            await sendPasswordReset(email);
            setSuccessMessage("Password reset email sent. Check your inbox.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send reset email";
            if (message.includes("auth/user-not-found")) {
                setError("No account found with this email.");
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

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
            router.push("/profile");
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
        <div className="min-h-screen bg-background pb-20 pt-8 animate-fade-in">
            <div className="max-w-md mx-auto px-6">
                {/* Back Button */}
                <Link href="/profile" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Profile
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-mallard-green to-mallard-green-light flex items-center justify-center mb-6 shadow-lg">
                        <User className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSignUp
                            ? "Sign up to sync your gear and hunts"
                            : "Sign in to access your cloud data"}
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full h-14 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-all mb-6 flex items-center justify-center gap-3 font-medium tap-highlight disabled:opacity-50 shadow-sm"
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
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Or continue with email</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-4 relative">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 h-14 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                                className="w-full pl-12 pr-4 h-14 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                        {isSignUp && (
                            <div className="relative animate-slide-up">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 h-14 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {!isSignUp && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-primary font-medium hover:underline focus:outline-none"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-mallard-green to-mallard-green-light text-white rounded-xl font-bold text-lg hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                    </button>
                </form>

                {/* Toggle Sign Up / Sign In */}
                <p className="text-center mt-8 text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError("");
                            setSuccessMessage("");
                        }}
                        className="text-primary font-bold hover:underline"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
