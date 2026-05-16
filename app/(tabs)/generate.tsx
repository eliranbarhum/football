import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { downloadImage, shareImage, setAsWallpaper } from '../../services/imageService';
import InterstitialAdModal from '../../components/InterstitialAdModal';
import { useGameState } from '../../hooks/useGameState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Hebrew → English translation map ─────────────────────────────────────────
// Translates common Hebrew words before sending to FLUX (which doesn't understand Hebrew)

const HE_TO_EN: [RegExp, string][] = [
  // Player names
  [/מסי/g, 'Lionel Messi'],
  [/רונלדו/g, 'Cristiano Ronaldo'],
  [/ניימר/g, 'Neymar'],
  [/מבאפה/g, 'Kylian Mbappe'],
  [/הלנד/g, 'Erling Haaland'],
  [/בנזמה/g, 'Karim Benzema'],
  [/לבנדובסקי/g, 'Robert Lewandowski'],
  [/סאלח/g, 'Mohamed Salah'],
  [/דה ברויינה/g, 'Kevin De Bruyne'],
  [/פדרי/g, 'Pedri'],
  [/ויניסיוס/g, 'Vinicius Jr'],
  [/בלינגהאם/g, 'Jude Bellingham'],
  [/זהבי/g, 'Eran Zahavi'],
  [/אבאדה/g, 'Liel Abada'],
  [/גלוך/g, 'Oscar Gloukh'],
  [/סולומון/g, 'Manor Solomon'],
  // Actions
  [/מבקיע( שער)?/g, 'scoring a goal'],
  [/חוגג/g, 'celebrating'],
  [/רוקד/g, 'dancing'],
  [/ריקוד/g, 'dancing'],
  [/בלט/g, 'ballet'],
  [/רץ/g, 'running'],
  [/קופץ/g, 'jumping'],
  [/מכה בכדור/g, 'kicking the ball'],
  [/בועט/g, 'kicking'],
  [/עושה פנדל/g, 'taking a penalty kick'],
  [/שוחה/g, 'swimming'],
  [/טס/g, 'flying'],
  [/מעופף/g, 'flying'],
  [/אוכל/g, 'eating'],
  [/ישן/g, 'sleeping'],
  [/מחייך/g, 'smiling'],
  // Places & scenes
  [/אצטדיון/g, 'stadium'],
  [/מגרש/g, 'football pitch'],
  [/חלל/g, 'outer space'],
  [/ירח/g, 'moon'],
  [/ים/g, 'ocean'],
  [/מדבר/g, 'desert'],
  [/ג\'ונגל/g, 'jungle'],
  [/עיר/g, 'city'],
  [/פריז/g, 'Paris'],
  [/ברצלונה/g, 'Barcelona city'],
  [/מדריד/g, 'Madrid'],
  [/לונדון/g, 'London'],
  // Objects & misc
  [/כדור/g, 'football'],
  [/גביע/g, 'trophy'],
  [/גביע העולם/g, 'World Cup trophy'],
  [/מדי קבוצה/g, 'football kit'],
  [/גמד/g, 'dwarf'],
  [/דינוזאור/g, 'dinosaur'],
  [/אריה/g, 'lion'],
  [/דרקון/g, 'dragon'],
  [/רובוט/g, 'robot'],
  [/על/g, 'on'],
  [/עם/g, 'with'],
  [/ב/g, 'in'],
  [/ליד/g, 'next to'],
  [/בלי/g, 'without'],
];

function translatePrompt(hebrewText: string): string {
  let result = hebrewText;
  for (const [pattern, replacement] of HE_TO_EN) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}

// ─── Quick prompt suggestions ──────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: 'מסי מבקיע שער', english: 'Lionel Messi scoring a goal in a stadium' },
  { label: 'רונלדו חוגג', english: 'Cristiano Ronaldo celebrating a goal, arms wide open' },
  { label: 'הלנד בחלל', english: 'Erling Haaland playing football in outer space' },
  { label: 'מסי רוקד בלט', english: 'Lionel Messi dancing ballet on a football pitch' },
  { label: 'ניימר ג\'ונגל', english: 'Neymar dribbling through a jungle with a football' },
  { label: 'מבאפה רץ מהר', english: 'Kylian Mbappe running at lightning speed with a football' },
];

const STYLES = [
  { id: 'photorealistic', label: 'ריאליסטי', emoji: '📸' },
  { id: 'anime', label: 'אנימה', emoji: '🎌' },
  { id: 'cartoon', label: 'קומיקס', emoji: '🎨' },
  { id: 'neon', label: 'ניאון', emoji: '💡' },
  { id: 'oil painting', label: 'אמנותי', emoji: '🖌️' },
];

export default function GenerateScreen() {
  const { state, canGenerateAI, incrementAIUsage } = useGameState();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'download' | 'share' | 'wallpaper' | null>(null);

  const generationsLeft = 3 - (state.aiGenerations?.count ?? 0);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!canGenerateAI()) {
      Alert.alert('המכסה היומית הסתיימה', 'ניתן ליצור עד 3 תמונות ביום. המכסה תתחדש מחר!');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const seed = Math.floor(Math.random() * 1000000);
      // Translate Hebrew → English so FLUX understands the prompt
      const englishPrompt = translatePrompt(prompt);
      const fullPrompt = `${englishPrompt}, ${selectedStyle} style, ultra high quality, dramatic lighting, 8k resolution`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1792&seed=${seed}&model=flux&nologo=true`;

      // Actually fetch the image (with 30s timeout) to catch errors early
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) {
          setError('השרת עמוס כרגע. המתן כמה שניות ונסה שוב 🔄');
        } else {
          setError(`שגיאה מהשרת (${res.status}). נסה שוב.`);
        }
        return;
      }

      setImageUrl(url);
      incrementAIUsage();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('לקח יותר מדי זמן. בדוק חיבור לאינטרנט ונסה שוב ⏱');
      } else {
        setError('שגיאה ביצירת התמונה. נסה שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    setPendingAction('download');
    setShowAd(true);
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    setPendingAction('share');
    setShowAd(true);
  };

  const handleSetWallpaper = async () => {
    if (!imageUrl) return;
    setPendingAction('wallpaper');
    setShowAd(true);
  };

  const handleAdClose = async () => {
    setShowAd(false);
    if (!imageUrl) return;
    
    try {
      if (pendingAction === 'download') {
        const success = await downloadImage(imageUrl, prompt || 'ai_wallpaper');
        if (success) Alert.alert('הצלחה!', 'התמונה נשמרה בגלריה שלך ✨');
        else Alert.alert('שגיאה', 'לא הצלחנו לשמור את התמונה.');
      } else if (pendingAction === 'share') {
        await shareImage(imageUrl, prompt || 'ai_wallpaper');
      } else if (pendingAction === 'wallpaper') {
        const success = await setAsWallpaper(imageUrl, prompt || 'ai_wallpaper');
        if (success) Alert.alert('הצלחה!', 'התמונה הוגדרה כשומר מסך ✨');
        else Alert.alert('שגיאה', 'לא הצלחנו להגדיר את התמונה כשומר מסך.');
      }
    } catch {
      Alert.alert('שגיאה', 'משהו השתבש...');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🤖 מעבדת ה-AI</Text>
          <Text style={styles.headerSubtitle}>
            תאר את התמונה שאתה רוצה וניצור אותה עבורך!
          </Text>
        </View>

        {/* Player Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>מה תרצה ליצור?</Text>
          <TextInput
            style={styles.textInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="לדוגמה: מסי משחק על הירח..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
            onSubmitEditing={handleGenerate}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Quick Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.label}>רעיונות מהירים 💡</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.suggestionChip}
                onPress={() => setPrompt(s.label)}
                activeOpacity={0.75}
              >
                <Text style={styles.suggestionText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Style Selector */}
        <View style={styles.styleSection}>
          <Text style={styles.label}>סגנון תמונה</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleGrid}>
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                onPress={() => setSelectedStyle(style.id)}
                style={[
                  styles.styleButton,
                  selectedStyle === style.id && styles.styleButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.styleEmoji}>{style.emoji}</Text>
                <Text
                  style={[
                    styles.styleLabel,
                    selectedStyle === style.id && styles.styleLabelActive,
                  ]}
                >
                  {style.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Generate Button */}
        <View style={styles.generateContainer}>
          <TouchableOpacity
            style={[styles.generateButton, (loading || !prompt.trim()) && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={loading || !prompt.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.accent, '#0099BB']}
              style={styles.generateGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.generateEmoji}>✨</Text>
                  <Text style={styles.generateText}>צור תמונת AI</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.usageText}>נשארו לך {generationsLeft} יצירות להיום</Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Preview Area */}
        <View style={styles.previewArea}>
          {imageUrl ? (
            <View>
              <Image
                source={{ uri: imageUrl }}
                style={styles.previewImage}
                contentFit="cover"
                transition={600}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError('התמונה לא נטענה. נסה שוב או שנה את הבקשה.');
                  setImageUrl(null);
                }}
              />
              {!loading && (
                <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                    <Text style={styles.actionEmoji}>📥</Text>
                    <Text style={styles.actionText}>שמור</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={handleSetWallpaper}>
                    <Text style={styles.actionEmoji}>📱</Text>
                    <Text style={styles.actionText}>טפט</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Text style={styles.actionEmoji}>📤</Text>
                    <Text style={styles.actionText}>שתף</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.previewPlaceholder}>
              <LinearGradient
                colors={[Colors.secondary, Colors.card]}
                style={styles.previewPlaceholderGradient}
              >
                <Text style={styles.placeholderEmoji}>🎨</Text>
                <Text style={styles.placeholderText}>
                  כאן תופיע היצירה שלך
                </Text>
                <Text style={styles.placeholderSubtext}>
                  הקלד תיאור ולחץ "צור תמונה"
                </Text>
              </LinearGradient>
            </View>
          )}
          {loading && (
             <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>ה-AI חושב ומצייר...</Text>
             </View>
          )}
        </View>

        {/* AI Note */}
        <View style={styles.aiNote}>
          <Text style={styles.aiNoteText}>
            🤖 מופעל על ידי FLUX AI Engine
          </Text>
          <Text style={styles.aiNoteSubtext}>
            יצירת תמונות ייחודיות ובלעדיות בזמן אמת
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <InterstitialAdModal visible={showAd} onClose={handleAdClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: Fonts.sizes.xxl,
    fontWeight: '900',
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.base,
    textAlign: 'right',
  },
  inputSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 4,
    color: Colors.text,
    fontSize: Fonts.sizes.base,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'right',
    minHeight: 80,
  },
  suggestionsSection: {
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  suggestionsRow: {
    gap: Spacing.sm,
    paddingBottom: 4,
  },
  suggestionChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.accent + '55',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
  },
  suggestionText: {
    color: Colors.accent,
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
  },
  styleSection: {
    marginBottom: Spacing.lg,
  },
  styleGrid: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  styleButton: {
    width: 90,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  styleButtonActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(0,212,255,0.1)',
  },
  styleEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  styleLabel: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  styleLabelActive: {
    color: Colors.accent,
  },
  generateContainer: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },
  generateButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 8,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  generateEmoji: {
    fontSize: 22,
  },
  generateText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    fontWeight: '900',
  },
  usageText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorBox: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewArea: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: SCREEN_WIDTH * 1.2,
    backgroundColor: Colors.card,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: SCREEN_WIDTH * 1.4,
  },
  previewActions: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  actionButton: {
    backgroundColor: 'rgba(13, 18, 32, 0.85)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionText: {
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
  },
  previewPlaceholder: {
    flex: 1,
    minHeight: SCREEN_WIDTH * 1.2,
  },
  previewPlaceholderGradient: {
    flex: 1,
    minHeight: SCREEN_WIDTH * 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  placeholderSubtext: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 18, 32, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  loadingText: {
    color: Colors.text,
    fontSize: Fonts.sizes.base,
    fontWeight: '700',
  },
  aiNote: {
    marginHorizontal: Spacing.base,
    alignItems: 'center',
    gap: 4,
  },
  aiNoteText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
  },
  aiNoteSubtext: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    opacity: 0.7,
    textAlign: 'center',
  },
});
