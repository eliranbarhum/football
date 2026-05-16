import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, Spacing } from '../constants/theme';

// Only import AdMob in production builds where the native module is available
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch {
  // Native module not available (Expo Go / web)
}

const BANNER_AD_UNIT_ID =
  Platform.OS === 'android'
    ? 'ca-app-pub-3940256099942544/6300978111' // Test ID
    : 'ca-app-pub-3940256099942544/2934735716'; // iOS test

interface AdBannerProps {
  style?: object;
}

export default function AdBanner({ style }: AdBannerProps) {
  if (BannerAd && BannerAdSize && TestIds) {
    return (
      <View style={[styles.container, style]}>
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>
    );
  }

  // Development / Expo Go fallback
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>📢 פרסומת</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.xs,
  },
  placeholder: {
    height: 50,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
  },
});
