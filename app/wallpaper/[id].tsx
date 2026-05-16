import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { getPlayerById } from '../../constants/players';
import { downloadImage, shareImage, setAsWallpaper } from '../../services/imageService';
import InterstitialAdModal from '../../components/InterstitialAdModal';
import AdBanner from '../../components/AdBanner';
import { useGameState } from '../../hooks/useGameState';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Tab = 'info' | 'quiz' | 'wallpaper';

function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={toastStyles.container}>
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.xxl,
    right: Spacing.xxl,
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    zIndex: 999,
  },
  text: { color: '#FFFFFF', fontSize: Fonts.sizes.sm, fontWeight: '700' },
});

// ─── Info Tab ────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.icon}>{icon}</Text>
      <View style={infoStyles.rowContent}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  icon: { fontSize: 20, width: 28, textAlign: 'center' },
  rowContent: { flex: 1 },
  label: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '600', marginBottom: 2 },
  value: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: '700' },
});

// ─── Quiz Tab ────────────────────────────────────────────────────────────────

function QuizTab({
  playerId,
  questions,
}: {
  playerId: string;
  questions: { question: string; answers: string[]; correctIndex: number }[];
}) {
  const { getPlayerProgress, answerQuestion } = useGameState();
  const progress = getPlayerProgress(playerId);
  const [currentQ, setCurrentQ] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const unanswered = questions
    .map((_, i) => i)
    .filter((i) => !progress.answeredIndices.includes(i));

  const handleStart = (qIndex: number) => {
    setCurrentQ(qIndex);
    setSelected(null);
    setRevealed(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (revealed) return;
    setSelected(answerIndex);
    setRevealed(true);
  };

  const handleNext = () => {
    if (currentQ === null) return;
    const correct = selected === questions[currentQ].correctIndex;
    answerQuestion(playerId, currentQ, correct);
    setCurrentQ(null);
    setSelected(null);
    setRevealed(false);
  };

  const correctCount = progress.correctAnswers;
  const totalAnswered = progress.answeredIndices.length;

  if (progress.unlocked) {
    return (
      <View style={quizStyles.unlockedContainer}>
        <Text style={quizStyles.unlockedEmoji}>🏆</Text>
        <Text style={quizStyles.unlockedTitle}>שחקן נפתח!</Text>
        <Text style={quizStyles.unlockedSub}>
          ענית נכון על {correctCount}/4 שאלות{'\n'}השחקן הצטרף לסגל שלך!
        </Text>
      </View>
    );
  }

  if (currentQ !== null) {
    const q = questions[currentQ];
    return (
      <View style={quizStyles.questionContainer}>
        <Text style={quizStyles.questionNumber}>שאלה {currentQ + 1}/4</Text>
        <Text style={quizStyles.questionText}>{q.question}</Text>

        <View style={quizStyles.answers}>
          {q.answers.map((ans, i) => {
            let bg = Colors.card;
            let borderColor = Colors.border;
            let textColor = Colors.text;

            if (revealed) {
              if (i === q.correctIndex) {
                bg = '#1a4a2e';
                borderColor = Colors.green;
                textColor = Colors.green;
              } else if (i === selected && i !== q.correctIndex) {
                bg = '#4a1a1a';
                borderColor = '#FF4444';
                textColor = '#FF4444';
              }
            } else if (selected === i) {
              bg = Colors.accent + '22';
              borderColor = Colors.accent;
            }

            return (
              <TouchableOpacity
                key={i}
                style={[quizStyles.answerBtn, { backgroundColor: bg, borderColor }]}
                onPress={() => handleAnswer(i)}
                disabled={revealed}
                activeOpacity={0.8}
              >
                <Text style={[quizStyles.answerText, { color: textColor }]}>
                  {ans}
                </Text>
                {revealed && i === q.correctIndex && (
                  <Text style={quizStyles.answerIcon}>✓</Text>
                )}
                {revealed && i === selected && i !== q.correctIndex && (
                  <Text style={[quizStyles.answerIcon, { color: '#FF4444' }]}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {revealed && (
          <TouchableOpacity style={quizStyles.nextBtn} onPress={handleNext}>
            <Text style={quizStyles.nextText}>המשך ▶</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={quizStyles.container}>
      {/* Progress */}
      <View style={quizStyles.progressContainer}>
        <Text style={quizStyles.progressTitle}>
          התקדמות: {totalAnswered}/4 שאלות · {correctCount} נכונות
        </Text>
        <View style={quizStyles.progressBar}>
          <View
            style={[quizStyles.progressFill, { width: `${(correctCount / 4) * 100}%` }]}
          />
        </View>
        {correctCount >= 4 ? (
          <Text style={quizStyles.progressHint}>🏆 השחקן נפתח!</Text>
        ) : (
          <Text style={quizStyles.progressHint}>
            ענה נכון על 4 שאלות כדי לפתוח את השחקן
          </Text>
        )}
      </View>

      {/* Questions list */}
      {questions.map((q, i) => {
        const answered = progress.answeredIndices.includes(i);
        return (
          <TouchableOpacity
            key={i}
            style={[quizStyles.qCard, answered && quizStyles.qCardDone]}
            onPress={() => !answered && handleStart(i)}
            disabled={answered}
            activeOpacity={0.8}
          >
            <View style={quizStyles.qCardLeft}>
              <Text style={quizStyles.qNum}>שאלה {i + 1}</Text>
              <Text style={quizStyles.qPreview} numberOfLines={1}>{q.question}</Text>
            </View>
            <Text style={quizStyles.qStatus}>
              {answered ? '✓' : '▶'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const quizStyles = StyleSheet.create({
  container: { padding: Spacing.base, gap: Spacing.sm },
  progressContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressTitle: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '700', marginBottom: Spacing.sm },
  progressBar: {
    height: 8, backgroundColor: Colors.border,
    borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.xs,
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  progressHint: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  qCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  qCardDone: { borderColor: Colors.green, backgroundColor: '#1a4a2e22' },
  qCardLeft: { flex: 1 },
  qNum: { color: Colors.accent, fontSize: Fonts.sizes.xs, fontWeight: '700', marginBottom: 2 },
  qPreview: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  qStatus: { fontSize: 18, color: Colors.green },
  questionContainer: { padding: Spacing.base, gap: Spacing.base },
  questionNumber: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  questionText: {
    color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: '800',
    lineHeight: 28,
  },
  answers: { gap: Spacing.sm },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  answerText: { fontSize: Fonts.sizes.base, fontWeight: '700', flex: 1 },
  answerIcon: { fontSize: 20, color: Colors.green, fontWeight: '900' },
  nextBtn: {
    backgroundColor: Colors.accent,
    padding: Spacing.base,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  nextText: { color: Colors.primary, fontSize: Fonts.sizes.base, fontWeight: '900' },
  unlockedContainer: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.base },
  unlockedEmoji: { fontSize: 64 },
  unlockedTitle: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: '900' },
  unlockedSub: { color: Colors.textMuted, fontSize: Fonts.sizes.base, textAlign: 'center', lineHeight: 24 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function WallpaperDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const player = getPlayerById(id ?? '');
  const imageUrl = player?.directImageUrl ?? null;

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'download' | 'wallpaper' | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const handleDownload = () => {
    if (!imageUrl) { Alert.alert('שגיאה', 'אין תמונה להורדה'); return; }
    setPendingAction('download');
    setShowAd(true);
  };

  const handleSetWallpaper = () => {
    if (!imageUrl) { Alert.alert('שגיאה', 'אין תמונה'); return; }
    setPendingAction('wallpaper');
    setShowAd(true);
  };

  const handleShare = async () => {
    if (!imageUrl) { Alert.alert('שגיאה', 'אין תמונה לשיתוף'); return; }
    try { await shareImage(imageUrl, player?.name); }
    catch { Alert.alert('שגיאה', 'לא ניתן לשתף את התמונה'); }
  };

  const handleAdClose = async () => {
    setShowAd(false);
    if (!imageUrl || !player) return;
    setActionLoading(true);
    try {
      if (pendingAction === 'download') {
        const success = await downloadImage(imageUrl, player.name);
        if (success) showToast('✅ נשמר בגלריה!');
        else Alert.alert('שמירה נכשלה', 'ב-Expo Go לא ניתן לשמור לגלריה.\nב-APK המלא זה יעבוד! 🚀', [{ text: 'הבנתי' }]);
      } else if (pendingAction === 'wallpaper') {
        const success = await setAsWallpaper(imageUrl, player.name);
        if (success) showToast('✅ הטפט נשמר!');
        else Alert.alert('שגיאה', 'לא ניתן להגדיר את הטפט');
      }
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  if (!player) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>⚽ שחקן לא נמצא</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>חזור</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Hero image — top 40% */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
          />
        ) : (
          <LinearGradient
            colors={[player.teamColor, player.teamColorSecondary, Colors.primary]}
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.fallbackView}>
              <Text style={styles.fallbackInitial}>{player.displayName.charAt(0)}</Text>
            </View>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(10,14,26,0.5)', 'rgba(10,14,26,0.98)']}
          style={styles.bottomGradient}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(10,14,26,0.7)', 'transparent']}
          style={styles.topGradient}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Top buttons */}
      <SafeAreaView style={styles.topButtons} edges={['top']}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Text style={styles.iconButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => setIsFavorite(!isFavorite)}>
          <Text style={styles.iconButtonText}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Player name + team — over the image */}
      <View style={styles.heroInfo}>
        <Text style={styles.playerName}>{player.name}</Text>
        <View style={styles.teamRow}>
          <View style={[styles.teamDot, { backgroundColor: player.teamColor }]} />
          <Text style={styles.teamText}>{player.team} · {player.league}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['info', 'quiz', 'wallpaper'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'info' ? '📋 פרופיל' : t === 'quiz' ? '🧠 שאלות' : '🖼 טפט'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && (
          <View style={{ padding: Spacing.base }}>
            <InfoRow icon="🎂" label="תאריך לידה" value={player.birthDate} />
            <InfoRow icon="📍" label="עיר לידה" value={player.birthPlace} />
            <InfoRow icon="📏" label="גובה" value={player.height} />
            <InfoRow icon="⚖️" label="משקל" value={player.weight} />
            <InfoRow icon="🌍" label="לאומיות" value={player.nationality} />
            <InfoRow icon="⚽" label="עמדה" value={player.position} />
            <InfoRow icon="🔢" label="מספר חולצה" value={`#${player.jerseyNumber}`} />
            {player.formerTeams.length > 0 && (
              <InfoRow
                icon="🏟️"
                label="קבוצות קודמות"
                value={player.formerTeams.join(' → ')}
              />
            )}
            <View style={styles.funFactCard}>
              <Text style={styles.funFactTitle}>💡 ידעת?</Text>
              <Text style={styles.funFactText}>{player.funFact}</Text>
            </View>
          </View>
        )}

        {activeTab === 'quiz' && (
          <QuizTab playerId={player.id} questions={player.quizQuestions} />
        )}

        {activeTab === 'wallpaper' && (
          <View style={styles.wallpaperActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownload}
              disabled={actionLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[Colors.accent, '#0099BB']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionEmoji}>💾</Text>
                <Text style={styles.actionTextPrimary}>שמור לגלריה</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={handleSetWallpaper}
                disabled={actionLoading}
              >
                <Text style={styles.actionEmoji}>📱</Text>
                <Text style={styles.actionText}>הגדר כטפט</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={handleShare}
                disabled={actionLoading}
              >
                <Text style={styles.actionEmoji}>📤</Text>
                <Text style={styles.actionText}>שתף</Text>
              </TouchableOpacity>
            </View>

            <AdBanner />
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <InterstitialAdModal visible={showAd} onClose={handleAdClose} />
      <Toast message={toastMessage} visible={toastVisible} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.primary },
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.38,
    position: 'relative',
  },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  fallbackView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackInitial: {
    color: 'rgba(255,255,255,0.9)', fontSize: 100, fontWeight: '900',
  },
  topButtons: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm,
    zIndex: 10,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(10,14,26,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  iconButtonText: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  heroInfo: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
  },
  playerName: {
    color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: '900',
    letterSpacing: -1, marginBottom: 4,
  },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  teamDot: { width: 8, height: 8, borderRadius: 4 },
  teamText: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  tab: {
    flex: 1, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, fontWeight: '700' },
  tabTextActive: { color: Colors.primary },
  tabContent: { flex: 1 },
  funFactCard: {
    marginTop: Spacing.base,
    backgroundColor: Colors.accent + '18',
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  funFactTitle: { color: Colors.accent, fontSize: Fonts.sizes.sm, fontWeight: '800', marginBottom: Spacing.xs },
  funFactText: { color: Colors.text, fontSize: Fonts.sizes.base, lineHeight: 22, fontWeight: '500' },
  wallpaperActions: { padding: Spacing.base, gap: Spacing.sm },
  actionButton: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  actionGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: Spacing.base, gap: Spacing.sm,
  },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionButtonSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: Colors.card,
    borderRadius: BorderRadius.full, paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs, borderWidth: 1, borderColor: Colors.border,
  },
  actionEmoji: { fontSize: 18 },
  actionText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: '700' },
  actionTextPrimary: { color: Colors.primary, fontSize: Fonts.sizes.base, fontWeight: '900' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: Colors.text, fontSize: Fonts.sizes.xl, marginBottom: Spacing.base },
  backLink: { color: Colors.accent, fontSize: Fonts.sizes.base, fontWeight: '700' },
});
