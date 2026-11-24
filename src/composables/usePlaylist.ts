import { del, get, set } from "idb-keyval";
import type { Playlist, Track } from "@/types";

const blobKey = (id: string) => `track-blob:${id}`;
const coverKey = (id: string) => `track-cover:${id}`;
// Keeps skeleton loaders visible long enough to be noticed on fast storage.
const MIN_LOADING_MS = 350;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, "");

const newPlaylist = (name: string, tracks: Track[] = []): Playlist => ({
  id: crypto.randomUUID(),
  name,
  tracks,
});

// Before multiple playlists, the single list lived under this key.
const readLegacyTracks = (): Track[] => {
  try {
    const raw = localStorage.getItem("playlist-tracks");
    return raw ? (JSON.parse(raw) as Track[]) : [];
  } catch {
    return [];
  }
};

export const usePlaylist = () => {
  const playlists = useStorage<Playlist[]>("playlists", []);
  const activeId = useStorage("active-playlist", "");

  if (!playlists.value.length) {
    playlists.value = [newPlaylist("My Playlist", readLegacyTracks())];
    localStorage.removeItem("playlist-tracks");
  }
  if (!playlists.value.some((p) => p.id === activeId.value)) {
    activeId.value = playlists.value[0]!.id;
  }

  const activePlaylist = computed(
    () => playlists.value.find((p) => p.id === activeId.value)!,
  );

  // The tracks of the playlist being viewed.
  const tracks = computed({
    get: () => activePlaylist.value.tracks,
    set: (list: Track[]) => {
      activePlaylist.value.tracks = list;
    },
  });

  const error = ref("");
  const adding = ref(0); // number of files still being saved
  const removingIds = ref<string[]>([]);

  const addFiles = async (files: FileList | File[]) => {
    error.value = "";
    // Captured now, so switching playlists mid-upload cannot misplace songs.
    const target = activePlaylist.value;
    const incoming = Array.from(files);
    const audioFiles = incoming.filter((f) => f.type.startsWith("audio/"));

    if (audioFiles.length < incoming.length) {
      error.value = "Some files were skipped because they are not audio.";
    }

    adding.value = audioFiles.length;
    for (const file of audioFiles) {
      const id = crypto.randomUUID();
      try {
        const [meta] = await Promise.all([
          readTrackMetadata(file),
          set(blobKey(id), file),
          sleep(MIN_LOADING_MS),
        ]);
        if (meta.cover) await set(coverKey(id), meta.cover);
        target.tracks.push({
          id,
          name: meta.title ?? titleFromFile(file.name),
          size: file.size,
          artist: meta.artist,
          album: meta.album,
          duration: meta.duration,
          hasCover: !!meta.cover,
        });
      } catch {
        await Promise.all([
          del(blobKey(id)).catch(() => {}),
          del(coverKey(id)).catch(() => {}),
        ]);
        error.value = `Could not save "${file.name}". Browser storage may be full or blocked.`;
        break;
      } finally {
        adding.value = Math.max(0, adding.value - 1);
      }
    }
    adding.value = 0;
  };

  // Removes songs from whichever playlists hold them.
  const removeMany = async (ids: string[]) => {
    if (!ids.length) return;
    removingIds.value = [...removingIds.value, ...ids];
    const gone = new Set(ids);
    try {
      await Promise.all([
        ...ids.flatMap((id) => [
          del(blobKey(id)).catch(() => {}),
          del(coverKey(id)).catch(() => {}),
        ]),
        sleep(MIN_LOADING_MS),
      ]);
      for (const p of playlists.value) {
        p.tracks = p.tracks.filter((t) => !gone.has(t.id));
      }
    } finally {
      removingIds.value = removingIds.value.filter((id) => !gone.has(id));
    }
  };

  const remove = (id: string) => removeMany([id]);

  const clear = async () => {
    await removeMany(tracks.value.map((t) => t.id));
  };

  const getBlob = async (id: string): Promise<Blob | undefined> => {
    return get<Blob>(blobKey(id));
  };

  const getCover = async (id: string): Promise<Blob | undefined> => {
    return get<Blob>(coverKey(id));
  };

  // Playlists
  const createPlaylist = (name?: string) => {
    const p = newPlaylist(name?.trim() || `Playlist ${playlists.value.length + 1}`);
    playlists.value.push(p);
    activeId.value = p.id;
    return p.id;
  };

  const renamePlaylist = (id: string, name: string) => {
    const p = playlists.value.find((x) => x.id === id);
    const trimmed = name.trim();
    if (p && trimmed) p.name = trimmed;
  };

  // Deletes the playlist and its songs. The last playlist is emptied instead.
  const deletePlaylist = async (id: string) => {
    const p = playlists.value.find((x) => x.id === id);
    if (!p) return;
    await removeMany(p.tracks.map((t) => t.id));
    if (playlists.value.length === 1) return;
    playlists.value = playlists.value.filter((x) => x.id !== id);
    if (activeId.value === id) activeId.value = playlists.value[0]!.id;
  };

  const findPlaylistOf = (trackId: string) =>
    playlists.value.find((p) => p.tracks.some((t) => t.id === trackId));

  return {
    playlists,
    activeId,
    activePlaylist,
    tracks,
    error,
    adding,
    removingIds,
    addFiles,
    remove,
    removeMany,
    clear,
    getBlob,
    getCover,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    findPlaylistOf,
  };
};
