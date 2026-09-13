// ─── Muscle Heatmap Color System ────────────────────────────────────
// Multi-tier intensity coloring with smooth transitions for the body heatmap.
// Maps intensity (0–100) to a color from muted surface → vibrant #4080E7 blue glow.

export interface MuscleColorResult {
  fill: string;
  stroke: string;
  glowRadius: number; // 0 = no glow, >0 = feGaussianBlur stdDeviation
  glowOpacity: number;
}

/**
 * Returns fill/stroke/glow config for a given intensity value (0–100).
 */
export function getMuscleColorForIntensity(intensity: number): MuscleColorResult {
  if (intensity <= 0) {
    // Never trained — subtle dark surface
    return {
      fill: 'rgba(255, 255, 255, 0.05)',
      stroke: 'rgba(255, 255, 255, 0.12)',
      glowRadius: 0,
      glowOpacity: 0,
    };
  }

  if (intensity <= 25) {
    // Lightly trained — soft accent blue
    const t = intensity / 25;
    const alpha = 0.20 + t * 0.15;
    return {
      fill: `rgba(64, 128, 231, ${alpha.toFixed(2)})`,
      stroke: `rgba(64, 128, 231, ${(alpha + 0.15).toFixed(2)})`,
      glowRadius: 0,
      glowOpacity: 0,
    };
  }

  if (intensity <= 50) {
    // Moderately trained — medium accent blue
    const t = (intensity - 25) / 25;
    const alpha = 0.35 + t * 0.25;
    return {
      fill: `rgba(64, 128, 231, ${alpha.toFixed(2)})`,
      stroke: `rgba(64, 128, 231, ${(alpha + 0.15).toFixed(2)})`,
      glowRadius: 1,
      glowOpacity: 0.15,
    };
  }

  if (intensity <= 75) {
    // Highly trained — bright accent blue
    const t = (intensity - 50) / 25;
    const alpha = 0.60 + t * 0.25;
    return {
      fill: `rgba(64, 128, 231, ${alpha.toFixed(2)})`,
      stroke: `rgba(64, 128, 231, ${(alpha + 0.15).toFixed(2)})`,
      glowRadius: 2.5,
      glowOpacity: 0.3,
    };
  }

  // Most trained (76–100) — full #4080E7 accent with glowing highlight
  const t = (intensity - 75) / 25;
  const alpha = 0.85 + t * 0.15;
  return {
    fill: `rgba(64, 128, 231, ${alpha.toFixed(2)})`,
    stroke: `rgba(64, 128, 231, ${Math.min(alpha + 0.15, 1).toFixed(2)})`,
    glowRadius: 3 + t * 2,
    glowOpacity: 0.4 + t * 0.2,
  };
}

/**
 * Legend stops for the gradient bar
 */
export const HEATMAP_LEGEND_STOPS = [
  { label: 'None', color: 'rgba(255, 255, 255, 0.08)' },
  { label: 'Light', color: 'rgba(64, 128, 231, 0.30)' },
  { label: 'Medium', color: 'rgba(64, 128, 231, 0.55)' },
  { label: 'High', color: 'rgba(64, 128, 231, 0.80)' },
  { label: 'Max', color: '#4080E7' },
];

