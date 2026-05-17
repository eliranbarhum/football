import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { getPlayerById } from '../../constants/players';
import { downloadImage, shareImage, setAsWallpaper } from '../../services/imageService';

// Map nationality → flag emoji + one-liner
const COUNTRY_DATA: Record<string, { flag: string; fact: string }> = {
  France:      { flag: '🇫🇷', fact: 'צרפת זכתה בגביע העולם פעמיים — 1998 ו-2018!' },
  Brazil:      { flag: '🇧🇷', fact: 'ברזיל היא המדינה עם הכי הרבה גביעי עולם — 5 פעמים!' },
  Argentina:   { flag: '🇦🇷', fact: 'ארגנטינה זכתה בגביע העולם 2022 בקטאר!' },
  Portugal:    { flag: '🇵🇹', fact: 'פורטוגל זכתה ביורו 2016 — ורונאלדו הוביל אותם!' },
  England:     { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', fact: 'אנגליה המציאה את כדורגל המודרני ב-1863!' },
  Spain:       { flag: '🇪🇸', fact: 'ספרד זכתה ב-3 גביעים רצופים: יורו 2008, מונדיאל 2010, יורו 2012!' },
  Germany:     { flag: '🇩🇪', fact: 'גרמניה זכתה בגביע העולם 4 פעמים!' },
  Italy:       { flag: '🇮🇹', fact: 'איטליה ידועה בסגנון המשחק "קטנאצ\'ו" — הגנה מוצקה!' },
  Netherlands: { flag: '🇳🇱', fact: 'הולנד המציאה את "כדורגל הטוטאלי" עם יוהאן קרויף!' },
  Belgium:     { flag: '🇧🇪', fact: 'בלגיה הגיעה למקום ה-3 בגביע העולם 2018!' },
  Norway:      { flag: '🇳🇴', fact: 'נורווגיה ידועה בחורפים עם ספורט שלג — אך גם מגדלת כוכבי כדורגל!' },
  Croatia:     { flag: '🇭🇷', fact: 'קרואטיה עם 4 מיליון תושבים הגיעה לגמר גביע העולם 2018!' },
  Poland:      { flag: '🇵🇱', fact: 'פולין ידועה בלבנדובסקי — אחד החלוצים הטובים בעולם!' },
  Serbia:      { flag: '🇷🇸', fact: 'סרביה מגדלת בעקביות שחקנים מוכשרים לליגות אירופה!' },
  Denmark:     { flag: '🇩🇰', fact: 'דנמרק זכתה ביורו 1992 — הפתעה ענקית!' },
  Sweden:      { flag: '🇸🇪', fact: 'שוודיה הכניסה לעולם את זלאטן איברהימוביץ\'!' },
  Austria:     { flag: '🇦🇹', fact: 'אוסטריה ידועה כמדינה שנותנת הרבה שחקנים לבונדסליגה!' },
  Switzerland: { flag: '🇨🇭', fact: 'שווייץ ידועה בניטרליות — אבל בכדורגל היא לא ניטרלית!' },
  Israel:      { flag: '🇮🇱', fact: 'ישראל מגדלת שחקנים שמשחקים בליגות הגדולות באירופה!' },
  Morocco:     { flag: '🇲🇦', fact: 'מרוקו הגיעה להיסטורית לחצי גמר גביע העולם 2022!' },
  Senegal:     { flag: '🇸🇳', fact: 'סנגל זכתה בגביע אפריקה 2022!' },
  Egypt:       { flag: '🇪🇬', fact: 'מצרים זכתה 7 פעמים בגביע אפריקה — שיא!' },
  Cameroon:    { flag: '🇨🇲', fact: 'קמרון הייתה הקבוצה האפריקאית הראשונה שהגיעה לרבע גמר מונדיאל!' },
  USA:         { flag: '🇺🇸', fact: 'ארה"ב תארח את גביע העולם 2026 יחד עם קנדה ומקסיקו!' },
  Mexico:      { flag: '🇲🇽', fact: 'מקסיקו הגיעה 7 פעמים לרבע גמר גביע העולם!' },
  Colombia:    { flag: '🇨🇴', fact: 'קולומביה ידועה בסגנון משחק מרהיב ומחייך!' },
  Uruguay:     { flag: '🇺🇾', fact: 'אורוגוואי ניצחה בגביע העולם הראשון אי פעם ב-1930!' },
  Japan:       { flag: '🇯🇵', fact: 'יפן מפתיעה בכל טורניר עולמי עם משמעת טקטית!' },
  'South Korea': { flag: '🇰🇷', fact: 'דרום קוריאה הגיעה לחצי גמר מונדיאל 2002!' },
};
import InterstitialAdModal from '../../components/InterstitialAdModal';
import { useGameState } from '../../hooks/useGameState';
import { positionToHebrew } from '../../constants/hebrew';

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
  playerNationality,
}: {
  playerId: string;
  questions: { question: string; answers: string[]; correctIndex: number }[];
  playerNationality: string;
}) {
  const router = useRouter();
  const { getPlayerProgress, answerQuestion } = useGameState();
  const progress = getPlayerProgress(playerId);
  const [currentQ, setCurrentQ] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  // 'idle' | 'correct' | 'wrong'
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const shuffledQuestions = useMemo(() => {
    const shuffle = (arr: string[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    return questions.map((q) => {
      const correctAnswer = q.answers[q.correctIndex];
      const shuffledAnswers = shuffle(q.answers);
      const newCorrectIndex = shuffledAnswers.findIndex((a) => a === correctAnswer);
      return { question: q.question, answers: shuffledAnswers, correctIndex: newCorrectIndex };
    });
  }, [playerId, questions]);

  const handleStart = (qIndex: number) => {
    setCurrentQ(qIndex);
    setSelected(null);
    setAnswerState('idle');
  };

  const handleAnswer = (answerIndex: number) => {
    if (answerState !== 'idle' || currentQ === null) return;
    const isCorrect = answerIndex === shuffledQuestions[currentQ].correctIndex;
    setSelected(answerIndex);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    if (currentQ === null || answerState === 'idle') return;
    const isCorrect = answerState === 'correct';
    const willUnlock = isCorrect && progress.correctAnswers + 1 >= 4;

    if (isCorrect) answerQuestion(playerId, currentQ, true);

    setCurrentQ(null);
    setSelected(null);
    setAnswerState('idle');

    if (willUnlock) {
      setJustUnlocked(true);
      setShowUnlockCelebration(true);
    }
  };

  useEffect(() => {
    if (!justUnlocked || !progress.unlocked) return;
    const timer = setTimeout(() => router.replace('/(tabs)/squad' as never), 900);
    return () => clearTimeout(timer);
  }, [justUnlocked, progress.unlocked, router]);

  const correctCount = progress.correctAnswers;
  const totalAnswered = progress.answeredIndices.length;
  const countryData = COUNTRY_DATA[playerNationality];

  if (progress.unlocked) {
    return (
      <>
        <View style={quizStyles.unlockedContainer}>
          <Text style={quizStyles.unlockedEmoji}>🏆</Text>
          <Text style={quizStyles.unlockedTitle}>שחקן נפתח!</Text>
          <Text style={quizStyles.unlockedSub}>
            ענית נכון על {correctCount}/4 שאלות{'\n'}השחקן הצטרף לסגל שלך!
          </Text>
        </View>

        <Modal visible={showUnlockCelebration} transparent animationType="fade">
          <View style={quizStyles.celebrationBackdrop}>
            <View style={quizStyles.celebrationCard}>
              <Text style={quizStyles.celebrationEmoji}>🎉</Text>
              <Text style={quizStyles.celebrationTitle}>כל הכבוד!</Text>
              <Text style={quizStyles.celebrationText}>
                פתחת את השחקן בהצלחה והוא מוכן לשחק בסגל שלך.
              </Text>

              {/* Country fact bonus */}
              {countryData && (
                <View style={quizStyles.countryFactBox}>
                  <Text style={quizStyles.countryFactFlag}>{countryData.flag}</Text>
                  <Text style={quizStyles.countryFactText}>{countryData.fact}</Text>
                </View>
              )}

              <TouchableOpacity
                style={quizStyles.celebrationPrimary}
                onPress={() => { setShowUnlockCelebration(false); router.push('/(tabs)/squad' as never); }}
              >
                <Text style={quizStyles.celebrationPrimaryText}>לעבור להסגל שלי</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={quizStyles.celebrationSecondary}
                onPress={() => setShowUnlockCelebration(false)}
              >
                <Text style={quizStyles.celebrationSecondaryText}>להישאר כאן</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // ── Active question view ──
  if (currentQ !== null) {
    const q = shuffledQuestions[currentQ];
    const isWrong = answerState === 'wrong';
    const isCorrect = answerState === 'correct';

    return (
      <View style={quizStyles.questionContainer}>
        <Text style={quizStyles.questionNumber}>שאלה {currentQ + 1}/4</Text>
        <Text style={quizStyles.questionText}>{q.question}</Text>

        <View style={quizStyles.answers}>
          {q.answers.map((ans, i) => {
            let bg = Colors.card;
            let borderColor = Colors.border;
            let textColor = Colors.text;
            let icon: string | null = null;

            if (answerState !== 'idle') {
              if (i === q.correctIndex) {
                bg = '#1a4a2e'; borderColor = Colors.green; textColor = Colors.green; icon = '✓';
              } else if (i === selected && i !== q.correctIndex) {
                bg = '#4a1a1a'; borderColor = '#FF4444'; textColor = '#FF4444'; icon = '✗';
              }
            } else if (selected === i) {
              bg = Colors.accent + '22'; borderColor = Colors.accent;
            }

            return (
              <TouchableOpacity
                key={i}
                style={[quizStyles.answerBtn, { backgroundColor: bg, borderColor }]}
                onPress={() => handleAnswer(i)}
                disabled={answerState !== 'idle'}
                activeOpacity={0.8}
              >
                <Text style={[quizStyles.answerText, { color: textColor }]}>{ans}</Text>
                {icon && <Text style={[quizStyles.answerIcon, { color: textColor }]}>{icon}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {isWrong && (
          <View style={quizStyles.feedbackBox}>
            <Text style={quizStyles.feedbackWrongTitle}>❌ לא נכון הפעם</Text>
            <Text style={quizStyles.feedbackText}>
              התשובה הנכונה היא: <Text style={{ color: Colors.green, fontWeight: '800' }}>{q.answers[q.correctIndex]}</Text>
            </Text>
            <Text style={quizStyles.feedbackHint}>תוכל לנסות שוב בפעם הבאה שתיכנס לכרטיס 💪</Text>
          </View>
        )}

        {answerState !== 'idle' && (
          <TouchableOpacity
            style={[quizStyles.nextBtn, isWrong && quizStyles.nextBtnWrong]}
            onPress={handleNext}
          >
            <Text style={[quizStyles.nextText, isWrong && quizStyles.nextTextWrong]}>
              {isCorrect ? 'המשך ▶' : 'הבנתי, חזור לרשימה'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Question list view ──
  return (
    <View style={quizStyles.container}>
      <View style={quizStyles.progressContainer}>
        <View style={quizStyles.progressHeaderRow}>
          <Text style={quizStyles.progressTitle}>
            {correctCount}/4 תשובות נכונות
          </Text>
          {correctCount > 0 && (
            <Text style={quizStyles.progressStars}>
              {'⭐'.repeat(correctCount)}
            </Text>
          )}
        </View>
        <View style={quizStyles.progressBar}>
          <View style={[quizStyles.progressFill, { width: `${(correctCount / 4) * 100}%` }]} />
        </View>
        <Text style={quizStyles.progressHint}>
          {correctCount >= 4 ? '🏆 השחקן נפתח!' : `עוד ${4 - correctCount} נכונות ופתחת את השחקן`}
        </Text>
      </View>

      {shuffledQuestions.map((q, i) => {
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
            <Text style={[quizStyles.qStatus, answered && { color: Colors.green }]}>
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
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,10,18,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#121a2d',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(38,208,124,0.8)',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  celebrationEmoji: { fontSize: 42, marginBottom: Spacing.xs },
  celebrationTitle: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: '900', marginBottom: 6 },
  celebrationText: { color: Colors.textMuted, fontSize: Fonts.sizes.base, textAlign: 'center', marginBottom: Spacing.base },
  celebrationPrimary: {
    width: '100%',
    backgroundColor: '#26D07C',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  celebrationPrimaryText: { color: '#032012', fontWeight: '900', fontSize: Fonts.sizes.sm },
  celebrationSecondary: {
    width: '100%',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  celebrationSecondaryText: { color: Colors.text, fontWeight: '700', fontSize: Fonts.sizes.sm },

  // Country fact in unlock modal
  countryFactBox: {
    width: '100%',
    backgroundColor: Colors.accent + '18',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
    padding: Spacing.sm,
    marginBottom: Spacing.base,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: Spacing.sm,
  },
  countryFactFlag: { fontSize: 28 },
  countryFactText: { color: Colors.text, fontSize: Fonts.sizes.sm, lineHeight: 20, flex: 1, fontWeight: '500' as const },

  // Fail-soft feedback
  feedbackBox: {
    backgroundColor: '#4a1a1a',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FF4444',
    padding: Spacing.base,
    gap: 4,
  },
  feedbackWrongTitle: { color: '#FF6666', fontSize: Fonts.sizes.sm, fontWeight: '800' as const },
  feedbackText: { color: Colors.text, fontSize: Fonts.sizes.sm, lineHeight: 20 },
  feedbackHint: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  nextBtnWrong: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  nextTextWrong: { color: Colors.text },

  // Progress
  progressHeaderRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: Spacing.sm },
  progressStars: { fontSize: 14 },
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
            <InfoRow icon="⚽" label="עמדה" value={positionToHebrew(player.position)} />
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
          <QuizTab
            playerId={player.id}
            questions={player.quizQuestions}
            playerNationality={player.nationality}
          />
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
