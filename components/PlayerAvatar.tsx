import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Fonts } from '../constants/theme';
import { Player } from '../constants/players';

interface PlayerAvatarProps {
  player: Player;
  imageUrl?: string | null;
  size?: number;
}

export default function PlayerAvatar({
  player,
  imageUrl,
  size = 48,
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: player.teamColor,
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          onError={() => setImageError(true)}
          transition={200}
        />
      ) : (
        <LinearGradient
          colors={[player.teamColor, player.teamColorSecondary]}
          style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
            {player.displayName.charAt(0)}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
