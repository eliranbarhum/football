import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { getPlayerById } from '../../constants/players';
import { useSinglePlayerImage } from '../../hooks/usePlayerImages';
import { downloadImage, shareImage, setAsWallpaper } from '../../services/imageService';
import InterstitialAdModal from '../../components/InterstitialAdModal';
import AdBanner from '../../components/AdBanner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={toastStyles.container}>
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.xxl,
    right: Spacing.xxl,
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
});

export default function WallpaperDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const player = getPlayerById(id ?? '');
  const { thumbUrl, fanartUrl, loading } = useSinglePlayerImage(player ?? null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'download' | 'wallpaper' | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const imageUrl = fanartUrl ?? thumbUrl;
  const displayUrl = imageUrl ?? null;

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const handleDownload = () => {
    if (!displayUrl) {
      Alert.alert('שגיאה', 'אין תמונה להורדה');
      return;
    }
    setPendingAction('download');
    setShowAd(true);
  };

  const handleSetWallpaper = () => {
    if (!displayUrl) {
      Alert.alert('שגיאה', 'אין תמונה');
      return;
    }
    setPendingAction('wallpaper');
    setShowAd(true);
  };

  const handleShare = async () => {
    if (!displayUrl) {
      Alert.alert('שגיאה', 'אין תמונה לשיתוף');
      return;
    }
    try {
      await shareImage(displayUrl, player?.name);
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לשתף את התמונה');
    }
  };

  const handleAdClose = async () => {
    setShowAd(false);
    if (!displayUrl || !player) return;

    setActionLoading(true);
    try {
      if (pendingAction === 'download') {
        const success = await downloadImage(displayUrl, player.name);
        if (success) {
          showToast('✅ נשמר בגלריה!');
        } else {
          Alert.alert('שגיאה', 'ההורדה נכשלה. ודא שניתנה הרשאה לגשת לגלריה.');
        }
      } else if (pendingAction === 'wallpaper') {
        const success = await setAsWallpaper(displayUrl, player.name);
        if (success) {
          showToast('✅ הטפט נשמר! הגדר אותו בהגדרות המכשיר');
        } else {
          Alert.alert('שגיאה', 'לא ניתן להגדיר את הטפט');
        }
      }
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  if (!player) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>⚽ שחקן לא נמצא</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>חזור</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Full Screen Image */}
      <View style={styles.imageContainer}>
        {displayUrl ? (
          <Image
            source={{ uri: displayUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
        ) : (
          <LinearGradient
            colors={[player.teamColor, player.teamColorSecondary, Colors.primary]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.fallbackView}>
              <Text style={styles.fallbackInitial}>
                {player.displayName.charAt(0)}
              </Text>
              <Text style={styles.fallbackNumber}>{player.jerseyNumber}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(10,14,26,0.5)', 'rgba(10,14,26,0.98)']}
          style={styles.bottomGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Top gradient for buttons visibility */}
        <LinearGradient
          colors={['rgba(10,14,26,0.7)', 'transparent']}
          style={styles.topGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Top Buttons */}
      <SafeAreaView style={styles.topButtons} edges={['top']}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Text style={styles.iconButtonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Text style={styles.iconButtonText}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Info & Actions */}
      <View style={styles.bottomContent}>
        {/* Player Info */}
        <View style={styles.playerInfo}>
          <View style={styles.teamRow}>
            <View
              style={[styles.teamDot, { backgroundColor: player.teamColor }]}
            />
            <Text style={styles.teamText}>{player.team}</Text>
            <Text style={styles.leagueText}>{player.league}</Text>
          </View>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>#{player.jerseyNumber}</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{player.position}</Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{player.nationality}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={handleDownload}
            disabled={actionLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.accent, '#0099BB']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.actionEmoji}>💾</Text>
              <Text style={styles.actionTextPrimary}>שמור לגלריה</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={handleSetWallpaper}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.actionEmoji}>📱</Text>
              <Text style={styles.actionText}>הגדר כטפט</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={handleShare}
              disabled={actionLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.actionEmoji}>📤</Text>
              <Text style={styles.actionText}>שתף</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AdBanner style={styles.adBanner} />
      </View>

      {/* Interstitial Ad */}
      <InterstitialAdModal visible={showAd} onClose={handleAdClose} />

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.72,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  fallbackView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackInitial: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 120,
    fontWeight: '900',
    zIndex: 2,
  },
  fallbackNumber: {
    color: 'rgba(255,255,255,0.12)',
    fontSize: 180,
    fontWeight: '900',
    position: 'absolute',
    zIndex: 1,
  },
  topButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,14,26,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconButtonText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  playerInfo: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.lg,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  teamText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
  leagueText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    opacity: 0.7,
  },
  playerName: {
    color: Colors.text,
    fontSize: Fonts.sizes.xxxl,
    fontWeight: '900',
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  detailChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  detailText: {
    color: Colors.text,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  actionPrimary: {},
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionText: {
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
  actionTextPrimary: {
    color: Colors.primary,
    fontSize: Fonts.sizes.base,
    fontWeight: '900',
  },
  adBanner: {},
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: Colors.text,
    fontSize: Fonts.sizes.xl,
    marginBottom: Spacing.base,
  },
  backLink: {
    color: Colors.accent,
    fontSize: Fonts.sizes.base,
    fontWeight: '700',
  },
});
