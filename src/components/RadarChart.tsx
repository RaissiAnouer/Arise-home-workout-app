import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

export interface Attribute {
  name: string;
  value: number;
}

interface RadarChartProps {
  attributes: Attribute[];
  maxValue?: number;
  size?: number;
}

export default function RadarChart({ attributes, maxValue = 50, size = 260 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 30; // padding for text

  // Calculate polygon points
  const getCoordinatesForValue = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / maxValue) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const totalPoints = attributes.length;

  // Background grid polygons (concentric shapes)
  const bgPolygons = [1, 0.75, 0.5, 0.25].map(scale => {
    const points = attributes.map((_, i) => {
      const coord = getCoordinatesForValue(maxValue * scale, i, totalPoints);
      return `${coord.x},${coord.y}`;
    }).join(' ');
    return points;
  });

  // Value polygon representing actual stats
  const valuePoints = attributes.map((attr, i) => {
    const coord = getCoordinatesForValue(attr.value, i, totalPoints);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Draw background grid polygons */}
        {bgPolygons.map((points, i) => (
          <Polygon
            key={`bg-${i}`}
            points={points}
            fill={i % 2 === 0 ? 'rgba(0, 163, 255, 0.05)' : 'rgba(0, 163, 255, 0.1)'}
            stroke="rgba(0, 163, 255, 0.3)"
            strokeWidth="1"
          />
        ))}

        {/* Draw axis lines from center to outer edge */}
        {attributes.map((_, i) => {
          const coord = getCoordinatesForValue(maxValue, i, totalPoints);
          return (
            <Line
              key={`line-${i}`}
              x1={center}
              y1={center}
              x2={coord.x}
              y2={coord.y}
              stroke="rgba(0, 163, 255, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        {/* Draw filled area for current stats */}
        <Polygon
          points={valuePoints}
          fill="rgba(0, 163, 255, 0.5)"
          stroke="#00A3FF"
          strokeWidth="2"
        />

        {/* Draw dots at vertices of filled area */}
        {attributes.map((attr, i) => {
          const coord = getCoordinatesForValue(attr.value, i, totalPoints);
          return (
            <Circle
              key={`dot-${i}`}
              cx={coord.x}
              cy={coord.y}
              r="4"
              fill="#FFFFFF"
            />
          );
        })}

        {/* Draw attribute labels */}
        {attributes.map((attr, i) => {
          const labelR = radius + 20; 
          const angle = (Math.PI * 2 * i) / totalPoints - Math.PI / 2;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          
          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              fill="#00A3FF"
              fontSize="12"
              fontWeight="bold"
              fontFamily="System"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {attr.name}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  }
});
