"use client";

import { useMemo } from "react";
import { SkyCondition } from "@/lib/types";

interface AuroraBackgroundProps {
  skyCondition?: SkyCondition | null;
}

function getAuroraColors(condition?: SkyCondition | null) {
  switch (condition) {
    case "Rain":
      return {
        slow: "radial-gradient(ellipse at 50% 50%, #1e3a5f 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #334155 0%, transparent 50%)",
        mid: "radial-gradient(ellipse at 80% 20%, #475569 0%, transparent 50%), conic-gradient(from 90deg at 50% 50%, transparent 0%, #475569 15%, transparent 30%)",
        fast: "radial-gradient(circle at 40% 60%, #64748b 0%, transparent 30%), conic-gradient(from 270deg at 50% 50%, transparent 0%, #94a3b8 5%, transparent 15%)",
        slowOpacity: 0.14,
        midOpacity: 0.12,
        fastOpacity: 0.10,
      };
    case "Snow":
      return {
        slow: "radial-gradient(ellipse at 50% 50%, #1e3a5f 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #e2e8f0 0%, transparent 50%)",
        mid: "radial-gradient(ellipse at 80% 20%, #cbd5e1 0%, transparent 50%), conic-gradient(from 90deg at 50% 50%, transparent 0%, #94a3b8 15%, transparent 30%)",
        fast: "radial-gradient(circle at 40% 60%, #f1f5f9 0%, transparent 30%), conic-gradient(from 270deg at 50% 50%, transparent 0%, #e2e8f0 5%, transparent 15%)",
        slowOpacity: 0.12,
        midOpacity: 0.10,
        fastOpacity: 0.08,
      };
    case "Overcast":
    case "Partly Cloudy":
      return {
        slow: "radial-gradient(ellipse at 50% 50%, #0B3D2E 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #166653 0%, transparent 50%)",
        mid: "radial-gradient(ellipse at 80% 20%, #334155 0%, transparent 50%), conic-gradient(from 90deg at 50% 50%, transparent 0%, #166653 15%, transparent 30%)",
        fast: "radial-gradient(circle at 40% 60%, #94a3b8 0%, transparent 30%), conic-gradient(from 270deg at 50% 50%, transparent 0%, #F5B800 5%, transparent 15%)",
        slowOpacity: 0.16,
        midOpacity: 0.12,
        fastOpacity: 0.10,
      };
    case "Fog":
      return {
        slow: "radial-gradient(ellipse at 50% 50%, #64748b 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #475569 0%, transparent 50%)",
        mid: "radial-gradient(ellipse at 80% 20%, #94a3b8 0%, transparent 50%), conic-gradient(from 90deg at 50% 50%, transparent 0%, #cbd5e1 15%, transparent 30%)",
        fast: "radial-gradient(circle at 40% 60%, #e2e8f0 0%, transparent 30%), conic-gradient(from 270deg at 50% 50%, transparent 0%, #f1f5f9 5%, transparent 15%)",
        slowOpacity: 0.10,
        midOpacity: 0.08,
        fastOpacity: 0.06,
      };
    default: // Clear
      return {
        slow: "radial-gradient(ellipse at 50% 50%, #0B3D2E 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #166653 0%, transparent 50%)",
        mid: "radial-gradient(ellipse at 80% 20%, #166653 0%, transparent 50%), conic-gradient(from 90deg at 50% 50%, transparent 0%, #166653 15%, transparent 30%)",
        fast: "radial-gradient(circle at 40% 60%, #F5B800 0%, transparent 30%), conic-gradient(from 270deg at 50% 50%, transparent 0%, #F5B800 5%, transparent 15%)",
        slowOpacity: 0.18,
        midOpacity: 0.15,
        fastOpacity: 0.20,
      };
  }
}

export function AuroraBackground({ skyCondition }: AuroraBackgroundProps) {
  const colors = useMemo(() => getAuroraColors(skyCondition), [skyCondition]);

  return (
    <div className="aurora-bg" aria-hidden="true">
      <div
        className="aurora-layer aurora-band-slow"
        style={{ background: colors.slow, opacity: colors.slowOpacity }}
      />
      <div
        className="aurora-layer aurora-band-mid"
        style={{ background: colors.mid, opacity: colors.midOpacity }}
      />
      <div
        className="aurora-layer aurora-band-fast"
        style={{ background: colors.fast, opacity: colors.fastOpacity }}
      />
    </div>
  );
}
