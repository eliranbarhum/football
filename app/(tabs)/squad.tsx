import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { getPlayersByTeam, Player } from '../../constants/players';
import { useGameState } from '../../hooks/useGameState';
import { positionToHebrew } from '../../constants/hebrew';

const { width: W } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const CARD_W = (W - Spacing.base * 2 - CARD_GAP) / 2;
const CARD_H = CARD_W * 1.35;
const STAGE_B_GOAL = 21;

// ─── Single player card ───────────────────────────────────────────────────────

function PlayerSlot({
  player,
  isUnlocked,
  correctAnswers,
  onPress,
}: {
  player: Player;
  isUnlocked: boolean;
  correctAnswers: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.slot, isUnlocked ? styles.slotUnlocked : styles.slotLocked]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Image */}
      {player.directImageUrl ? (
        <Image
          source={{ uri: player.directImageUrl }}
          style={[styles.slotImage, !isUnlocked && styles.slotImageDark]}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <LinearGradient
          colors={[
            isUnlocked ? player.teamColor + 'BB' : '#1a1a2e',
            isUnlocked ? player.teamColorSecondary + '88' : '#0d0d1a',
          ]}
          style={styles.slotFallback}
        >
          <Text style={[styles.slotInitial, { color: isUnlocked ? player.teamColor : '#444' }]}>
            {player.displayName.charAt(0)}
          </Text>
        </LinearGradient>
      )}

      {/* Lock overlay */}
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockProgress}>{correctAnswers}/4</Text>
          <Text style={styles.lockHint}>שאלות נכונות</Text>
        </View>
      )}

      {/* Bottom gradient + name */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        style={styles.slotBottom}
      >
        <Text style={styles.slotName} numberOfLines={1}>{player.displayName}</Text>
        <Text style={styles.slotPos}>{positionToHebrew(player.position)}</Text>
      </LinearGradient>

      {/* Unlocked check */}
      {isUnlocked && (
        <View style={styles.unlockedBadge}>
          <Text style={styles.unlockedBadgeText}>✅</Text>
        </View>
      )}

      {/* Jersey number */}
      <View style={[styles.jerseyBadge, isUnlocked ? styles.jerseyBadgeActive : {}]}>
        <Text style={styles.jerseyNum}>#{player.jerseyNumber}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SquadScreen() {
  const router = useRouter();
  const { state, getPlayerProgress, getUnlockedPlayers, resetGameState } = useGameState();

  // All players from favorite team (this is what we DISPLAY)
  const teamPlayers = useMemo(() => {
    if (!state.favoriteTeam) return [];
    return getPlayersByTeam(state.favoriteTeam);
  }, [state.favoriteTeam]);

  // Total unlocked across ALL teams (for Stage B gate)
  const totalUnlocked = useMemo(() => getUnlockedPlayers().length, [getUnlockedPlayers]);
  const canStartStageB = totalUnlocked >= STAGE_B_GOAL;
  const stageBProgress = Math.min(totalUnlocked / STAGE_B_GOAL, 1);

  // Count unlocked in this team for display
  const teamUnlocked = useMemo(
    () => teamPlayers.filter((p) => getPlayerProgress(p.id).unlocked).length,
    [teamPlayers, getPlayerProgress]
  );

  const renderItem = ({ item }: { item: Player }) => {
    const progress = getPlayerProgress(item.id);
    return (
      <PlayerSlot
        player={item}
        isUnlocked={progress.unlocked}
        correctAnswers={progress.correctAnswers}
        onPress={() => router.push(`/wallpaper/${item.id}`)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>הסגל שלי</Text>
          <Text style={styles.subtitle}>
            {state.favoriteTeam ?? 'לא נבחרה קבוצה'}
            {teamPlayers.length > 0 && `  ·  ${teamUnlocked}/${teamPlayers.length} פתוחים`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() =>
            Alert.alert('איפוס נתונים', 'למחוק את כל ההתקדמות ולחזור לבחירת קבוצה?', [
              { text: 'ביטול', style: 'cancel' },
              {
                text: 'איפוס',
                style: 'destructive',
                onPress: async () => {
                  await resetGameState();
                  router.replace('/onboarding' as never);
                },
              },
            ])
          }
        >
          <Text style={styles.resetText}>🔄 החלף קבוצה</Text>
        </TouchableOpacity>
      </View>

      {/* Stage B progress card */}
      <View style={styles.stageBCard}>
        <View style={styles.stageBRow}>
          <Text style={styles.stageBLabel}>התקדמות לשלב B</Text>
          <Text style={styles.stageBCount}>{totalUnlocked}/{STAGE_B_GOAL}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stageBProgress * 100}%` }]} />
        </View>
        <TouchableOpacity
          style={[styles.stageBBtn, !canStartStageB && styles.stageBBtnLocked]}
          onPress={() => canStartStageB && router.push('/stage-b' as never)}
          disabled={!canStartStageB}
          activeOpacity={canStartStageB ? 0.85 : 1}
        >
          <Text style={[styles.stageBBtnText, !canStartStageB && styles.stageBBtnTextLocked]}>
            {canStartStageB
              ? '🏆 שלב B: ניהול ליגה — כנס!'
              : `🔒 שלב B נפתח ב-${STAGE_B_GOAL} שחקנים`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#26D07C' }]} />
          <Text style={styles.legendText}>פתוח — מוכן לסגל</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#444' }]} />
          <Text style={styles.legendText}>נעול — ענה 4 שאלות</Text>
        </View>
      </View>

      {/* Players grid */}
      {teamPlayers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚽</Text>
          <Text style={styles.emptyTitle}>לא נבחרה קבוצה</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.replace('/onboarding' as never)}
          >
            <Text style={styles.emptyBtnText}>בחר קבוצה</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={teamPlayers}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerLeft: { flex: 1 },
  title: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: '900' },
  subtitle: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2 },
  resetBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginLeft: Spacing.sm,
  },
  resetText: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '700' },

  stageBCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  stageBRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stageBLabel: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  stageBCount: { color: Colors.accent, fontSize: Fonts.sizes.base, fontWeight: '900' },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E2A3A',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#26D07C',
    borderRadius: 5,
  },
  stageBBtn: {
    backgroundColor: '#26D07C',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  stageBBtnLocked: { backgroundColor: '#1E2A3A' },
  stageBBtnText: { color: '#032012', fontWeight: '900', fontSize: Fonts.sizes.sm },
  stageBBtnTextLocked: { color: Colors.textMuted },

  legend: {
    flexDirection: 'row',
    gap: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },

  row: { justifyContent: 'space-between', marginBottom: CARD_GAP },
  listContent: { paddingHorizontal: Spacing.base, paddingBottom: 100 },

  // Player slot
  slot: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0D1628',
  },
  slotLocked: {
    borderWidth: 1,
    borderColor: '#2A3345',
  },
  slotUnlocked: {
    borderWidth: 2,
    borderColor: '#26D07C',
    shadowColor: '#26D07C',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  slotImage: {
    ...StyleSheet.absoluteFillObject,
  },
  slotImageDark: {
    opacity: 0.25,
  },
  slotFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotInitial: { fontSize: 52, fontWeight: '900' },

  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  lockIcon: { fontSize: 28 },
  lockProgress: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: '900' },
  lockHint: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },

  slotBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingTop: 24,
  },
  slotName: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '800' },
  slotPos: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '600' },

  unlockedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.full,
    padding: 3,
  },
  unlockedBadgeText: { fontSize: 16 },

  jerseyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  jerseyBadgeActive: { borderColor: 'rgba(38,208,124,0.5)' },
  jerseyNum: { color: Colors.text, fontSize: Fonts.sizes.xs, fontWeight: '800' },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: '700' },
  emptyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyBtnText: { color: Colors.primary, fontWeight: '900', fontSize: Fonts.sizes.base },
});
