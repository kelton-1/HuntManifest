"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from 0 to the target value.
 */
export function useCountUp(target: number, duration: number = 1200) {
    const [value, setValue] = useState(0);
    const frameRef = useRef<number>(0);
    const startRef = useRef<number>(0);

    useEffect(() => {
        if (target === 0) {
            setValue(0);
            return;
        }

        startRef.current = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration]);

    return value;
}
