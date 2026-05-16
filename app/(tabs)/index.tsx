import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import {
  FEATURED_PLAYERS,
  POPULAR_PLAYERS,
  PLAYERS,
  Player,
} from '../../constants/players';
import WallpaperCard from '../../components/WallpaperCard';
import AdBanner from '../../components/AdBanner';
import { usePlayerImages } from '../../hooks/usePlayerImages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// קבוצות להציג בדף הבית
const TEAM_GROUPS = [
  { name: 'Real Madrid',  teamFilter: 'Real Madrid',       color: '#FFFFFF', secondary: '#FFD700', badgeUrl: 'https://crests.football-data.org/86.svg' },
  { name: 'Barcelona',    teamFilter: 'Barcelona',          color: '#004D98', secondary: '#A50044', badgeUrl: 'https://crests.football-data.org/81.svg' },
  { name: 'Man City',     teamFilter: 'Manchester City',    color: '#6CABDD', secondary: '#FFFFFF', badgeUrl: 'https://crests.football-data.org/65.svg' },
  { name: 'Liverpool',    teamFilter: 'Liverpool',          color: '#C8102E', secondary: '#00B2A9', badgeUrl: 'https://crests.football-data.org/64.svg' },
  { name: 'Arsenal',      teamFilter: 'Arsenal',            color: '#EF0107', secondary: '#FFFFFF', badgeUrl: 'https://crests.football-data.org/57.svg' },
  { name: 'Man United',   teamFilter: 'Manchester United',  color: '#DA020E', secondary: '#FFE500', badgeUrl: 'https://crests.football-data.org/66.svg' },
  { name: 'Chelsea',      teamFilter: 'Chelsea',            color: '#034694', secondary: '#FFFFFF', badgeUrl: 'https://crests.football-data.org/61.svg' },
  { name: 'Tottenham',    teamFilter: 'Tottenham',          color: '#132257', secondary: '#FFFFFF', badgeUrl: 'https://crests.football-data.org/73.svg' },
  { name: 'Bayern',       teamFilter: 'Bayern Munich',      color: '#DC052D', secondary: '#0066B2', badgeUrl: 'https://crests.football-data.org/5.svg' },
  { name: 'Leverkusen',   teamFilter: 'Bayer Leverkusen',   color: '#E32221', secondary: '#000000', badgeUrl: 'https://crests.football-data.org/3.svg' },
  { name: 'PSG',          teamFilter: 'PSG',                color: '#004170', secondary: '#DA291C', badgeUrl: 'https://crests.football-data.org/524.svg' },
  { name: 'Inter Milan',  teamFilter: 'Inter Milan',        color: '#010E80', secondary: '#000000', badgeUrl: 'https://crests.football-data.org/108.svg' },
  { name: 'AC Milan',     teamFilter: 'AC Milan',           color: '#FB090B', secondary: '#000000', badgeUrl: 'https://crests.football-data.org/98.svg' },
  { name: 'Juventus',     teamFilter: 'Juventus',           color: '#000000', secondary: '#FFFFFF', badgeUrl: 'https://crests.football-data.org/109.svg' },
  // קבוצות ישראל — גרדיאנט + ראשי תיבות (ללא API)
  { name: 'מכבי ת״א',    teamFilter: 'Maccabi Tel Aviv',   color: '#FFD700', secondary: '#003580', badgeUrl: 'gradient' },
  { name: 'ביתר י-ם',    teamFilter: 'Beitar Jerusalem',   color: '#FFD700', secondary: '#000000', badgeUrl: 'gradient' },
  { name: 'מכבי חיפה',   teamFilter: 'Maccabi Haifa',      color: '#006600', secondary: '#FFFFFF', badgeUrl: 'gradient' },
  { name: 'הפועל ב״ש',   teamFilter: 'Hapoel Beer Sheva',  color: '#CC0000', secondary: '#FFFFFF', badgeUrl: 'gradient' },
];

type TeamGroup = typeof TEAM_GROUPS[number];

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

function TeamCard({ item, onPress }: { item: TeamGroup; onPress: () => void }) {
  const showBadge = item.badgeUrl && item.badgeUrl !== 'gradient';

  return (
    <TouchableOpacity onPress={onPress} style={styles.teamCard} activeOpacity={0.8}>
      <LinearGradient
        colors={[item.color + '33', item.secondary + '22']}
        style={styles.teamGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {showBadge ? (
          <Image
            source={{ uri: item.badgeUrl! }}
            style={styles.teamBadge}
            contentFit="contain"
            transition={300}
          />
        ) : (
          <Text style={[styles.teamInitial, { color: item.color }]}>
            {item.name.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </LinearGradient>
      <Text style={styles.teamName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { images, refetch } = usePlayerImages(PLAYERS);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePlayerPress = (player: Player) => {
    router.push(`/wallpaper/${player.id}`);
  };

  const handleTeamPress = (teamFilter: string) => {
    router.push({ pathname: '/(tabs)/gallery', params: { team: teamFilter } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>ברוכים הבאים 👋</Text>
            <Text style={styles.headerTitle}>Football Stars ⚽</Text>
          </View>
          <View style={styles.israelBadge}>
            <Text style={styles.israelText}>🇮🇱</Text>
          </View>
        </View>

        {/* Featured Players */}
        <SectionHeader
          title="⭐ כוכבי השבוע"
          onSeeAll={() => router.push('/(tabs)/gallery')}
        />
        <FlatList
          data={FEATURED_PLAYERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WallpaperCard
              player={item}
              imageUrl={images[item.id]?.fanartUrl ?? images[item.id]?.thumbUrl}
              onPress={() => handlePlayerPress(item)}
              size="large"
            />
          )}
          snapToInterval={SCREEN_WIDTH * 0.75 + Spacing.sm}
          decelerationRate="fast"
          ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
        />

        {/* Israeli Section */}
        <SectionHeader
          title="🇮🇱 שחקנים ישראלים"
          onSeeAll={() => router.push({ pathname: '/(tabs)/gallery', params: { league: 'Israeli Premier League' } })}
        />
        <FlatList
          data={PLAYERS.filter(p => p.nationality === 'Israel')}
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
          snapToInterval={SCREEN_WIDTH * 0.75 + Spacing.sm}
          decelerationRate="fast"
          ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
        />

        {/* Teams Grid */}
        <SectionHeader title="🏟️ לפי קבוצה" />
        <FlatList
          data={TEAM_GROUPS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TeamCard
              item={item}
              onPress={() => handleTeamPress(item.teamFilter)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
        />

        {/* Popular Players */}
        <SectionHeader
          title="🔥 שחקנים פופולריים"
          onSeeAll={() => router.push('/(tabs)/gallery')}
        />
        <View style={styles.grid}>
          {POPULAR_PLAYERS.slice(0, 6).map((player) => (
            <WallpaperCard
              key={player.id}
              player={player}
              imageUrl={images[player.id]?.thumbUrl}
              onPress={() => handlePlayerPress(player)}
              size="small"
            />
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <AdBanner />
    </SafeAreaView>
  );
}

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
    paddingBottom: Spacing.lg,
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
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  sectionTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: '800' },
  seeAll: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  horizontalList: { paddingHorizontal: Spacing.base },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.base, gap: Spacing.sm },
  // Team card
  teamCard: { alignItems: 'center', width: 80 },
  teamGradient: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  teamBadge: { width: 44, height: 44 },
  teamInitial: { fontSize: 18, fontWeight: '900' },
  teamName: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '600', textAlign: 'center' },
});
