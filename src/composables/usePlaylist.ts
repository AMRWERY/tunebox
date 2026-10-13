import { del, get, set } from "idb-keyval";
import type { Track } from "@/types";

const blobKey = (id: string) => `track-blob:${id}`;
// Keeps skeleton loaders visible long enough to be noticed on fast storage.
const MIN_LOADING_MS = 350;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const titleFromFile = (name: string) => name.replace(/\.[^.]+$/, "");

export const usePlaylist = () => {
  const tracks = useStorage<Track[]>("playlist-tracks", []);
  const error = ref("");
  const adding = ref(0); // number of files still being saved
  const removingIds = ref<string[]>([]);

  const addFiles = async (files: FileList | File[]) => {
    error.value = "";
    const incoming = Array.from(files);
    const audioFiles = incoming.filter((f) => f.type.startsWith("audio/"));

    if (audioFiles.length < incoming.length) {
      error.value = "Some files were skipped because they are not audio.";
    }

    adding.value = audioFiles.length;
    for (const file of audioFiles) {
      const id = crypto.randomUUID();
      try {
        await Promise.all([set(blobKey(id), file), sleep(MIN_LOADING_MS)]);
        tracks.value.push({
          id,
          name: titleFromFile(file.name),
          size: file.size,
        });
      } catch {
        await del(blobKey(id)).catch(() => {});
        error.value = `Could not save "${file.name}". Browser storage may be full or blocked.`;
        break;
      } finally {
        adding.value = Math.max(0, adding.value - 1);
      }
    }
    adding.value = 0;
  };

  const removeMany = async (ids: string[]) => {
    if (!ids.length) return;
    removingIds.value = [...removingIds.value, ...ids];
    const gone = new Set(ids);
    try {
      await Promise.all([
        ...ids.map((id) => del(blobKey(id)).catch(() => {})),
        sleep(MIN_LOADING_MS),
      ]);
      tracks.value = tracks.value.filter((t) => !gone.has(t.id));
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

  return {
    tracks,
    error,
    adding,
    removingIds,
    addFiles,
    remove,
    removeMany,
    clear,
    getBlob,
  };
};
