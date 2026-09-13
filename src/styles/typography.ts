import { TextStyle } from 'react-native';

/**
 * Converts ALL CAPS or arbitrary text into Title Case
 * e.g. "CUSTOM WORKOUT" -> "Custom Workout"
 *      "YOUR HUNTER RANK IS" -> "Your Hunter Rank Is"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  
  // List of words that should remain lowercase unless at the start
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with']);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return '';
      if (index > 0 && minorWords.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Standardized App Typography Hierarchy
 */
export const typography = {
  /**
   * Main Screen Title (H1)
   * Used for top screen titles (e.g., Custom Workout, Active Training Routine, Workout Analytics)
   */
  h1: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 28,
  } as TextStyle,

  /**
   * Section Header (H2)
   * Used for card headers, sub-sections, and group labels (e.g., Routine Name, Focus Muscle Group, Your Workout)
   */
  h2: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    lineHeight: 22,
  } as TextStyle,

  /**
   * Secondary Section Header (H3)
   * Used for smaller cards and list item headers
   */
  h3: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    lineHeight: 18,
  } as TextStyle,

  /**
   * Body / Paragraph Text (P)
   * Used for descriptions, supporting text, and readable copy
   */
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    letterSpacing: 0.2,
  } as TextStyle,

  /**
   * Small Body / Subtext
   */
  subtext: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  /**
   * Button / Action Label
   */
  button: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  } as TextStyle,

  /**
   * Input Field Text
   * Default text size matching button typography (14px) without uppercase
   */
  input: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  } as TextStyle,
};

