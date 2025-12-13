"use client";

interface WindRoseProps {
    direction: string; // N, NE, E, SE, S, SW, W, NW
    speed: number;
    className?: string;
}

// Convert wind direction to degrees
const directionToDegrees: Record<string, number> = {
    "N": 0,
    "NNE": 22.5,
    "NE": 45,
    "ENE": 67.5,
    "E": 90,
    "ESE": 112.5,
    "SE": 135,
    "SSE": 157.5,
    "S": 180,
    "SSW": 202.5,
    "SW": 225,
    "WSW": 247.5,
    "W": 270,
    "WNW": 292.5,
    "NW": 315,
    "NNW": 337.5,
};

export function WindRose({ direction, speed, className = "" }: WindRoseProps) {
    const degrees = directionToDegrees[direction] || 0;

    // Determine intensity based on wind speed
    const getIntensityColor = () => {
        if (speed < 5) return "text-white/50";
        if (speed < 10) return "text-white/70";
        if (speed < 15) return "text-mallard-yellow/80";
        return "text-mallard-yellow";
    };

    return (
        <div className={`relative ${className}`}>
            {/* Compass background */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Outer ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                />

                {/* Cardinal direction markers */}
                {["N", "E", "S", "W"].map((dir, i) => {
                    const angle = i * 90;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const x = 50 + 38 * Math.cos(rad);
                    const y = 50 + 38 * Math.sin(rad);
                    return (
                        <text
                            key={dir}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-white/40 text-[8px] font-bold"
                        >
                            {dir}
                        </text>
                    );
                })}

                {/* Tick marks for 8 directions */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const rad = (angle - 90) * (Math.PI / 180);
                    const x1 = 50 + 42 * Math.cos(rad);
                    const y1 = 50 + 42 * Math.sin(rad);
                    const x2 = 50 + 45 * Math.cos(rad);
                    const y2 = 50 + 45 * Math.sin(rad);
                    return (
                        <line
                            key={angle}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1.5"
                        />
                    );
                })}

                {/* Wind direction arrow */}
                <g
                    transform={`rotate(${degrees}, 50, 50)`}
                    className="transition-transform duration-700 ease-out"
                >
                    {/* Arrow body */}
                    <path
                        d="M50 15 L54 35 L52 35 L52 55 L48 55 L48 35 L46 35 Z"
                        className={`${getIntensityColor()} fill-current`}
                    />
                    {/* Arrow glow effect for strong winds */}
                    {speed >= 15 && (
                        <path
                            d="M50 15 L54 35 L52 35 L52 55 L48 55 L48 35 L46 35 Z"
                            className="fill-mallard-yellow/30 blur-sm"
                        />
                    )}
                </g>

                {/* Center circle with speed */}
                <circle
                    cx="50"
                    cy="50"
                    r="14"
                    fill="rgba(0,0,0,0.3)"
                    className="backdrop-blur-sm"
                />
                <text
                    x="50"
                    y="48"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-[11px] font-bold"
                >
                    {speed}
                </text>
                <text
                    x="50"
                    y="57"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white/60 text-[6px] font-medium"
                >
                    MPH
                </text>
            </svg>
        </div>
    );
}
