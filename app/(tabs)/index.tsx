import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { POPULAR_PLAYERS, PLAYERS, Player } from '../../constants/players';
import { TEAMS, TeamInfo } from '../../constants/teams';
import WallpaperCard from '../../components/WallpaperCard';
import { usePlayerImages } from '../../hooks/usePlayerImages';
import { useGameState } from '../../hooks/useGameState';

const { width: W } = Dimensions.get('window');

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({ item, onPress }: { item: TeamInfo; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.teamCard} activeOpacity={0.8}>
      <LinearGradient
        colors={[item.color + '44', item.secondary + '22']}
        style={styles.teamGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {item.badgeUrl ? (
          <Image
            source={{ uri: item.badgeUrl }}
            style={styles.teamBadge}
            contentFit="contain"
            transition={300}
          />
        ) : (
          <Text style={[styles.teamInitial, { color: item.color }]}>
            {item.displayName.slice(0, 2)}
          </Text>
        )}
      </LinearGradient>
      <Text style={styles.teamName} numberOfLines={1}>{item.displayName}</Text>
      <Text style={styles.teamCity} numberOfLines={1}>{item.city}</Text>
    </TouchableOpacity>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>ראה הכל</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { images } = usePlayerImages(PLAYERS);
  const { getStreak, getUnlockedPlayers } = useGameState();
  const streak = getStreak();
  const unlockedCount = getUnlockedPlayers().length;

  const handlePlayerPress = (player: Player) => {
    router.push(`/wallpaper/${player.id}`);
  };

  const handleTeamPress = (team: TeamInfo) => {
    router.push(`/team/${encodeURIComponent(team.name)}` as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>ברוכים הבאים 👋</Text>
            <Text style={styles.headerTitle}>כוכבי הכדורגל ⚽</Text>
          </View>
          <View style={styles.israelBadge}>
            <Text style={styles.israelText}>🇮🇱</Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak.current}</Text>
            <Text style={styles.statLabel}>ימים רצופים</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{streak.best}</Text>
            <Text style={styles.statLabel}>שיא אישי</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>👕</Text>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>שחקנים נפתחו</Text>
          </View>
        </View>

        {/* ── חלון 1: קבוצות ────────────────────────────────────────────── */}
        <View style={styles.windowCard}>
          <SectionHeader
            title="🏟️ קבוצות"
            onSeeAll={() => router.push('/(tabs)/gallery')}
          />
          <FlatList
            data={TEAMS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TeamCard item={item} onPress={() => handleTeamPress(item)} />
            )}
            ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
          />
        </View>

        {/* ── חלון 2: שחקנים ────────────────────────────────────────────── */}
        <View style={styles.windowCard}>
          <SectionHeader
            title="⚽ שחקנים"
            onSeeAll={() => router.push('/(tabs)/gallery')}
          />
          <FlatList
            data={POPULAR_PLAYERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <WallpaperCard
                player={item}
                imageUrl={images[item.id]?.thumbUrl}
                onPress={() => handlePlayerPress(item)}
                size="large"
              />
            )}
            snapToInterval={W * 0.5 + Spacing.sm}
            decelerationRate="fast"
            ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
          />

          {/* שחקנים ישראלים */}
          <View style={styles.israelSection}>
            <Text style={styles.israelSectionTitle}>🇮🇱 שחקנים ישראלים</Text>
            <FlatList
              data={PLAYERS.filter((p) => p.nationality === 'Israel')}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WallpaperCard
                  player={item}
                  imageUrl={images[item.id]?.thumbUrl}
                  onPress={() => handlePlayerPress(item)}
                  size="large"
                />
              )}
              snapToInterval={W * 0.5 + Spacing.sm}
              decelerationRate="fast"
              ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.lg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  },
  headerSubtitle: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: 2 },
  headerTitle: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: '900', letterSpacing: -0.5 },
  israelBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  israelText: { fontSize: 22 },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm + 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statValue: { color: Colors.accent, fontSize: Fonts.sizes.lg, fontWeight: '900' },
  statLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  // Window card — each section in a styled container
  windowCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: Spacing.base,
    overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: '800' },
  seeAll: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  horizontalList: { paddingHorizontal: Spacing.base },

  israelSection: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  israelSectionTitle: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },

  // Team card
  teamCard: { alignItems: 'center', width: 80 },
  teamGradient: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  teamBadge: { width: 44, height: 44 },
  teamInitial: { fontSize: 18, fontWeight: '900' },
  teamName: { color: Colors.text, fontSize: Fonts.sizes.xs, fontWeight: '700', textAlign: 'center' },
  teamCity: { color: Colors.textMuted, fontSize: 9, textAlign: 'center', marginTop: 1 },
});
