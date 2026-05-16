import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export async function checkPermissions(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function downloadImage(imageUrl: string, playerName: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return false;

    const sanitized = playerName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `football_${sanitized}_${Date.now()}.jpg`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    const result = await FileSystem.downloadAsync(imageUrl, fileUri);
    if (!result || result.status !== 200) return false;

    await MediaLibrary.createAssetAsync(result.uri);

    // Clean up the file from documentDirectory after saving to library
    try { await FileSystem.deleteAsync(result.uri, { idempotent: true }); } catch {}

    return true;
  } catch (e) {
    console.error('downloadImage error:', e);
    return false;
  }
}

export async function shareImage(imageUrl: string, playerName?: string): Promise<void> {
  try {
    const sanitized = (playerName ?? 'player').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `football_${sanitized}_${Date.now()}.jpg`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    const result = await FileSystem.downloadAsync(imageUrl, fileUri);
    if (!result || result.status !== 200) throw new Error('Download failed');

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) throw new Error('Sharing unavailable');

    await Sharing.shareAsync(result.uri, {
      mimeType: 'image/jpeg',
      dialogTitle: `שתף תמונה של ${playerName ?? 'שחקן'}`,
    });
  } catch (e) {
    console.error('shareImage error:', e);
    throw e;
  }
}

export async function setAsWallpaper(imageUrl: string, playerName?: string): Promise<boolean> {
  // On iOS/Android: save to gallery, user sets wallpaper manually from gallery
  return downloadImage(imageUrl, playerName ?? 'wallpaper');
}
