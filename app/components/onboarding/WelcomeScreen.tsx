"use client";

import { useEffect, useState } from "react";

interface WelcomeScreenProps {
    onComplete: () => void;
    autoAdvanceMs?: number;
}

export function WelcomeScreen({ onComplete, autoAdvanceMs = 3000 }: WelcomeScreenProps) {
    const [showTagline, setShowTagline] = useState(false);
    const [logoLanded, setLogoLanded] = useState(false);

    useEffect(() => {
        // Logo lands after 400ms
        const logoTimer = setTimeout(() => setLogoLanded(true), 400);
        // Tagline appears after logo lands
        const taglineTimer = setTimeout(() => setShowTagline(true), 800);
        // Auto-advance after delay
        const advanceTimer = setTimeout(onComplete, autoAdvanceMs);

        return () => {
            clearTimeout(logoTimer);
            clearTimeout(taglineTimer);
            clearTimeout(advanceTimer);
        };
    }, [onComplete, autoAdvanceMs]);

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
            onClick={onComplete}
        >
            {/* Dawn gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-dawn via-sky-morning to-water-blue" />

            {/* Decorative cattails silhouette at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
                <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
                    <path
                        d="M0 100 L0 70 Q10 65 15 40 Q17 30 15 20 Q20 25 22 40 Q25 65 35 70 L35 100 Z"
                        fill="currentColor"
                        className="text-mallard-green"
                    />
                    <path
                        d="M50 100 L50 60 Q55 55 58 30 Q60 20 58 10 Q63 15 65 30 Q68 55 75 60 L75 100 Z"
                        fill="currentColor"
                        className="text-mallard-green"
                    />
                    <path
                        d="M320 100 L320 75 Q325 70 328 50 Q330 40 328 30 Q333 35 335 50 Q338 70 345 75 L345 100 Z"
                        fill="currentColor"
                        className="text-mallard-green"
                    />
                    <path
                        d="M370 100 L370 65 Q375 60 378 35 Q380 25 378 15 Q383 20 385 35 Q388 60 395 65 L395 100 Z"
                        fill="currentColor"
                        className="text-mallard-green"
                    />
                </svg>
            </div>

            {/* Star decorations */}
            <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse" />
            <div className="absolute top-32 right-24 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-16 right-32 w-1 h-1 bg-white rounded-full opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Content */}
            <div className="relative flex flex-col items-center">
                {/* Animated Logo */}
                <div
                    className={`mb-6 transition-all duration-700 ease-out ${logoLanded
                            ? 'translate-x-0 opacity-100 scale-100'
                            : 'translate-x-24 opacity-0 scale-75'
                        }`}
                >
                    <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                        <img
                            src="/logo.png"
                            alt="Talkin' Timber"
                            className="w-20 h-20 object-contain"
                        />
                    </div>
                </div>

                {/* App Name */}
                <h1
                    className={`text-4xl font-black text-white tracking-tight mb-2 transition-all duration-500 ${logoLanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    style={{ transitionDelay: '200ms' }}
                >
                    TALKIN&apos; TIMBER
                </h1>

                {/* Tagline */}
                <p
                    className={`text-lg text-white/80 font-medium transition-all duration-500 ${showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                >
                    Your hunt, organized.
                </p>
            </div>

            {/* Tap to continue hint */}
            <div
                className={`absolute bottom-20 text-white/50 text-sm transition-opacity duration-500 ${showTagline ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                Tap to continue
            </div>
        </div>
    );
}
