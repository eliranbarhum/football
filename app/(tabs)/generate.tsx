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
      // Use Pollinations.ai for free AI generation
      const seed = Math.floor(Math.random() * 1000000);
      const fullPrompt = `${prompt}, ${selectedStyle} style, high quality, professional football photography, 8k resolution`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1792&seed=${seed}&model=flux&nologo=true`;
      
      setImageUrl(url);
      incrementAIUsage();
    } catch {
      setError('שגיאה ביצירת התמונה. נסה שוב.');
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
