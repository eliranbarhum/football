import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export async function checkPermissions(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function downloadImage(
  imageUrl: string,
  playerName: string
): Promise<boolean> {
  try {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.warn('Media library permission denied');
      return false;
    }

    const filename = `football_star_${playerName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    const fileUri = FileSystem.cacheDirectory + filename;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    if (downloadResult.status !== 200) {
      console.warn('Download failed with status:', downloadResult.status);
      return false;
    }

    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

    // Try to save into a Football Stars album
    try {
      let album = await MediaLibrary.getAlbumAsync('Football Stars');
      if (album === null) {
        album = await MediaLibrary.createAlbumAsync('Football Stars', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    } catch {
      // Album creation may fail on some devices — the asset is still saved to the gallery
    }

    return true;
  } catch (error) {
    console.error('downloadImage error:', error);
    return false;
  }
}

export async function shareImage(imageUrl: string, playerName?: string): Promise<void> {
  try {
    const filename = `football_star_${(playerName ?? 'player').replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    const fileUri = FileSystem.cacheDirectory + filename;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error('Failed to download image for sharing');
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(downloadResult.uri, {
      mimeType: 'image/jpeg',
      dialogTitle: `שתף תמונה של ${playerName ?? 'שחקן'}`,
      UTI: 'public.jpeg',
    });
  } catch (error) {
    console.error('shareImage error:', error);
    throw error;
  }
}

export async function setAsWallpaper(imageUrl: string, playerName?: string): Promise<boolean> {
  try {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return false;

    const filename = `wallpaper_${(playerName ?? 'player').replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    const fileUri = FileSystem.cacheDirectory + filename;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
    if (downloadResult.status !== 200) return false;

    await MediaLibrary.createAssetAsync(downloadResult.uri);
    return true;
  } catch (error) {
    console.error('setAsWallpaper error:', error);
    return false;
  }
}
