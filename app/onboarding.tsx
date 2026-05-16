import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../constants/theme';
import { useGameState } from '../hooks/useGameState';
import { useRouter } from 'expo-router';

const { width: W } = Dimensions.get('window');

const TEAMS = [
  { name: 'Real Madrid',       color: '#FFFFFF', secondary: '#FFD700', badge: 'https://crests.football-data.org/86.svg' },
  { name: 'Barcelona',         color: '#004D98', secondary: '#A50044', badge: 'https://crests.football-data.org/81.svg' },
  { name: 'Manchester City',   color: '#6CABDD', secondary: '#FFFFFF', badge: 'https://crests.football-data.org/65.svg' },
  { name: 'Liverpool',         color: '#C8102E', secondary: '#00B2A9', badge: 'https://crests.football-data.org/64.svg' },
  { name: 'Arsenal',           color: '#EF0107', secondary: '#FFFFFF', badge: 'https://crests.football-data.org/57.svg' },
  { name: 'Manchester United', color: '#DA020E', secondary: '#FFE500', badge: 'https://crests.football-data.org/66.svg' },
  { name: 'Chelsea',           color: '#034694', secondary: '#FFFFFF', badge: 'https://crests.football-data.org/61.svg' },
  { name: 'Tottenham',         color: '#132257', secondary: '#FFFFFF', badge: 'https://crests.football-data.org/73.svg' },
  { name: 'Maccabi Tel Aviv',  color: '#FFD700', secondary: '#003580', badge: null },
  { name: 'Beitar Jerusalem',  color: '#FFD700', secondary: '#000000', badge: null },
  { name: 'Maccabi Haifa',     color: '#006600', secondary: '#FFFFFF', badge: null },
  { name: 'Hapoel Beer Sheva', color: '#CC0000', secondary: '#FFFFFF', badge: null },
];

const CARD_SIZE = (W - Spacing.base * 2 - Spacing.sm * 2) / 3;

export default function OnboardingScreen() {
  const { completeOnboarding } = useGameState();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    completeOnboarding(selected);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0E1A', '#1a1f35']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.emoji}>⚽</Text>
        <Text style={styles.title}>Football Stars</Text>
        <Text style={styles.subtitle}>בחר את הקבוצה האהובה עליך{'\n'}ובנה את הסגל שלך!</Text>
      </View>

      <FlatList
        data={TEAMS}
        numColumns={3}
        keyExtractor={(t) => t.name}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = selected === item.name;
          return (
            <TouchableOpacity
              onPress={() => setSelected(item.name)}
              activeOpacity={0.8}
              style={[styles.teamCard, isSelected && styles.teamCardSelected]}
            >
              <LinearGradient
                colors={[item.color + '33', item.secondary + '22']}
                style={styles.badgeContainer}
              >
                {item.badge ? (
                  <Image
                    source={{ uri: item.badge }}
                    style={styles.badge}
                    contentFit="contain"
                  />
                ) : (
                  <Text style={[styles.teamInitial, { color: item.color }]}>
                    {item.name.slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </LinearGradient>
              <Text style={styles.teamName} numberOfLines={2}>
                {item.name}
              </Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !selected && styles.confirmDisabled]}
          onPress={handleConfirm}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selected ? [Colors.accent, '#0099BB'] : ['#333', '#333']}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmText}>
              {selected ? `בחרתי ב-${selected}! ▶` : 'בחר קבוצה...'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.hint}>ניתן לשנות בהמשך בהגדרות</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  emoji: { fontSize: 52, marginBottom: Spacing.sm },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: '900', letterSpacing: -1 },
  subtitle: {
    color: Colors.textMuted, fontSize: Fonts.sizes.base,
    textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22,
  },
  grid: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base },
  row: { justifyContent: 'space-between', marginBottom: Spacing.sm },
  teamCard: {
    width: CARD_SIZE,
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.card,
  },
  teamCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '18',
  },
  badgeContainer: {
    width: CARD_SIZE - 16,
    height: CARD_SIZE - 16,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  badge: { width: CARD_SIZE - 32, height: CARD_SIZE - 32 },
  teamInitial: { fontSize: 22, fontWeight: '900' },
  teamName: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4, right: 4,
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '900',
  },
  footer: { padding: Spacing.base, gap: Spacing.xs },
  confirmButton: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  confirmDisabled: { opacity: 0.5 },
  confirmGradient: {
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    fontWeight: '900',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    textAlign: 'center',
    opacity: 0.7,
  },
});
