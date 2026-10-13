import type { Ref } from "vue";
import type { Track } from "@/types";

interface PlayerSource {
  tracks: { value: Track[] };
  getBlob: (id: string) => Promise<Blob | undefined>;
}

export function usePlayer(
  audioEl: Ref<HTMLAudioElement | null | undefined>,
  { tracks, getBlob }: PlayerSource,
) {
  const src = ref("");
  const currentId = ref<string | null>(null);
  const loadError = ref("");
  let objectUrl = "";

  const { playing, currentTime, duration, volume } = useMediaControls(audioEl, {
    src,
  });

  const currentIndex = computed(() =>
    tracks.value.findIndex((t) => t.id === currentId.value),
  );

  const currentTrack = computed(() => tracks.value[currentIndex.value] ?? null);

  const revoke = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  }

  const select = async (id: string) => {
    loadError.value = "";
    const blob = await getBlob(id);
    if (!blob) {
      loadError.value = "This song's audio could not be found. Remove it and upload again.";
      return;
    }
    revoke();
    objectUrl = URL.createObjectURL(blob);
    currentId.value = id;
    src.value = objectUrl;
    await nextTick();
    playing.value = true;
  }

  const toggle = () => {
    if (!currentTrack.value) {
      const first = tracks.value[0];
      if (first) select(first.id);
      return;
    }
    playing.value = !playing.value;
  }

  const next = () => {
    if (!tracks.value.length) return;
    const i = (currentIndex.value + 1) % tracks.value.length;
    select(tracks.value[i]!.id);
  }

  const prev = () => {
    if (!tracks.value.length) return;
    const i =
      (currentIndex.value - 1 + tracks.value.length) % tracks.value.length;
    select(tracks.value[i]!.id);
  }

  // Call before removing a track so playback does not keep a dead source.
  const onRemoved = (id: string) => {
    if (id !== currentId.value) return;
    playing.value = false;
    revoke();
    src.value = "";
    currentId.value = null;
  }

  useEventListener(audioEl, "ended", next);

  onScopeDispose(revoke);

  return {
    currentId,
    currentIndex,
    currentTrack,
    loadError,
    playing,
    currentTime,
    duration,
    volume,
    select,
    toggle,
    next,
    prev,
    onRemoved,
  };
}
