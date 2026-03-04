import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration: number = 1000): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    startTime.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTime.current || now);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        animFrameId.current = requestAnimationFrame(animate);
      }
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [target, duration]);

  return value;
}
