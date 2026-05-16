import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
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
import { getTeamBadge } from '../../lib/sportsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// קבוצות להציג בדף הבית
const TEAM_GROUPS = [
  { name: 'Real Madrid',       searchName: 'Real Madrid',        color: '#FFFFFF', secondary: '#FFD700' },
  { name: 'Barcelona',         searchName: 'FC Barcelona',       color: '#004D98', secondary: '#A50044' },
  { name: 'Man City',          searchName: 'Manchester City',    color: '#6CABDD', secondary: '#FFFFFF' },
  { name: 'Liverpool',         searchName: 'Liverpool',          color: '#C8102E', secondary: '#00B2A9' },
  { name: 'Arsenal',           searchName: 'Arsenal',            color: '#EF0107', secondary: '#FFFFFF' },
  { name: 'Man United',        searchName: 'Manchester United',  color: '#DA020E', secondary: '#FFE500' },
  { name: 'Bayern',            searchName: 'Bayern Munich',      color: '#DC052D', secondary: '#0066B2' },
  { name: 'PSG',               searchName: 'Paris Saint-Germain',color: '#004170', secondary: '#DA291C' },
  { name: 'Inter Miami',       searchName: 'Inter Miami',        color: '#FF007F', secondary: '#000000' },
  // ===== ישראל =====
  { name: 'מכבי ת״א',          searchName: 'Maccabi Tel Aviv',   color: '#FFD700', secondary: '#003580' },
  { name: 'ביתר י-ם',          searchName: 'Beitar Jerusalem',   color: '#FFD700', secondary: '#000000' },
  { name: 'מכבי חיפה',         searchName: 'Maccabi Haifa',      color: '#006600', secondary: '#FFFFFF' },
  { name: 'הפועל ב״ש',         searchName: 'Hapoel Beer Sheva',  color: '#CC0000', secondary: '#FFFFFF' },
];

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

function TeamCard({
  name,
  searchName,
  color,
  secondary,
  onPress,
}: {
  name: string;
  searchName: string;
  color: string;
  secondary: string;
  onPress: () => void;
}) {
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTeamBadge(searchName).then((url) => {
      if (!cancelled) {
        setBadgeUrl(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [searchName]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.teamCard} activeOpacity={0.8}>
      <LinearGradient
        colors={[color + '33', secondary + '22']}
        style={styles.teamGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : badgeUrl ? (
          <Image
            source={{ uri: badgeUrl }}
            style={styles.teamBadge}
            contentFit="contain"
            transition={300}
          />
        ) : (
          // Fallback: ראשי תיבות
          <Text style={[styles.teamInitial, { color }]}>
            {name.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </LinearGradient>
      <Text style={styles.teamName} numberOfLines={1}>{name}</Text>
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

  const handleTeamPress = (teamName: string) => {
    router.push({ pathname: '/(tabs)/gallery', params: { team: teamName } });
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
              name={item.name}
              searchName={item.searchName}
              color={item.color}
              secondary={item.secondary}
              onPress={() => handleTeamPress(item.name)}
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
