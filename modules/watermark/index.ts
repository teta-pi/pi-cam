/**
 * WatermarkModule — adds visible Pi CAM badge to shared copies.
 * Phase 1: metadata-only (badge is rendered in UI overlay).
 * Phase 2: pixel-level badge embed using expo-image-manipulator.
 */

export type WatermarkOptions = {
  trustLevel: 'device';
  timestamp: string;
};

export async function applyWatermark(
  fileUri: string,
  _options: WatermarkOptions
): Promise<string> {
  // Phase 1: return original file — badge shown via UI overlay on share.
  // Phase 2: use expo-image-manipulator to composite badge onto image.
  return fileUri;
}
