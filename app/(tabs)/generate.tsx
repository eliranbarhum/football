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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Fonts, BorderRadius } from '../../constants/theme';
import { searchPlayer } from '../../lib/sportsApi';
import AdBanner from '../../components/AdBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STYLES = [
  { id: 'realistic', label: 'ריאליסטי', emoji: '📸' },
  { id: 'cartoon', label: 'קומיקס', emoji: '🎨' },
  { id: 'neon', label: 'ניאון', emoji: '💡' },
  { id: 'artistic', label: 'אמנותי', emoji: '🖌️' },
];

export default function GenerateScreen() {
  const [playerName, setPlayerName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerFound, setPlayerFound] = useState(false);

  const handleGenerate = async () => {
    if (!playerName.trim()) return;

    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setPlayerFound(false);

    try {
      // For now, use TheSportsDB as a preview until AI generation is implemented
      const player = await searchPlayer(playerName.trim());
      if (player) {
        const url =
          player.strFanart1 ||
          player.strFanart2 ||
          player.strThumb ||
          player.strCutout ||
          null;

        if (url) {
          setPreviewUrl(url);
          setPlayerFound(true);
        } else {
          setError(`נמצא ${player.strPlayer} אך אין תמונה זמינה`);
        }
      } else {
        setError(`לא נמצא שחקן בשם "${playerName}" — נסה שם אחר`);
      }
    } catch {
      setError('שגיאה בחיבור לשרת. נסה שוב.');
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>🤖 צור תמונה עם AI</Text>
          <Text style={styles.headerSubtitle}>
            כתוב שם שחקן וניצור לך תמונה מדהימה!
          </Text>
        </View>

        {/* Coming Soon Banner */}
        <View style={styles.comingSoonBanner}>
          <LinearGradient
            colors={['rgba(0,212,255,0.15)', 'rgba(0,212,255,0.05)']}
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerEmoji}>🚀</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>בקרוב — AI אמיתי!</Text>
              <Text style={styles.bannerSubtitle}>
                בגרסה הבאה תוכל ליצור תמונות ייחודיות עם Stable Diffusion
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Player Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>שם השחקן</Text>
          <TextInput
            style={styles.textInput}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="לדוגמה: Messi, Ronaldo, Haaland..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
            onSubmitEditing={handleGenerate}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Style Selector */}
        <View style={styles.styleSection}>
          <Text style={styles.label}>סגנון תמונה</Text>
          <View style={styles.styleGrid}>
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
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={loading || !playerName.trim()}
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
                <Text style={styles.generateText}>צור תמונה!</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Preview Area */}
        <View style={styles.previewArea}>
          {previewUrl ? (
            <>
              <Image
                source={{ uri: previewUrl }}
                style={styles.previewImage}
                contentFit="cover"
                transition={400}
              />
              {playerFound && (
                <View style={styles.previewNote}>
                  <Text style={styles.previewNoteText}>
                    💡 תצוגה מקדימה מ-TheSportsDB
                  </Text>
                  <Text style={styles.previewNoteSubtext}>
                    בגרסה הבאה — יצירת AI מלאה!
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.previewPlaceholder}>
              <LinearGradient
                colors={[Colors.secondary, Colors.card]}
                style={styles.previewPlaceholderGradient}
              >
                <Text style={styles.placeholderEmoji}>🎭</Text>
                <Text style={styles.placeholderText}>
                  כאן תופיע התמונה שלך
                </Text>
                <Text style={styles.placeholderSubtext}>
                  הכנס שם שחקן ולחץ "צור תמונה"
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* AI Note */}
        <View style={styles.aiNote}>
          <Text style={styles.aiNoteText}>
            🤖 מופעל על ידי Stable Diffusion AI
          </Text>
          <Text style={styles.aiNoteSubtext}>
            בקרוב — יצירת תמונות מקוריות של שחקנים בסגנונות שונים
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <AdBanner />
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
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.base,
  },
  comingSoonBanner: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: Colors.accent,
    fontSize: Fonts.sizes.base,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.sm,
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
  },
  styleSection: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  styleGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  styleButton: {
    flex: 1,
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
  generateButton: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.base,
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
    minHeight: SCREEN_WIDTH * 0.8,
  },
  previewImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.9,
  },
  previewNote: {
    backgroundColor: Colors.card,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  previewNoteText: {
    color: Colors.textMuted,
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  previewNoteSubtext: {
    color: Colors.accent,
    fontSize: Fonts.sizes.xs,
  },
  previewPlaceholder: {
    flex: 1,
    minHeight: SCREEN_WIDTH * 0.8,
  },
  previewPlaceholderGradient: {
    flex: 1,
    minHeight: SCREEN_WIDTH * 0.8,
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
