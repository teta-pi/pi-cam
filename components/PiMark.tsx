import React from 'react';
import Svg, { Path, Text } from 'react-native-svg';
import { Colors } from '@/constants/tokens';

type Props = { size?: number; color?: string };

export default function PiMark({ size = 44, color = Colors.purple }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {/* Shield */}
      <Path
        d="M22 3 L6 9 L6 20 C6 31 13 39 22 43 C31 39 38 31 38 20 L38 9 Z"
        fill={color}
        opacity={0.15}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M22 3 L6 9 L6 20 C6 31 13 39 22 43 C31 39 38 31 38 20 L38 9 Z"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* π glyph */}
      <Text
        x="22"
        y="28"
        fontSize="16"
        fontWeight="700"
        fill={color}
        textAnchor="middle"
        fontFamily="-apple-system, system-ui"
      >
        π
      </Text>
    </Svg>
  );
}
