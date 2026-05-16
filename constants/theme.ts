export const Colors = {
  primary: '#0A0E1A',       // Very dark navy
  secondary: '#131929',
  card: '#1A2235',
  accent: '#00D4FF',        // Electric cyan
  gold: '#FFD700',
  green: '#00C853',         // Football field green
  text: '#FFFFFF',
  textMuted: '#8892A4',
  border: '#252D3D',
  error: '#FF4444',
  success: '#00C853',
  warning: '#FFA000',
  overlay: 'rgba(10, 14, 26, 0.85)',
  overlayLight: 'rgba(10, 14, 26, 0.5)',
  cardGradientStart: 'rgba(26, 34, 53, 0)',
  cardGradientEnd: 'rgba(10, 14, 26, 0.95)',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default { Colors, Fonts, Spacing, BorderRadius, Shadows };
