export interface Track {
  id: string;
  name: string;
  size: number;
  artist?: string;
  album?: string;
  /** Seconds, when the file's tags report it. */
  duration?: number;
  /** A cover image is stored in IndexedDB under this track's id. */
  hasCover?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}
