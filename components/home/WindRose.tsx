import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText, Line, G, Path } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

interface WindRoseProps {
  direction: string;
  speed: number;
  size?: number;
}

const directionToDegrees: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

export function WindRose({ direction, speed, size = 80 }: WindRoseProps) {
  const degrees = directionToDegrees[direction] || 0;

  const getIntensityColor = () => {
    if (speed < 5) return 'rgba(255,255,255,0.5)';
    if (speed < 10) return 'rgba(255,255,255,0.7)';
    if (speed < 15) return 'rgba(245,184,0,0.8)';
    return Colors.mallardYellow;
  };

  const cardinalDirs = ['N', 'E', 'S', 'W'];

  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
        />

        {cardinalDirs.map((dir, i) => {
          const angle = i * 90;
          const rad = (angle - 90) * (Math.PI / 180);
          const x = 50 + 38 * Math.cos(rad);
          const y = 50 + 38 * Math.sin(rad);
          return (
            <SvgText
              key={dir}
              x={x}
              y={y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="8"
              fontWeight="bold"
            >
              {dir}
            </SvgText>
          );
        })}

        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle - 90) * (Math.PI / 180);
          const x1 = 50 + 42 * Math.cos(rad);
          const y1 = 50 + 42 * Math.sin(rad);
          const x2 = 50 + 45 * Math.cos(rad);
          const y2 = 50 + 45 * Math.sin(rad);
          return (
            <Line
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

        <G rotation={degrees} origin="50, 50">
          <Path
            d="M50 15 L54 35 L52 35 L52 55 L48 55 L48 35 L46 35 Z"
            fill={getIntensityColor()}
          />
        </G>

        <Circle cx="50" cy="50" r="14" fill="rgba(0,0,0,0.3)" />
        <SvgText
          x="50"
          y="48"
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={Colors.white}
          fontSize="11"
          fontWeight="bold"
        >
          {speed}
        </SvgText>
        <SvgText
          x="50"
          y="57"
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize="6"
          fontWeight="500"
        >
          MPH
        </SvgText>
      </Svg>
    </View>
  );
}
