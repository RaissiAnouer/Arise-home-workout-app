import React from 'react';
import { Platform } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { getMuscleColorForIntensity } from './muscleColors';
import type { MuscleHeatmapEntry } from '../../../services/ReportsService';
import type { BodySVGProps } from './FrontBodySVG';

// ─── ViewBox: 0 0 200 440 ──────────────────────────────────────────
// Premium anatomical back human body — athletic proportions.
// Mirrors the front view silhouette with back-specific muscle groups.

// ─── Body Outline (same silhouette as front) ────────────────────────
const HEAD = 'M100,12 C112,12 121,22 121,36 C121,50 112,60 100,60 C88,60 79,50 79,36 C79,22 88,12 100,12 Z';
const NECK = 'M92,58 L92,72 L108,72 L108,58';

const TORSO_OUTLINE =
  'M92,72 Q82,74 72,78 Q60,84 52,94 Q46,104 44,116' +
  ' Q42,128 40,140 Q38,154 36,168 Q34,180 32,192' +
  ' Q30,204 29,212 Q28,220 30,224 Q32,226 36,224 Q38,220 38,212' +
  ' Q40,200 42,188 Q44,176 46,164 Q48,152 50,142' +
  ' Q52,148 54,160 Q56,174 60,186' +
  ' Q64,196 70,204 Q78,212 86,216' +
  ' Q92,220 100,222 Q108,220 114,216' +
  ' Q122,212 130,204 Q136,196 140,186' +
  ' Q144,174 146,160 Q148,148 150,142' +
  ' Q152,152 154,164 Q156,176 158,188 Q160,200 162,212' +
  ' Q162,220 164,224 Q168,226 170,224 Q172,220 171,212 Q170,204 168,192' +
  ' Q166,180 164,168 Q162,154 160,140 Q158,128 156,116' +
  ' Q154,104 148,94 Q140,84 128,78 Q118,74 108,72';

const LEFT_LEG =
  'M86,216 Q84,228 82,244 Q80,262 78,280 Q76,298 76,314' +
  ' Q76,332 76,348 Q76,364 74,380 Q72,396 70,408' +
  ' Q68,418 68,424 Q70,430 74,432 Q78,432 80,428' +
  ' Q82,422 82,412 Q84,398 86,382 Q88,364 90,346' +
  ' Q92,328 94,308 Q96,288 98,268 Q100,248 100,222';

const RIGHT_LEG =
  'M100,222 Q100,248 102,268 Q104,288 106,308 Q108,328 110,346' +
  ' Q112,364 114,382 Q116,398 118,412 Q118,422 120,428' +
  ' Q122,432 126,432 Q130,430 132,424 Q132,418 130,408' +
  ' Q128,396 126,380 Q124,364 124,348 Q124,332 124,314' +
  ' Q124,298 122,280 Q120,262 118,244 Q116,228 114,216';

// ─── Muscle Paths (Back View) ──────────────────────────────────────

const BACK_MUSCLES: { key: string; paths: string[] }[] = [
  // ── Traps (Trapezius) ──
  {
    key: 'Traps',
    paths: [
      // Diamond shape from base of skull to mid-back, spanning to shoulders
      'M92,68 Q88,70 82,74 Q74,80 68,88 Q64,94 62,100 L68,104 Q74,96 82,90 Q88,86 94,84 L100,82 L106,84 Q112,86 118,90 Q126,96 132,104 L138,100 Q136,94 132,88 Q126,80 118,74 Q112,70 108,68 L100,66 Z',
    ],
  },
  // ── Shoulders (Rear Deltoids) ──
  {
    key: 'Shoulders',
    paths: [
      // Left rear delt
      'M68,88 Q60,92 54,100 Q48,110 46,120 Q48,124 50,124 Q54,122 58,116 Q62,108 66,102 L68,100 Q68,96 68,88 Z',
      // Right rear delt
      'M132,88 Q140,92 146,100 Q152,110 154,120 Q152,124 150,124 Q146,122 142,116 Q138,108 134,102 L132,100 Q132,96 132,88 Z',
    ],
  },
  // ── Back (Upper back — Rhomboids + Mid-back) ──
  {
    key: 'Back',
    paths: [
      // Left upper back
      'M68,104 Q72,100 78,96 Q84,92 92,88 L98,86 L100,86 L100,130 Q96,132 92,130 Q86,126 82,120 Q76,114 72,108 Z',
      // Right upper back
      'M132,104 Q128,100 122,96 Q116,92 108,88 L102,86 L100,86 L100,130 Q104,132 108,130 Q114,126 118,120 Q124,114 128,108 Z',
      // Lower back / Erector spinae
      'M88,160 Q92,156 96,154 L100,152 L104,154 Q108,156 112,160 Q114,170 114,182 Q112,192 108,200 L104,206 L100,208 L96,206 L92,200 Q88,192 86,182 Q86,170 88,160 Z',
    ],
  },
  // ── Lats (Latissimus Dorsi) ──
  {
    key: 'Lats',
    paths: [
      // Left lat — broad wing extending from armpit to waist
      'M62,104 L68,104 Q72,110 76,118 Q80,126 84,132 Q88,138 90,144 Q92,150 92,156 L88,160 Q84,162 78,162 Q72,160 66,156 Q60,150 56,142 Q54,134 54,124 Q54,114 58,108 Z',
      // Right lat
      'M138,104 L132,104 Q128,110 124,118 Q120,126 116,132 Q112,138 110,144 Q108,150 108,156 L112,160 Q116,162 122,162 Q128,160 134,156 Q140,150 144,142 Q146,134 146,124 Q146,114 142,108 Z',
    ],
  },
  // ── Triceps ──
  {
    key: 'Triceps',
    paths: [
      // Left tricep — back of upper arm
      'M46,122 Q44,132 42,144 Q42,154 42,162 Q44,166 46,166 Q50,164 52,158 Q52,148 52,138 Q52,128 50,124 Z',
      // Right tricep
      'M154,122 Q156,132 158,144 Q158,154 158,162 Q156,166 154,166 Q150,164 148,158 Q148,148 148,138 Q148,128 150,124 Z',
    ],
  },
  // ── Forearms (Back) ──
  {
    key: 'Forearms',
    paths: [
      // Left forearm
      'M42,166 Q40,176 38,188 Q36,200 34,210 Q34,216 36,218 Q38,218 40,214 Q42,206 44,196 Q46,186 48,176 Q48,170 46,166 Z',
      // Right forearm
      'M158,166 Q160,176 162,188 Q164,200 166,210 Q166,216 164,218 Q162,218 160,214 Q158,206 156,196 Q154,186 152,176 Q152,170 154,166 Z',
    ],
  },
  // ── Glutes ──
  {
    key: 'Glutes',
    paths: [
      // Left glute
      'M66,192 Q70,186 76,182 Q82,180 88,180 Q94,182 98,186 L100,190 L100,214 Q94,218 88,218 Q80,216 74,212 Q68,206 64,198 Z',
      // Right glute
      'M134,192 Q130,186 124,182 Q118,180 112,180 Q106,182 102,186 L100,190 L100,214 Q106,218 112,218 Q120,216 126,212 Q132,206 136,198 Z',
    ],
  },
  // ── Hamstrings ──
  {
    key: 'Hamstrings',
    paths: [
      // Left hamstring
      'M86,220 Q82,228 80,242 Q78,260 76,280 Q76,298 76,312 Q78,318 80,322 Q84,322 86,318 Q88,310 90,298 Q92,284 94,268 Q96,252 98,236 Q100,226 100,222 Q94,220 86,220 Z',
      // Right hamstring
      'M114,220 Q118,228 120,242 Q122,260 124,280 Q124,298 124,312 Q122,318 120,322 Q116,322 114,318 Q112,310 110,298 Q108,284 106,268 Q104,252 102,236 Q100,226 100,222 Q106,220 114,220 Z',
    ],
  },
  // ── Calves (Gastrocnemius — back) ──
  {
    key: 'Calves',
    paths: [
      // Left calf — diamond-shaped gastrocnemius
      'M78,326 Q76,334 76,346 Q76,360 74,376 Q72,390 72,402 Q72,410 74,414 Q76,416 78,414 Q80,408 82,398 Q84,386 86,372 Q88,358 88,344 Q88,334 86,328 Q84,324 80,324 Z',
      // Right calf
      'M122,326 Q124,334 124,346 Q124,360 126,376 Q128,390 128,402 Q128,410 126,414 Q124,416 122,414 Q120,408 118,398 Q116,386 114,372 Q112,358 112,344 Q112,334 114,328 Q116,324 120,324 Z',
    ],
  },
];

function getIntensity(muscle: string, data: MuscleHeatmapEntry[]): number {
  if (!data || !Array.isArray(data)) return 0;
  const entry = data.find((d) => d && d.muscle && d.muscle.toLowerCase() === muscle.toLowerCase());
  return entry ? (entry.intensity ?? 0) : 0;
}

export default function BackBodySVG({ width, height, data, onMusclePress, selectedMuscle }: BodySVGProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 440">
      {/* Body outline */}
      <Path d={HEAD} fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.13)" strokeWidth={0.7} />
      <Path d={NECK} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      <Path d={TORSO_OUTLINE} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.7} strokeLinejoin="round" />
      <Path d={LEFT_LEG} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.7} strokeLinejoin="round" />
      <Path d={RIGHT_LEG} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.7} strokeLinejoin="round" />

      {/* Muscle groups */}
      {BACK_MUSCLES.map(({ key, paths }, groupIdx) => {
        const intensity = getIntensity(key, data);
        const colorResult = getMuscleColorForIntensity(intensity);
        const isSelected = selectedMuscle === key;

        const pressProps = onMusclePress ? (
          Platform.OS === 'web'
            ? { onClick: () => onMusclePress(key) }
            : { onPress: () => onMusclePress(key) }
        ) : {};

        return (
          <G key={`${key}-${groupIdx}`} style={Platform.OS === 'web' && onMusclePress ? ({ cursor: 'pointer' } as any) : undefined}>
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
                key={`${key}-${groupIdx}-${i}`}
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

      {/* Spine line detail */}
      <Path d="M100,68 L100,208" stroke="rgba(255,255,255,0.05)" strokeWidth={0.3} />
      {/* Scapula hints */}
      <Path d="M80,100 Q84,108 88,112 Q92,114 96,114" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} fill="none" />
      <Path d="M120,100 Q116,108 112,112 Q108,114 104,114" stroke="rgba(255,255,255,0.04)" strokeWidth={0.3} fill="none" />
    </Svg>
  );
}
