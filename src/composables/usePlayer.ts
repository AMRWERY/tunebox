import type { Ref } from "vue";
import type { Track } from "@/types";

interface PlayerSource {
  tracks: { value: Track[] };
  getBlob: (id: string) => Promise<Blob | undefined>;
}

export type RepeatMode = "off" | "all" | "one";

const REPEAT_ORDER: RepeatMode[] = ["off", "all", "one"];

export function usePlayer(
  audioEl: Ref<HTMLAudioElement | null | undefined>,
  { tracks, getBlob }: PlayerSource,
) {
  const src = ref("");
  const currentId = ref<string | null>(null);
  const loadError = ref("");
  const shuffle = useStorage("player-shuffle", false);
  const repeat = useStorage<RepeatMode>("player-repeat", "off");
  const history: string[] = []; // played ids, so "previous" works when shuffling
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
  };

  const select = async (id: string) => {
    loadError.value = "";
    const blob = await getBlob(id);
    if (!blob) {
      loadError.value =
        "This song's audio could not be found. Remove it and upload again.";
      return;
    }
    revoke();
    objectUrl = URL.createObjectURL(blob);
    currentId.value = id;
    src.value = objectUrl;
    await nextTick();
    playing.value = true;
  };

  const toggle = () => {
    if (!currentTrack.value) {
      const first = tracks.value[0];
      if (first) select(first.id);
      return;
    }
    playing.value = !playing.value;
  };

  const toggleShuffle = () => {
    shuffle.value = !shuffle.value;
  };

  const cycleRepeat = () => {
    const i = REPEAT_ORDER.indexOf(repeat.value);
    repeat.value = REPEAT_ORDER[(i + 1) % REPEAT_ORDER.length]!;
  };

  const pickNextId = (): string | undefined => {
    const list = tracks.value;
    if (!list.length) return undefined;
    if (shuffle.value && list.length > 1) {
      const pool = list.filter((t) => t.id !== currentId.value);
      return pool[Math.floor(Math.random() * pool.length)]!.id;
    }
    return list[(currentIndex.value + 1) % list.length]!.id;
  };

  const next = () => {
    const id = pickNextId();
    if (!id) return;
    if (currentId.value) history.push(currentId.value);
    select(id);
  };

  const prev = () => {
    const list = tracks.value;
    if (!list.length) return;

    // Like most players: restart the song first, go back if already near the start.
    if (currentTrack.value && currentTime.value > 3) {
      currentTime.value = 0;
      return;
    }

    if (shuffle.value) {
      while (history.length) {
        const id = history.pop()!;
        if (list.some((t) => t.id === id)) return void select(id);
      }
    }

    const i = (currentIndex.value - 1 + list.length) % list.length;
    select(list[i]!.id);
  };

  const onEnded = () => {
    if (repeat.value === "one") {
      currentTime.value = 0;
      playing.value = true;
      return;
    }
    const atEnd = currentIndex.value === tracks.value.length - 1;
    if (!shuffle.value && repeat.value === "off" && atEnd) {
      playing.value = false;
      return;
    }
    next();
  };

  // Call before removing a track so playback does not keep a dead source.
  const onRemoved = (id: string) => {
    if (id !== currentId.value) return;
    playing.value = false;
    revoke();
    src.value = "";
    currentId.value = null;
  };

  useEventListener(audioEl, "ended", onEnded);

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
    shuffle,
    repeat,
    select,
    toggle,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    onRemoved,
  };
}
