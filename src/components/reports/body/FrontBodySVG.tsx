import React from 'react';
import { Platform } from 'react-native';
import Svg, { Path, Ellipse, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { getMuscleColorForIntensity } from './muscleColors';
import type { MuscleHeatmapEntry } from '../../../services/ReportsService';

// ─── ViewBox: 0 0 200 440 ──────────────────────────────────────────
// Premium anatomical front human body — athletic proportions.
// Each muscle group is a separate pressable path.

export interface BodySVGProps {
  width: number;
  height: number;
  data: MuscleHeatmapEntry[];
  onMusclePress?: (muscle: string) => void;
  selectedMuscle?: string | null;
}

// ─── Body Outline ───────────────────────────────────────────────────
const HEAD = 'M100,12 C112,12 121,22 121,36 C121,50 112,60 100,60 C88,60 79,50 79,36 C79,22 88,12 100,12 Z';
const NECK = 'M92,58 L92,72 L108,72 L108,58';

const TORSO_OUTLINE =
  // Left shoulder slope
  'M92,72 Q82,74 72,78 Q60,84 52,94 Q46,104 44,116' +
  // Left arm outer
  ' Q42,128 40,140 Q38,154 36,168 Q34,180 32,192' +
  // Left hand area
  ' Q30,204 29,212 Q28,220 30,224 Q32,226 36,224 Q38,220 38,212' +
  // Left arm inner back up
  ' Q40,200 42,188 Q44,176 46,164 Q48,152 50,142' +
  // Left waist
  ' Q52,148 54,160 Q56,174 60,186' +
  // Left hip to inner leg
  ' Q64,196 70,204 Q78,212 86,216' +
  // Crotch
  ' Q92,220 100,222 Q108,220 114,216' +
  // Right hip
  ' Q122,212 130,204 Q136,196 140,186' +
  // Right waist
  ' Q144,174 146,160 Q148,148 150,142' +
  // Right arm inner
  ' Q152,152 154,164 Q156,176 158,188 Q160,200 162,212' +
  // Right hand
  ' Q162,220 164,224 Q168,226 170,224 Q172,220 171,212 Q170,204 168,192' +
  // Right arm outer
  ' Q166,180 164,168 Q162,154 160,140 Q158,128 156,116' +
  // Right shoulder slope
  ' Q154,104 148,94 Q140,84 128,78 Q118,74 108,72';

// Left leg
const LEFT_LEG =
  'M86,216 Q84,228 82,244 Q80,262 78,280 Q76,298 76,314' +
  ' Q76,332 76,348 Q76,364 74,380 Q72,396 70,408' +
  ' Q68,418 68,424 Q70,430 74,432 Q78,432 80,428' +
  ' Q82,422 82,412 Q84,398 86,382 Q88,364 90,346' +
  ' Q92,328 94,308 Q96,288 98,268 Q100,248 100,222';

// Right leg
const RIGHT_LEG =
  'M100,222 Q100,248 102,268 Q104,288 106,308 Q108,328 110,346' +
  ' Q112,364 114,382 Q116,398 118,412 Q118,422 120,428' +
  ' Q122,432 126,432 Q130,430 132,424 Q132,418 130,408' +
  ' Q128,396 126,380 Q124,364 124,348 Q124,332 124,314' +
  ' Q124,298 122,280 Q120,262 118,244 Q116,228 114,216';

// ─── Muscle Paths (Front View) ─────────────────────────────────────

const FRONT_MUSCLES: { key: string; paths: string[] }[] = [
  // ── Chest (Pectorals) ──
  {
    key: 'Chest',
    paths: [
      // Left pec — full fan shape from collarbone to lower chest
      'M92,80 Q86,82 78,88 Q72,94 68,102 Q66,108 68,114 Q72,120 78,124 Q84,126 92,126 Q96,126 98,124 L98,108 Q98,96 96,88 Z',
      // Right pec (mirror)
      'M108,80 Q114,82 122,88 Q128,94 132,102 Q134,108 132,114 Q128,120 122,124 Q116,126 108,126 Q104,126 102,124 L102,108 Q102,96 104,88 Z',
    ],
  },
  // ── Shoulders (Anterior Deltoids) ──
  {
    key: 'Shoulders',
    paths: [
      // Left delt — caps the shoulder
      'M72,78 Q62,84 56,94 Q50,106 48,116 Q50,120 52,120 Q56,118 60,112 Q64,106 68,100 Q72,94 78,88 Q82,84 86,82 L92,80 Q84,76 72,78 Z',
      // Right delt
      'M128,78 Q138,84 144,94 Q150,106 152,116 Q150,120 148,120 Q144,118 140,112 Q136,106 132,100 Q128,94 122,88 Q118,84 114,82 L108,80 Q116,76 128,78 Z',
    ],
  },
  // ── Biceps ──
  {
    key: 'Biceps',
    paths: [
      // Left bicep
      'M48,118 Q46,126 44,136 Q42,148 42,156 Q42,162 44,164 Q48,166 50,162 Q52,154 52,144 Q52,134 52,124 Q52,120 50,118 Z',
      // Right bicep
      'M152,118 Q154,126 156,136 Q158,148 158,156 Q158,162 156,164 Q152,166 150,162 Q148,154 148,144 Q148,134 148,124 Q148,120 150,118 Z',
    ],
  },
  // ── Forearms ──
  {
    key: 'Forearms',
    paths: [
      // Left forearm
      'M42,164 Q40,174 38,186 Q36,198 34,208 Q34,214 36,216 Q38,216 40,212 Q42,204 44,194 Q46,184 48,174 Q48,168 46,164 Z',
      // Right forearm
      'M158,164 Q160,174 162,186 Q164,198 166,208 Q166,214 164,216 Q162,216 160,212 Q158,204 156,194 Q154,184 152,174 Q152,168 154,164 Z',
    ],
  },
  // ── Core / Abs ──
  {
    key: 'Core',
    paths: [
      // Rectus abdominis — 6-pack region
      'M92,126 Q94,126 98,124 L100,124 L102,124 Q106,126 108,126 Q110,134 110,144 Q110,156 108,168 Q106,178 104,186 Q102,192 100,196 Q98,192 96,186 Q94,178 92,168 Q90,156 90,144 Q90,134 92,126 Z',
    ],
  },
  // ── Hip Flexors / Obliques ──
  {
    key: 'Hip Flexors',
    paths: [
      // Left oblique
      'M68,116 Q66,124 64,134 Q62,148 60,162 Q58,176 58,186 Q60,192 64,198 Q70,206 78,212 L86,216 Q88,210 90,200 Q90,192 92,168 Q92,156 92,144 Q90,134 90,126 Q86,126 80,124 Q74,120 68,116 Z',
      // Right oblique
      'M132,116 Q134,124 136,134 Q138,148 140,162 Q142,176 142,186 Q140,192 136,198 Q130,206 122,212 L114,216 Q112,210 110,200 Q110,192 108,168 Q108,156 108,144 Q110,134 110,126 Q114,126 120,124 Q126,120 132,116 Z',
    ],
  },
  // ── Quadriceps ──
  {
    key: 'Quadriceps',
    paths: [
      // Left quad — large front thigh
      'M86,218 Q82,226 80,240 Q78,258 76,278 Q76,296 76,310 Q78,318 80,322 Q84,324 86,320 Q88,312 90,300 Q92,286 94,270 Q96,254 98,238 Q100,226 100,222 Q94,220 86,218 Z',
      // Right quad
      'M114,218 Q118,226 120,240 Q122,258 124,278 Q124,296 124,310 Q122,318 120,322 Q116,324 114,320 Q112,312 110,300 Q108,286 106,270 Q104,254 102,238 Q100,226 100,222 Q106,220 114,218 Z',
    ],
  },
  // ── Calves (Front — Tibialis Anterior) ──
  {
    key: 'Calves',
    paths: [
      // Left calf front
      'M78,326 Q76,336 76,350 Q76,366 74,380 Q72,394 72,404 Q72,412 74,416 Q76,418 78,416 Q80,410 82,400 Q84,388 86,374 Q88,360 88,346 Q88,336 86,328 Q84,324 80,324 Z',
      // Right calf front
      'M122,326 Q124,336 124,350 Q124,366 126,380 Q128,394 128,404 Q128,412 126,416 Q124,418 122,416 Q120,410 118,400 Q116,388 114,374 Q112,360 112,346 Q112,336 114,328 Q116,324 120,324 Z',
    ],
  },
];

function getIntensity(muscle: string, data: MuscleHeatmapEntry[]): number {
  if (!data || !Array.isArray(data)) return 0;
  const entry = data.find((d) => d && d.muscle && d.muscle.toLowerCase() === muscle.toLowerCase());
  return entry ? (entry.intensity ?? 0) : 0;
}

export default function FrontBodySVG({ width, height, data, onMusclePress, selectedMuscle }: BodySVGProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 440">
      {/* Body outline */}
      <Path d={HEAD} fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.13)" strokeWidth={0.7} />
      <Path d={NECK} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      <Path d={TORSO_OUTLINE} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.7} strokeLinejoin="round" />
      <Path d={LEFT_LEG} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.7} strokeLinejoin="round" />
      <Path d={RIGHT_LEG} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.7} strokeLinejoin="round" />

      {/* Muscle groups */}
      {FRONT_MUSCLES.map(({ key, paths }) => {
        const intensity = getIntensity(key, data);
        const colorResult = getMuscleColorForIntensity(intensity);
        const isSelected = selectedMuscle === key;

        const pressProps = onMusclePress ? (
          Platform.OS === 'web'
            ? { onClick: () => onMusclePress(key) }
            : { onPress: () => onMusclePress(key) }
        ) : {};

        return (
          <G key={key} style={Platform.OS === 'web' && onMusclePress ? ({ cursor: 'pointer' } as any) : undefined}>
            {/* Glow layer for high-intensity muscles */}
            {colorResult.glowRadius > 0 && (paths || []).map((d, i) => (
              <Path
                key={`${key}-glow-${i}`}
                d={d}
                fill={colorResult.fill}
                stroke="none"
                opacity={colorResult.glowOpacity * 0.6}
                strokeWidth={colorResult.glowRadius * 2}
              />
            ))}
            {/* Main muscle shape */}
            {(paths || []).map((d, i) => (
              <Path
                key={`${key}-${i}`}
                d={d}
                fill={isSelected ? 'rgba(0, 255, 255, 0.8)' : colorResult.fill}
                stroke={isSelected ? 'rgba(0, 255, 255, 0.9)' : colorResult.stroke}
                strokeWidth={isSelected ? 1 : 0.4}
                strokeLinejoin="round"
                {...pressProps}
              />
            ))}
          </G>
        );
      })}

      {/* Subtle muscle separation lines for detail */}
      {/* Abs division lines */}
      <Path d="M100,130 L100,192" stroke="rgba(255,255,255,0.06)" strokeWidth={0.3} />
      <Path d="M93,140 L107,140" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
      <Path d="M93,154 L107,154" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
      <Path d="M93,168 L107,168" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} />
      {/* Chest separation */}
      <Path d="M100,82 L100,124" stroke="rgba(255,255,255,0.05)" strokeWidth={0.3} />
    </Svg>
  );
}
