import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BorderRadius, Colors, Fonts, Spacing } from '../../constants/theme';
import { getPlayerById, Player, PLAYERS } from '../../constants/players';
import { Lineup, LineupSlot, useGameState } from '../../hooks/useGameState';
import { positionToHebrew } from '../../constants/hebrew';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

type SlotGroup = 'gk' | 'back' | 'front';

const USER_TEAM_NAME = 'ברהום';

const SLOT_META: { slot: LineupSlot; label: string; group: SlotGroup }[] = [
  { slot: 'gk', label: 'שוער', group: 'gk' },
  { slot: 'cb1', label: 'בלם 1', group: 'back' },
  { slot: 'cb2', label: 'בלם 2', group: 'back' },
  { slot: 'lb', label: 'מגן שמאלי', group: 'back' },
  { slot: 'rb', label: 'מגן ימני', group: 'back' },
  { slot: 'cm1', label: 'קשר מרכזי 1', group: 'front' },
  { slot: 'cm2', label: 'קשר מרכזי 2', group: 'front' },
  { slot: 'cm3', label: 'קשר מרכזי 3', group: 'front' },
  { slot: 'lw', label: 'כנף שמאל', group: 'front' },
  { slot: 'rw', label: 'כנף ימין', group: 'front' },
  { slot: 'st', label: 'חלוץ', group: 'front' },
];
const SLOT_LAYOUT: Record<LineupSlot, { x: string; y: string }> = {
  gk: { x: '50%', y: '90%' },
  lb: { x: '18%', y: '72%' },
  cb1: { x: '40%', y: '75%' },
  cb2: { x: '60%', y: '75%' },
  rb: { x: '82%', y: '72%' },
  cm1: { x: '30%', y: '50%' },
  cm2: { x: '50%', y: '46%' },
  cm3: { x: '70%', y: '50%' },
  lw: { x: '24%', y: '24%' },
  st: { x: '50%', y: '18%' },
  rw: { x: '76%', y: '24%' },
};

function resultTitle(result: 'win' | 'draw' | 'loss') {
  if (result === 'win') return 'ניצחון גדול!';
  if (result === 'draw') return 'תיקו קשוח';
  return 'הפסד, ממשיכים קדימה';
}

const TEAM_LOGOS: Record<string, string> = {
  'Real Madrid': 'https://crests.football-data.org/86.svg',
  'Barcelona': 'https://crests.football-data.org/81.svg',
  'Manchester City': 'https://crests.football-data.org/65.svg',
  Liverpool: 'https://crests.football-data.org/64.svg',
  Arsenal: 'https://crests.football-data.org/57.svg',
  'Bayern Munich': 'https://crests.football-data.org/5.svg',
  'Inter Milan': 'https://crests.football-data.org/108.svg',
  Juventus: 'https://crests.football-data.org/109.svg',
  PSG: 'https://crests.football-data.org/524.svg',
};

function teamLogo(team: string) {
  return TEAM_LOGOS[team] ?? null;
}

function MatchQuiz({
  onComplete,
}: {
  onComplete: (success: boolean) => void;
}) {
  const randomPlayer = useMemo(() => {
    const pool = PLAYERS.filter((p) => p.quizQuestions && p.quizQuestions.length > 0);
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const randomQuestion = useMemo(() => {
    const questions = randomPlayer.quizQuestions;
    return questions[Math.floor(Math.random() * questions.length)];
  }, [randomPlayer]);

  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === randomQuestion.correctIndex;
    setIsCorrect(correct);
    setTimeout(() => {
      onComplete(correct);
    }, 1500);
  };

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.quizTitle}>שאלת בונוס להכפלת מטבעות! 💰</Text>
      <Text style={styles.quizQuestion}>{randomQuestion.question}</Text>
      <View style={styles.answersGrid}>
        {randomQuestion.answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerBtn,
              selected === index && (isCorrect ? styles.answerBtnCorrect : styles.answerBtnWrong),
            ]}
            onPress={() => handleAnswer(index)}
            disabled={selected !== null}
          >
            <Text style={styles.answerText}>{answer}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ManagementScreen() {
  const router = useRouter();
  const { state, getUnlockedPlayers, saveLineup, playNextRound, resetSeason, addCoins } = useGameState();

  const unlockedPlayers = useMemo(() => {
    return getUnlockedPlayers()
      .map((id) => getPlayerById(id))
      .filter((p): p is Player => Boolean(p));
  }, [getUnlockedPlayers]);

  const [lineupDraft, setLineupDraft] = useState<Lineup>(state.lineup);
  const [activeSlot, setActiveSlot] = useState<LineupSlot | null>(null);
  const [resultModal, setResultModal] = useState<{
    title: string;
    round: number;
    opponent: string;
    goalsFor: number;
    goalsAgainst: number;
    coins: number;
    seasonFinished: boolean;
    finalPosition: number;
    isChampion: boolean;
    championshipBonus: number;
  } | null>(null);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDoubled, setQuizDoubled] = useState(false);

  const usedIds = useMemo(() => Object.values(lineupDraft).filter((v): v is string => Boolean(v)), [lineupDraft]);
  const lineupCount = usedIds.length;

  const activeGroup = SLOT_META.find((s) => s.slot === activeSlot)?.group;
  const activeCandidates = useMemo(() => {
    if (!activeGroup) return [];
    if (activeGroup === 'gk') return unlockedPlayers.filter((p) => p.position === 'Goalkeeper');
    if (activeGroup === 'back') return unlockedPlayers.filter((p) => p.position === 'Defender');
    return unlockedPlayers.filter((p) => p.position === 'Midfielder' || p.position === 'Forward');
  }, [activeGroup, unlockedPlayers]);

  const seasonFinished = state.currentRound >= state.seasonRounds.length;
  const currentRoundObj = state.seasonRounds[state.currentRound];
  const nextMatch = currentRoundObj?.fixtures.find((f) => f.home === USER_TEAM_NAME || f.away === USER_TEAM_NAME);

  const handleAssignPlayer = (playerId: string) => {
    if (!activeSlot) return;
    const existsElsewhere = Object.entries(lineupDraft).some(([slot, id]) => slot !== activeSlot && id === playerId);
    if (existsElsewhere) {
      Alert.alert('שחקן כבר בהרכב', 'לא ניתן לשבץ שחקן פעמיים בהרכב.');
      return;
    }
    setLineupDraft((prev) => ({ ...prev, [activeSlot]: playerId }));
  };

  const handleSaveLineup = () => {
    if (lineupCount < 11) {
      Alert.alert('הרכב לא מלא', 'צריך לשבץ 11 שחקנים לפני משחק.');
      return;
    }
    saveLineup(lineupDraft);
    Alert.alert('נשמר', 'ההרכב נשמר בהצלחה.');
  };

  const handleAutoLineup = () => {
    const byRole = {
      gk: unlockedPlayers.filter((p) => p.position === 'Goalkeeper'),
      back: unlockedPlayers.filter((p) => p.position === 'Defender'),
      front: unlockedPlayers.filter((p) => p.position === 'Midfielder' || p.position === 'Forward'),
    };

    const pickUnused = (pool: Player[], used: Set<string>) => {
      const next = pool.find((p) => !used.has(p.id));
      return next?.id ?? null;
    };

    const used = new Set<string>();
    const nextLineup: Lineup = { ...lineupDraft };

    SLOT_META.forEach((slotMeta) => {
      const pool = slotMeta.group === 'gk' ? byRole.gk : slotMeta.group === 'back' ? byRole.back : byRole.front;
      const picked = pickUnused(pool, used);
      nextLineup[slotMeta.slot] = picked;
      if (picked) used.add(picked);
    });

    const completed = Object.values(nextLineup).filter(Boolean).length;
    setLineupDraft(nextLineup);

    if (completed < 11) {
      Alert.alert('הרכב אוטומטי חלקי', `הוגדרו ${completed}/11 שחקנים. אין מספיק שחקנים מתאימים לכל העמדות.`);
      return;
    }

    Alert.alert('הרכב אוטומטי מוכן', 'המערכת בחרה עבורך הרכב מלא לפי העמדות.');
  };

  const handlePlayRound = () => {
    const out = playNextRound();
    if (!out.ok) {
      if (out.reason === 'lineup_incomplete') {
        Alert.alert('הרכב חסר', 'צריך הרכב מלא של 11 שחקנים לפני משחק.');
        return;
      }
      Alert.alert('העונה הסתיימה', 'סיימתם את כל המחזורים. אפשר להתחיל עונה חדשה.');
      return;
    }

    setResultModal({
      title: resultTitle(out.result),
      round: out.round,
      opponent: out.opponent,
      goalsFor: out.goalsFor,
      goalsAgainst: out.goalsAgainst,
      coins: out.coins,
      seasonFinished: out.seasonFinished,
      finalPosition: out.finalPosition,
      isChampion: out.isChampion,
      championshipBonus: out.championshipBonus,
    });
    setQuizDoubled(false);
    setShowQuiz(false);
  };

  const handleDoubleCoins = () => {
    setShowQuiz(true);
  };

  const onQuizComplete = (success: boolean) => {
    if (success && resultModal) {
      addCoins(resultModal.coins);
      setQuizDoubled(true);
      Alert.alert('כל הכבוד!', `ענית נכון והכפלת את המטבעות ב-${resultModal.coins}!`);
    } else if (!success) {
      Alert.alert('לא נורא', 'אולי בפעם הבאה...');
    }
    setShowQuiz(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
      <View style={styles.header}>
        <Text style={styles.title}>ניהול קבוצה</Text>
        <Text style={styles.subtitle}>מנהלים ליגה מלאה: הרכב, מחזורים וטבלה</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>מצב עונה</Text>
        <Text style={styles.cardText}>מחזור נוכחי: {Math.min(state.currentRound + 1, state.seasonRounds.length)} / {state.seasonRounds.length}</Text>
        <Text style={styles.cardText}>מטבעות: {state.coins}</Text>
        <Text style={styles.cardText}>מאזן: {state.matchStats.wins} ניצחונות / {state.matchStats.draws} תיקו / {state.matchStats.losses} הפסדים</Text>
        <Text style={styles.cardText}>
          {seasonFinished
            ? 'העונה הסתיימה'
            : `המשחק הבא: ${nextMatch?.home === USER_TEAM_NAME ? nextMatch?.away : nextMatch?.home}`}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleAutoLineup}>
          <Text style={styles.secondaryBtnText}>קבע הרכב אוטומטי</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveLineup}>
          <Text style={styles.primaryBtnText}>שמור הרכב</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.greenBtn} onPress={handlePlayRound}>
          <Text style={styles.greenBtnText}>שחק מחזור</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>הרכב על המגרש ({lineupCount}/11)</Text>
        <View style={styles.pitch}>
          <View style={styles.pitchMidLine} />
          <View style={styles.pitchCenterCircle} />
          {SLOT_META.map((meta) => {
            const playerId = lineupDraft[meta.slot];
            const player = playerId ? getPlayerById(playerId) : null;
            const active = activeSlot === meta.slot;
            const pos = SLOT_LAYOUT[meta.slot];
            return (
              <TouchableOpacity
                key={meta.slot}
                onPress={() => setActiveSlot(meta.slot)}
                style={[
                  styles.slotMarker,
                  {
                    left: pos.x as any,
                    top: pos.y as any,
                    marginLeft: -44,
                    marginTop: -26,
                  },
                  active && styles.slotMarkerActive,
                ]}
              >
                <Text style={styles.slotLabel}>{meta.label}</Text>
                <Text style={styles.slotValue} numberOfLines={1}>
                  {player ? player.displayName : 'בחר'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{activeSlot ? `שחקנים זמינים` : 'בחר סלוט כדי לשבץ שחקן'}</Text>
        {activeSlot ? (
          <View style={styles.playersListContainer}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
              {activeCandidates.map((item) => {
                const taken = usedIds.includes(item.id);
                const selectedForThisSlot = lineupDraft[activeSlot] === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.playerRow, selectedForThisSlot && styles.playerRowActive, taken && !selectedForThisSlot && styles.playerRowDisabled]}
                    onPress={() => handleAssignPlayer(item.id)}
                    disabled={taken && !selectedForThisSlot}
                  >
                    <View>
                      <Text style={styles.playerName}>{item.name}</Text>
                      <Text style={styles.playerMeta}>{item.team} · {positionToHebrew(item.position)}</Text>
                    </View>
                    <Text style={styles.playerAction}>{selectedForThisSlot ? '✓' : taken ? 'בשימוש' : 'שבץ'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.emptyText}>בחר עמדה ואז שחקן מהרשימה.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>טבלת ליגה</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.teamCol]}>קבוצה</Text>
          <Text style={styles.tableCell}>מ׳</Text>
          <Text style={styles.tableCell}>נ׳</Text>
          <Text style={styles.tableCell}>ת׳</Text>
          <Text style={styles.tableCell}>ה׳</Text>
          <Text style={styles.tableCell}>הפ׳</Text>
        </View>
        <View style={{ maxHeight: 190 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
            {state.leagueTable.map((item, index) => (
              <View key={item.team} style={[styles.tableRow, item.team === USER_TEAM_NAME && styles.tableRowMine]}>
                <Text style={[styles.tableCell, styles.teamCol]} numberOfLines={1}>{index + 1}. {item.team}</Text>
                <Text style={styles.tableCell}>{item.played}</Text>
                <Text style={styles.tableCell}>{item.wins}</Text>
                <Text style={styles.tableCell}>{item.draws}</Text>
                <Text style={styles.tableCell}>{item.losses}</Text>
                <Text style={styles.tableCell}>{item.pts}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>משחקי המחזור הנוכחי</Text>
        <View style={{ maxHeight: 150 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
            {(currentRoundObj?.fixtures ?? []).map((item, i) => (
              <View key={`${item.home}-${item.away}-${i}`} style={styles.fixtureRow}>
                <Text style={styles.fixtureText}>{item.home} - {item.away}</Text>
                <Text style={styles.fixtureScore}>{item.played ? `${item.homeGoals}:${item.awayGoals}` : 'טרם שוחק'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={resetSeason}>
          <Text style={styles.secondaryBtnText}>עונה חדשה</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <Modal visible={Boolean(resultModal)} transparent animationType="fade">
        <View style={styles.resultOverlay}>
          <LinearGradient colors={['#101b30', '#172a47']} style={styles.resultCard}>
            {showQuiz ? (
              <MatchQuiz onComplete={onQuizComplete} />
            ) : (
              <>
                <Text style={styles.resultTitle}>{resultModal?.title}</Text>
                <Text style={styles.resultRound}>מחזור {resultModal?.round}</Text>
                <View style={styles.resultTeamsRow}>
                  <View style={styles.teamSide}>
                    <View style={styles.logoFallback}><Text style={styles.logoFallbackText}>בית</Text></View>
                    <Text style={styles.teamName}>{USER_TEAM_NAME}</Text>
                  </View>
                  <Text style={styles.scoreText}>{resultModal?.goalsFor} : {resultModal?.goalsAgainst}</Text>
                  <View style={styles.teamSide}>
                    {teamLogo(resultModal?.opponent ?? '') ? (
                      <Image source={{ uri: teamLogo(resultModal?.opponent ?? '')! }} style={styles.teamLogo} contentFit="contain" />
                    ) : (
                      <View style={styles.logoFallback}><Text style={styles.logoFallbackText}>חוץ</Text></View>
                    )}
                    <Text style={styles.teamName}>{resultModal?.opponent}</Text>
                  </View>
                </View>
                <Text style={styles.coinsText}>+{resultModal?.coins}{quizDoubled ? ' x 2' : ''} מטבעות</Text>

                {!quizDoubled && (
                  <TouchableOpacity style={styles.doubleBtn} onPress={handleDoubleCoins}>
                    <Text style={styles.doubleBtnText}>הכפל מטבעות! ✨</Text>
                  </TouchableOpacity>
                )}

                {resultModal?.isChampion && (
                  <View style={styles.championBox}>
                    <Text style={styles.championTitle}>🏆 זכית באליפות!</Text>
                    <Text style={styles.championText}>סיימת את העונה במקום הראשון.</Text>
                    <Text style={styles.championText}>בונוס אליפות: +{resultModal.championshipBonus} מטבעות</Text>
                  </View>
                )}
                {resultModal?.seasonFinished && !resultModal?.isChampion && (
                  <View style={styles.championBox}>
                    <Text style={styles.championTitle}>סיום עונה</Text>
                    <Text style={styles.championText}>סיימת במקום {resultModal.finalPosition}. כל הכבוד!</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.closeResultBtn} onPress={() => setResultModal(null)}>
                  <Text style={styles.closeResultText}>המשך</Text>
                </TouchableOpacity>
              </>
            )}
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  scrollContent: { paddingBottom: Spacing.base },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: Spacing.sm },
  title: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: '900' },
  subtitle: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 4 },
  card: { marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderRadius: BorderRadius.md, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, padding: Spacing.base },
  cardTitle: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: '800', marginBottom: Spacing.xs },
  cardText: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  primaryBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: BorderRadius.full, alignItems: 'center', paddingVertical: Spacing.sm },
  primaryBtnText: { color: Colors.primary, fontWeight: '900', fontSize: Fonts.sizes.sm },
  greenBtn: { flex: 1, backgroundColor: '#26D07C', borderRadius: BorderRadius.full, alignItems: 'center', paddingVertical: Spacing.sm },
  greenBtnText: { color: '#032012', fontWeight: '900', fontSize: Fonts.sizes.sm },
  pitch: {
    height: 360,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#0F5D2A',
    borderWidth: 2,
    borderColor: '#CDE7CE',
    position: 'relative',
    overflow: 'hidden',
  },
  pitchMidLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  pitchCenterCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    left: '50%',
    top: '50%',
    marginLeft: -40,
    marginTop: -40,
  },
  slotMarker: {
    width: 88,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(8, 30, 17, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    position: 'absolute',
  },
  slotMarkerActive: { borderColor: Colors.accent, backgroundColor: 'rgba(0,212,255,0.18)' },
  slotLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '700' },
  slotValue: { color: Colors.text, fontSize: Fonts.sizes.sm, marginTop: 2, fontWeight: '700' },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#20293B', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.xs, borderWidth: 1, borderColor: Colors.border },
  playerRowActive: { borderColor: '#26D07C', backgroundColor: 'rgba(38,208,124,0.15)' },
  playerRowDisabled: { opacity: 0.45 },
  playerName: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '800' },
  playerMeta: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  playerAction: { color: Colors.accent, fontSize: Fonts.sizes.xs, fontWeight: '800' },
  playersListContainer: {
    maxHeight: 220,
  },
  emptyText: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, textAlign: 'center', paddingVertical: Spacing.sm },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 4 },
  tableRowMine: { backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 6 },
  tableCell: { color: Colors.text, fontSize: Fonts.sizes.xs, width: '10%', textAlign: 'center' },
  teamCol: { width: '50%', textAlign: 'left', paddingLeft: 4 },
  fixtureRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 6 },
  fixtureText: { color: Colors.text, fontSize: Fonts.sizes.sm, flex: 1, marginRight: 8 },
  fixtureScore: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  secondaryBtn: { flex: 1, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, alignItems: 'center', paddingVertical: Spacing.sm },
  secondaryBtnText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  resultOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: Spacing.base },
  resultCard: { width: '100%', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: Spacing.lg, alignItems: 'center' },
  resultTitle: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: '900' },
  resultRound: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2, marginBottom: Spacing.base },
  resultTeamsRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.base },
  teamSide: { alignItems: 'center', width: '33%' },
  teamLogo: { width: 56, height: 56, marginBottom: 6 },
  logoFallback: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#223858', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  logoFallbackText: { color: Colors.text, fontWeight: '800' },
  teamName: { color: Colors.text, fontSize: Fonts.sizes.xs, textAlign: 'center' },
  scoreText: { color: Colors.text, fontSize: 42, fontWeight: '900', width: '34%', textAlign: 'center' },
  coinsText: { color: '#86F0A9', fontSize: Fonts.sizes.lg, fontWeight: '900', marginBottom: Spacing.base },
  closeResultBtn: { backgroundColor: Colors.accent, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  closeResultText: { color: Colors.primary, fontWeight: '900', fontSize: Fonts.sizes.base },
  championBox: {
    width: '100%',
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.55)',
    backgroundColor: 'rgba(255,215,0,0.12)',
    padding: Spacing.sm,
    alignItems: 'center',
  },
  championTitle: { color: '#FFE27A', fontSize: Fonts.sizes.base, fontWeight: '900', marginBottom: 4 },
  championText: { color: Colors.text, fontSize: Fonts.sizes.sm, textAlign: 'center' },
  // Quiz Styles
  quizContainer: { width: '100%', alignItems: 'center', paddingVertical: Spacing.base },
  quizTitle: { color: Colors.accent, fontSize: Fonts.sizes.lg, fontWeight: '900', textAlign: 'center', marginBottom: Spacing.base },
  quizQuestion: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.lg },
  answersGrid: { width: '100%', gap: Spacing.sm },
  answerBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BorderRadius.md, padding: Spacing.base, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  answerBtnCorrect: { backgroundColor: 'rgba(38, 208, 124, 0.2)', borderColor: '#26D07C' },
  answerBtnWrong: { backgroundColor: 'rgba(255, 68, 68, 0.2)', borderColor: '#FF4444' },
  answerText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '600', textAlign: 'center' },
  doubleBtn: { backgroundColor: 'rgba(255, 215, 0, 0.2)', borderWidth: 1, borderColor: '#FFD700', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginBottom: Spacing.base },
  doubleBtnText: { color: '#FFD700', fontWeight: '900', fontSize: Fonts.sizes.sm },
});
