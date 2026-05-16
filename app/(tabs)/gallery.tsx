import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { PLAYERS, getPlayersByLeague, Player } from '../../constants/players';
import WallpaperCard from '../../components/WallpaperCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilter from '../../components/CategoryFilter';
import AdBanner from '../../components/AdBanner';
import { usePlayerImages } from '../../hooks/usePlayerImages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 2 - CARD_GAP) / 2;

function SkeletonCard() {
  return (
    <View
      style={[
        styles.skeletonCard,
        { width: CARD_WIDTH, height: CARD_WIDTH * 1.3 },
      ]}
    />
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>⚽</Text>
      <Text style={styles.emptyTitle}>לא נמצאו שחקנים</Text>
      <Text style={styles.emptySubtitle}>נסה חיפוש אחר</Text>
    </View>
  );
}

export default function GalleryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ team?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');

  // If navigated from team card
  useEffect(() => {
    if (params.team) {
      setSearchQuery(params.team);
    }
  }, [params.team]);

  const filteredPlayers = useMemo(() => {
    let players = getPlayersByLeague(selectedLeague);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      players = players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.team.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q)
      );
    }

    return players;
  }, [searchQuery, selectedLeague]);

  const { images, loading } = usePlayerImages(filteredPlayers);

  const handlePlayerPress = (player: Player) => {
    router.push(`/wallpaper/${player.id}`);
  };

  const renderItem = ({ item }: { item: Player }) => (
    <WallpaperCard
      player={item}
      imageUrl={images[item.id]?.thumbUrl}
      onPress={() => handlePlayerPress(item)}
      size="small"
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🖼️ גלריית שחקנים</Text>
      </View>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="חפש שחקן, קבוצה..."
      />

      {/* Category Filter */}
      <CategoryFilter selected={selectedLeague} onSelect={setSelectedLeague} />

      {/* Player count */}
      <Text style={styles.count}>
        {filteredPlayers.length} שחקנים
      </Text>

      {/* Grid */}
      {loading && filteredPlayers.length === 0 ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : filteredPlayers.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator
                color={Colors.accent}
                style={styles.loadingMore}
              />
            ) : null
          }
        />
      )}

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.xl,
    fontWeight: '900',
  },
  count: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: CARD_GAP,
  },
  skeletonCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.base,
  },
  loadingMore: {
    padding: Spacing.lg,
  },
});
