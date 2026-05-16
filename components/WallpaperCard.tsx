import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius, Fonts } from '../constants/theme';
import { Player } from '../constants/players';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WallpaperCardProps {
  player: Player;
  imageUrl?: string | null;
  onPress: () => void;
  size?: 'small' | 'large';
  downloadCount?: number;
}

function PlayerFallback({ player, size }: { player: Player; size: 'small' | 'large' }) {
  const initial = player.displayName.charAt(0).toUpperCase();
  const isLarge = size === 'large';

  return (
    <LinearGradient
      colors={[player.teamColor, player.teamColorSecondary, '#0A0E1A']}
      style={StyleSheet.absoluteFill}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.fallbackContent}>
        <Text style={[styles.fallbackInitial, { fontSize: isLarge ? 72 : 48 }]}>
          {initial}
        </Text>
        <Text style={[styles.fallbackNumber, { opacity: 0.15, fontSize: isLarge ? 120 : 80 }]}>
          {player.jerseyNumber}
        </Text>
      </View>
    </LinearGradient>
  );
}

export default function WallpaperCard({
  player,
  imageUrl,
  onPress,
  size = 'small',
  downloadCount = 0,
}: WallpaperCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isLarge = size === 'large';

  const cardWidth = isLarge
    ? SCREEN_WIDTH * 0.75
    : (SCREEN_WIDTH - Spacing.base * 3) / 2;
  const cardHeight = isLarge ? cardWidth * 1.4 : cardWidth * 1.3;

  const showImage = imageUrl && !imageError;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          width: cardWidth,
          height: cardHeight,
          borderColor: player.teamColor,
        },
      ]}
      activeOpacity={0.85}
    >
      {/* Background */}
      {showImage ? (
        <>
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            transition={300}
          />
          {imageLoading && (
            <PlayerFallback player={player} size={size} />
          )}
        </>
      ) : (
        <PlayerFallback player={player} size={size} />
      )}

      {/* Loading spinner */}
      {imageLoading && showImage && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={Colors.accent} size="small" />
        </View>
      )}

      {/* Featured badge */}
      {player.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐</Text>
        </View>
      )}

      {/* Bottom info overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 14, 26, 0.7)', 'rgba(10, 14, 26, 0.97)']}
        style={styles.bottomGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.infoRow}>
          <View
            style={[styles.teamColorDot, { backgroundColor: player.teamColor }]}
          />
          <Text style={styles.teamShort}>{player.teamShort}</Text>
        </View>
        <Text style={styles.playerName} numberOfLines={1}>
          {player.displayName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.position}>{player.position}</Text>
          {downloadCount > 0 && (
            <Text style={styles.downloads}>⬇ {downloadCount}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    backgroundColor: Colors.card,
  },
  fallbackContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fallbackInitial: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '900',
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  fallbackNumber: {
    color: '#FFFFFF',
    fontWeight: '900',
    position: 'absolute',
    zIndex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,14,26,0.3)',
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(10,14,26,0.7)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  featuredText: {
    fontSize: 14,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  teamColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  teamShort: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  playerName: {
    color: Colors.text,
    fontSize: Fonts.sizes.base,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  position: {
    color: Colors.accent,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  downloads: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
  },
});
