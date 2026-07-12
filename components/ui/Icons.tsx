import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polygon, Polyline, Ellipse, G } from 'react-native-svg';

type IconProps = {
  size?: number;
  color?: string;
  stroke?: number;
  fill?: string;
};

const icon =
  (children: (p: IconProps) => React.ReactNode) =>
  ({ size = 24, color = 'currentColor', stroke = 1.8, fill = 'none' }: IconProps) =>
    (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {children({ size, color, stroke, fill })}
      </Svg>
    );

export const CameraIcon = icon(() => (
  <>
    <Path d="M14.5 4h-5l-1.5 2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3z" />
    <Circle cx="12" cy="13" r="3.5" />
  </>
));

export const VideoIcon = icon(() => (
  <>
    <Rect x="3" y="6" width="13" height="12" rx="2" />
    <Path d="m16 10 5-3v10l-5-3z" />
  </>
));

export const ZapIcon = icon(() => <Polygon points="13 2 4 14 11 14 10 22 19 10 12 10 13 2" />);

export const ZapOffIcon = icon(() => (
  <>
    <Polyline points="12.41 6.75 13 2 10.57 4.92" />
    <Polyline points="18.57 12.91 21 10 15.66 10" />
    <Polyline points="8 8 3 14 12 14 11 22 16 16" />
    <Line x1="2" y1="2" x2="22" y2="22" />
  </>
));

export const FlipIcon = icon(() => (
  <>
    <Path d="M23 4v6h-6" />
    <Path d="M1 20v-6h6" />
    <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </>
));

export const ShieldIcon = icon(() => <Path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" />);

export const ShieldCheckIcon = icon(() => (
  <>
    <Path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" />
    <Path d="m8.5 12 2.5 2.5L15.5 10" />
  </>
));

export const ShieldXIcon = icon(() => (
  <>
    <Path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" />
    <Path d="m9 9 6 6M15 9l-6 6" />
  </>
));

export const ImageIcon = icon(() => (
  <>
    <Rect x="3" y="3" width="18" height="18" rx="2" />
    <Circle cx="9" cy="9" r="2" />
    <Path d="m21 15-5-5L5 21" />
  </>
));

export const ShareIcon = icon(() => (
  <>
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
  </>
));

export const SettingsIcon = icon(() => (
  <>
    <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    <Circle cx="12" cy="12" r="3" />
  </>
));

export const KeyIcon = icon(() => (
  <>
    <Circle cx="7.5" cy="15.5" r="3.5" />
    <Path d="M10 13 21 2M16 7l3 3M14 9l2 2" />
  </>
));

export const FileJsonIcon = icon(() => (
  <>
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6" />
    <Path d="M10 12c-1 0-2 .5-2 2v1c0 .5-.5 1-1 1m3 4c-1 0-2-.5-2-2v-1c0-.5-.5-1-1-1M14 12c1 0 2 .5 2 2v1c0 .5.5 1 1 1m-3 4c1 0 2-.5 2-2v-1c0-.5.5-1 1-1" />
  </>
));

export const CloudUpIcon = icon(() => (
  <>
    <Path d="M16 19h2a4 4 0 0 0 .9-7.9 6 6 0 0 0-11.7-.6A4.5 4.5 0 0 0 6 19h2" />
    <Path d="m12 12 4 4M12 12l-4 4M12 12v9" />
  </>
));

export const CheckIcon = icon(() => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Path d="m8.5 12.5 2.5 2.5L15.5 10" />
  </>
));

export const AlertIcon = icon(() => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 8v4M12 16h0" />
  </>
));

export const TrashIcon = icon(() => (
  <>
    <Path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </>
));

export const CalIcon = icon(() => (
  <>
    <Rect x="3" y="4" width="18" height="18" rx="2" />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </>
));

export const DeviceIcon = icon(() => (
  <>
    <Rect x="6" y="2" width="12" height="20" rx="2" />
    <Line x1="11" y1="18" x2="13" y2="18" />
  </>
));

export const PinIcon = icon(() => (
  <>
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <Circle cx="12" cy="10" r="3" />
  </>
));

export const HashIcon = icon(() => (
  <Path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
));

export const ClockIcon = icon(() => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </>
));

export const CopyIcon = icon(() => (
  <>
    <Rect x="9" y="9" width="13" height="13" rx="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>
));

export const CloseIcon = icon(() => <Path d="m6 6 12 12M6 18 18 6" />);
export const BackIcon = icon(() => <Path d="m15 18-6-6 6-6" />);
export const MoreIcon = icon(() => (
  <>
    <Circle cx="5" cy="12" r="1.5" />
    <Circle cx="12" cy="12" r="1.5" />
    <Circle cx="19" cy="12" r="1.5" />
  </>
));

export const PlusIcon = icon(() => <Path d="M12 5v14M5 12h14" />);
export const ChevRightIcon = icon(() => <Path d="m9 18 6-6-6-6" />);
export const ChevDownIcon = icon(() => <Path d="m6 9 6 6 6-6" />);

export const LockIcon = icon(() => (
  <>
    <Rect x="3" y="11" width="18" height="11" rx="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
));

export const UserIcon = icon(() => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="10" r="3" />
    <Path d="M6.5 19a6 6 0 0 1 11 0" />
  </>
));

export const AwardIcon = icon(() => (
  <>
    <Circle cx="12" cy="9" r="6" />
    <Path d="m9 14-1.5 7L12 18l4.5 3L15 14" />
  </>
));

export const SparkleIcon = icon(() => (
  <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2" />
));

export const DropletIcon = icon(() => <Path d="M12 2c-3 4-7 8-7 12a7 7 0 1 0 14 0c0-4-4-8-7-12z" />);

export const DownloadIcon = icon(() => (
  <>
    <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </>
));

export const PlayIcon = icon(() => <Polygon points="6 4 20 12 6 20" />);
export const InfoIcon = icon(() => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4M12 8h0" />
  </>
));

export const FileIcon = icon(() => (
  <>
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Path d="M14 2v6h6" />
  </>
));

export const LinkIcon = icon(() => (
  <>
    <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>
));
