import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Attempt to load AdMob interstitial (not available in Expo Go)
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch {
  // Native module not available
}

const INTERSTITIAL_AD_UNIT_ID =
  Platform.OS === 'android'
    ? 'ca-app-pub-3940256099942544/1033173712' // Test ID
    : 'ca-app-pub-3940256099942544/4411468910'; // iOS test

interface InterstitialAdModalProps {
  visible: boolean;
  onClose: () => void;
}

const COUNTDOWN_SECONDS = 3;

export default function InterstitialAdModal({
  visible,
  onClose,
}: InterstitialAdModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCountdown(COUNTDOWN_SECONDS);
      setCanClose(false);
      return;
    }

    let current = COUNTDOWN_SECONDS;
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        setCanClose(true);
      }
    }, 1000);

    // Try to show a real interstitial ad if available
    if (InterstitialAd && AdEventType) {
      try {
        const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
          requestNonPersonalizedAdsOnly: false,
        });

        ad.addAdEventListener(AdEventType.LOADED, () => {
          ad.show().catch(() => {});
        });

        ad.addAdEventListener(AdEventType.CLOSED, () => {
          onClose();
        });

        ad.load();
      } catch {
        // Continue with the custom modal fallback
      }
    }

    return () => clearInterval(interval);
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={canClose ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.adContainer}>
          {/* Ad content placeholder */}
          <View style={styles.adContent}>
            <Text style={styles.adLabel}>מודעה</Text>
            <Text style={styles.adEmoji}>⚽</Text>
            <Text style={styles.adTitle}>כוכבי הכדורגל</Text>
            <Text style={styles.adSubtitle}>
              הורד את כל טפטי השחקנים המעולים!
            </Text>
            <Text style={styles.adCaption}>שמור, שתף, שנה טפט</Text>
          </View>

          {/* Close button / Countdown */}
          <View style={styles.closeArea}>
            {canClose ? (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButtonText}>✕ סגור</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adContainer: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adContent: {
    height: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    padding: Spacing.xl,
  },
  adLabel: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adEmoji: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  adTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.xxl,
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  adSubtitle: {
    color: Colors.accent,
    fontSize: Fonts.sizes.base,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  adCaption: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
  },
  closeArea: {
    padding: Spacing.base,
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
  countdownBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: Colors.text,
    fontSize: Fonts.sizes.base,
    fontWeight: '800',
  },
});
