import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { getTeamByName, formatCapacity } from '../../constants/teams';
import { getPlayersByTeam } from '../../constants/players';
import { positionToHebrew } from '../../constants/hebrew';

const { width: W } = Dimensions.get('window');

export default function TeamScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const team = getTeamByName(name ?? '');
  const players = getPlayersByTeam(name ?? '');

  if (!team) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← חזרה</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>קבוצה לא נמצאה</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Header */}
        <LinearGradient
          colors={[team.color + 'CC', team.secondary + '88', Colors.primary]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← חזרה</Text>
          </TouchableOpacity>

          {team.badgeUrl ? (
            <Image
              source={{ uri: team.badgeUrl }}
              style={styles.badge}
              contentFit="contain"
              transition={300}
            />
          ) : (
            <LinearGradient
              colors={[team.color, team.secondary]}
              style={styles.badgeFallback}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.badgeInitials}>
                {team.displayName.slice(0, 2)}
              </Text>
            </LinearGradient>
          )}

          <Text style={styles.teamName}>{team.displayName}</Text>
          <Text style={styles.teamMeta}>{team.city} · {team.country}</Text>
          <View style={styles.leagueChip}>
            <Text style={styles.leagueText}>{team.league}</Text>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBox emoji="🏆" label="אליפויות" value={String(team.leagueTitles)} />
          <StatBox emoji="🌍" label="גביעי אירופה" value={String(team.europeanTitles)} />
          <StatBox emoji="📅" label="נוסד" value={String(team.founded)} />
          <StatBox emoji="👥" label="שחקנים" value={String(players.length)} />
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏟️ אצטדיון</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="🏟️" label="שם" value={team.stadium} />
            <InfoRow icon="👥" label="קיבולת" value={formatCapacity(team.stadiumCapacity) + ' איש'} />
            <InfoRow icon="🌆" label="עיר" value={team.city} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 פרטים</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="📅" label="שנת הקמה" value={String(team.founded)} />
            <InfoRow icon="🏷️" label="כינוי" value={team.nickname} />
            <InfoRow icon="🏆" label="אליפויות מקומיות" value={String(team.leagueTitles)} />
            <InfoRow icon="🌍" label="גביעי אירופה" value={String(team.europeanTitles)} />
          </View>
        </View>

        {/* Fun Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 ידעת?</Text>
          {team.funFacts.map((fact, i) => (
            <View key={i} style={styles.factCard}>
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>

        {/* Players */}
        {players.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚽ השחקנים שלנו ({players.length})</Text>
            <View style={styles.playersList}>
              {players.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerRow}
                  onPress={() => router.push(`/wallpaper/${player.id}`)}
                  activeOpacity={0.8}
                >
                  {player.directImageUrl ? (
                    <Image
                      source={{ uri: player.directImageUrl }}
                      style={styles.playerThumb}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <LinearGradient
                      colors={[team.color + 'AA', team.secondary + '66']}
                      style={styles.playerThumb}
                    >
                      <Text style={styles.playerInitial}>
                        {player.displayName.charAt(0)}
                      </Text>
                    </LinearGradient>
                  )}
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.displayName}</Text>
                    <Text style={styles.playerPos}>{positionToHebrew(player.position)}</Text>
                  </View>
                  <View style={styles.jerseyBadge}>
                    <Text style={styles.jerseyNum}>#{player.jerseyNumber}</Text>
                  </View>
                  <Text style={styles.playerArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },

  hero: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backText: { color: Colors.accent, fontSize: Fonts.sizes.base, fontWeight: '700' },
  badge: { width: 110, height: 110, marginBottom: Spacing.base },
  badgeFallback: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  badgeInitials: { color: '#FFF', fontSize: 38, fontWeight: '900' },
  teamName: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: '900', textAlign: 'center' },
  teamMeta: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 4, textAlign: 'center' },
  leagueChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 4,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  leagueText: { color: Colors.text, fontSize: Fonts.sizes.xs, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.base,
    marginTop: -Spacing.base,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 22, marginBottom: 2 },
  statValue: { color: Colors.accent, fontSize: Fonts.sizes.lg, fontWeight: '900' },
  statLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' },

  section: { paddingHorizontal: Spacing.base, marginTop: Spacing.lg },
  sectionTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.base,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },

  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  infoIcon: { fontSize: 16, width: 24 },
  infoLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, flex: 1, fontWeight: '600' },
  infoValue: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '700', textAlign: 'left', flex: 2 },

  factCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  factText: { color: Colors.text, fontSize: Fonts.sizes.sm, lineHeight: 22 },

  playersList: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  playerThumb: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  playerInitial: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  playerInfo: { flex: 1 },
  playerName: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  playerPos: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  jerseyBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jerseyNum: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '800' },
  playerArrow: { color: Colors.accent, fontSize: 20, fontWeight: '700' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.textMuted, fontSize: Fonts.sizes.lg },
});
