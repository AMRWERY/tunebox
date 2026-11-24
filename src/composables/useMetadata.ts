export interface TrackMetadata {
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  cover?: Blob;
}

// Parsed lazily so the (large) tag parser stays out of the initial bundle.
export const readTrackMetadata = async (file: File): Promise<TrackMetadata> => {
  try {
    const { parseBlob, selectCover } = await import("music-metadata");
    const { common, format } = await parseBlob(file, { skipPostHeaders: true });
    const picture = selectCover(common.picture);
    return {
      title: common.title?.trim() || undefined,
      artist: common.artist?.trim() || undefined,
      album: common.album?.trim() || undefined,
      duration: format.duration,
      cover: picture
        ? new Blob([new Uint8Array(picture.data)], { type: picture.format })
        : undefined,
    };
  } catch {
    // Untagged or unsupported files still play; they just have no metadata.
    return {};
  }
};
