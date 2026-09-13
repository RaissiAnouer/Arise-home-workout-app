let expoClipboard: typeof import('expo-clipboard') | null = null;
try {
  expoClipboard = require('expo-clipboard');
} catch {
  // Graceful fallback if module is pending or unavailable
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (expoClipboard && typeof expoClipboard.setStringAsync === 'function') {
      await expoClipboard.setStringAsync(text);
      return true;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return true;
  } catch (error) {
    console.warn('Clipboard copy failed:', error);
    return false;
  }
}
