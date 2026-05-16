import React, { useMemo, useState } from 'react';
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
import { PLAYERS } from '../constants/players';
import { useGameState } from '../hooks/useGameState';
import { useRouter } from 'expo-router';

const { width: W } = Dimensions.get('window');
const COLUMNS = 3;
const CARD_GAP = Spacing.sm;
const CARD_SIZE = (W - Spacing.base * 2 - CARD_GAP * (COLUMNS - 1)) / COLUMNS;

// Badge URLs for known teams (football-data.org SVGs — free, no API key)
const BADGE_MAP: Record<string, string> = {
  'Real Madrid':       'https://crests.football-data.org/86.svg',
  'Barcelona':         'https://crests.football-data.org/81.svg',
  'Manchester City':   'https://crests.football-data.org/65.svg',
  'Liverpool':         'https://crests.football-data.org/64.svg',
  'Arsenal':           'https://crests.football-data.org/57.svg',
  'Manchester United': 'https://crests.football-data.org/66.svg',
  'Chelsea':           'https://crests.football-data.org/61.svg',
  'Tottenham':         'https://crests.football-data.org/73.svg',
  'Aston Villa':       'https://crests.football-data.org/58.svg',
  'Newcastle':         'https://crests.football-data.org/67.svg',
  'Bayern Munich':     'https://crests.football-data.org/5.svg',
  'Borussia Dortmund': 'https://crests.football-data.org/4.svg',
  'Bayer Leverkusen':  'https://crests.football-data.org/3.svg',
  'RB Leipzig':        'https://crests.football-data.org/721.svg',
  'PSG':               'https://crests.football-data.org/524.svg',
  'Lyon':              'https://crests.football-data.org/523.svg',
  'Marseille':         'https://crests.football-data.org/516.svg',
  'Monaco':            'https://crests.football-data.org/546.svg',
  'Inter Milan':       'https://crests.football-data.org/108.svg',
  'AC Milan':          'https://crests.football-data.org/98.svg',
  'Juventus':          'https://crests.football-data.org/109.svg',
  'Napoli':            'https://crests.football-data.org/115.svg',
  'Roma':              'https://crests.football-data.org/103.svg',
  'Lazio':             'https://crests.football-data.org/110.svg',
  'Atalanta':          'https://crests.football-data.org/102.svg',
  'Atletico Madrid':   'https://crests.football-data.org/78.svg',
};

// Hebrew display names override
const DISPLAY_MAP: Record<string, string> = {
  'Beitar Jerusalem':  'ביתר ירושלים',
  'Maccabi Tel Aviv':  'מכבי תל אביב',
  'Maccabi Haifa':     'מכבי חיפה',
  'Hapoel Beer Sheva': 'הפועל ב״ש',
};

function buildTeamList() {
  const map = new Map<string, { color: string; secondary: string; count: number }>();
  for (const p of PLAYERS) {
    if (!map.has(p.team)) {
      map.set(p.team, { color: p.teamColor, secondary: p.teamColorSecondary, count: 0 });
    }
    map.get(p.team)!.count++;
  }
  return Array.from(map.entries())
    .filter(([, d]) => d.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, d]) => ({
      name,
      displayName: DISPLAY_MAP[name] ?? name,
      color: d.color,
      secondary: d.secondary,
      count: d.count,
      badge: BADGE_MAP[name] ?? null,
    }));
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useGameState();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const teams = useMemo(() => buildTeamList(), []);
  const selectedTeam = teams.find((t) => t.name === selected);

  const handleConfirm = () => {
    if (!selected) return;
    completeOnboarding(selected);
    router.replace('/(tabs)' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0E1A', '#111827']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>⚽</Text>
        <Text style={styles.title}>Football Stars</Text>
        <Text style={styles.subtitle}>
          בחר את הקבוצה האהובה עליך{'\n'}ופתח את השחקנים שלה!
        </Text>
      </View>

      {/* Teams grid */}
      <FlatList
        data={teams}
        numColumns={COLUMNS}
        keyExtractor={(t) => t.name}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected === item.name;
          return (
            <TouchableOpacity
              onPress={() => setSelected(item.name)}
              activeOpacity={0.8}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <LinearGradient
                colors={[item.color + '33', item.secondary + '22']}
                style={styles.badgeWrap}
              >
                {item.badge ? (
                  <Image
                    source={{ uri: item.badge }}
                    style={styles.badge}
                    contentFit="contain"
                  />
                ) : (
                  <LinearGradient
                    colors={[item.color, item.secondary]}
                    style={styles.initCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.initText}>
                      {item.displayName.slice(0, 2).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
              </LinearGradient>

              <Text style={styles.cardName} numberOfLines={2}>
                {item.displayName}
              </Text>
              <Text style={styles.cardCount}>{item.count} שחקנים</Text>

              {isSelected && (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirm}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selected ? [Colors.accent, '#0099BB'] : ['#2A3345', '#2A3345']}
            style={styles.confirmGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.confirmText, !selected && styles.confirmTextOff]}>
              {selected
                ? `יאללה, ${selectedTeam?.displayName ?? selected}! ▶`
                : 'בחר קבוצה...'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.hint}>ניתן לשנות בכל עת מהסגל שלי</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },

  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  emoji: { fontSize: 44, marginBottom: 4 },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: '900', letterSpacing: -1 },
  subtitle: {
    color: Colors.textMuted, fontSize: Fonts.sizes.sm,
    textAlign: 'center', marginTop: 6, lineHeight: 20,
  },

  grid: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  gridRow: { justifyContent: 'flex-start', gap: CARD_GAP, marginBottom: CARD_GAP },

  card: {
    width: CARD_SIZE,
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.card,
    position: 'relative',
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '14',
  },

  badgeWrap: {
    width: CARD_SIZE - 14,
    height: CARD_SIZE - 14,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badge: { width: CARD_SIZE - 30, height: CARD_SIZE - 30 },
  initCircle: {
    width: CARD_SIZE - 30,
    height: CARD_SIZE - 30,
    borderRadius: (CARD_SIZE - 30) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initText: { color: '#FFF', fontSize: 18, fontWeight: '900' },

  cardName: {
    color: Colors.text, fontSize: Fonts.sizes.xs,
    fontWeight: '700', textAlign: 'center', lineHeight: 14,
  },
  cardCount: { color: Colors.textMuted, fontSize: 10, marginTop: 2, fontWeight: '600' },

  check: {
    position: 'absolute', top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { color: Colors.primary, fontSize: 11, fontWeight: '900' },

  footer: {
    padding: Spacing.base,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.primary,
  },
  confirmBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  confirmGrad: { paddingVertical: Spacing.base + 2, alignItems: 'center' },
  confirmText: { color: Colors.primary, fontSize: Fonts.sizes.base, fontWeight: '900' },
  confirmTextOff: { color: Colors.textMuted },
  hint: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, textAlign: 'center', opacity: 0.7 },
});
