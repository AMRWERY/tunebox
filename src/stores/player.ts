export const usePlayerStore = defineStore("player", () => {
  // Theme
  const mode = useColorMode();

  const applyMode = () => {
    mode.value = mode.value === "dark" ? "light" : "dark";
  };

  // Animated switch: circular reveal from the click point where the View
  // Transitions API exists, a color cross-fade elsewhere, instant when the
  // user prefers reduced motion.
  const toggleMode = async (event?: MouseEvent) => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      applyMode();
      return;
    }

    if (!document.startViewTransition) {
      root.classList.add("theme-fade");
      applyMode();
      window.setTimeout(() => root.classList.remove("theme-fade"), 400);
      return;
    }

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(async () => {
      applyMode();
      await nextTick();
    });

    await transition.ready.catch(() => {});
    root.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
      },
      {
        duration: 600,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };

  // Playlist + playback
  const {
    playlists,
    activeId,
    activePlaylist,
    tracks,
    error,
    adding,
    removingIds,
    addFiles,
    removeMany,
    getBlob,
    getCover,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    findPlaylistOf,
  } = usePlaylist();

  // The store owns the audio element, so no component needs to render one.
  const audioEl = shallowRef(new Audio());

  // Playback follows the playlist a song was started from, not the one being
  // viewed, so browsing other playlists never interrupts the music.
  const playingPlaylistId = ref(activeId.value);
  const queue = computed(
    () =>
      (
        playlists.value.find((p) => p.id === playingPlaylistId.value) ??
        activePlaylist.value
      ).tracks,
  );

  // With nothing loaded, "playing" simply tracks the viewed playlist.
  watch(activeId, (id) => {
    if (!currentId.value) playingPlaylistId.value = id;
  });

  const {
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
    speed,
    last,
    select: selectTrack,
    restore,
    toggle: togglePlayback,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    onRemoved,
  } = usePlayer(audioEl, { tracks: queue, getBlob });

  const select = (id: string) => {
    const owner = findPlaylistOf(id);
    if (owner) playingPlaylistId.value = owner.id;
    return selectTrack(id);
  };

  // Play with nothing loaded starts the viewed playlist from its first song.
  const toggle = () => {
    if (currentTrack.value) return togglePlayback();
    const first = tracks.value[0];
    if (first) select(first.id);
  };

  // Resume the last song, paused at its saved position.
  if (last.value.id) {
    const owner = findPlaylistOf(last.value.id);
    if (owner) {
      playingPlaylistId.value = owner.id;
      restore(last.value.id, last.value.time);
    } else {
      last.value = { id: "", time: 0 };
    }
  }

  // Playback speed
  const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed.value);
    speed.value = SPEEDS[(i + 1) % SPEEDS.length]!;
  };

  // Sleep timer
  const {
    minutes: sleepMinutes,
    remaining: sleepRemaining,
    cycle: cycleSleep,
  } = useSleepTimer(() => {
    playing.value = false;
  });

  // Cover art + lock-screen controls
  const coverUrl = useCover(currentTrack, getCover);
  useMediaSession({
    track: currentTrack,
    coverUrl,
    playing,
    currentTime,
    duration,
    play: () => {
      playing.value = true;
    },
    pause: () => {
      playing.value = false;
    },
    next,
    prev,
  });

  const isRemoving = computed(() => removingIds.value.length > 0);

  // Selection
  const selectedIds = ref<string[]>([]);
  const someSelected = computed(() => selectedIds.value.length > 0);
  const allSelected = computed({
    get: () =>
      tracks.value.length > 0 &&
      selectedIds.value.length === tracks.value.length,
    set: (checked: boolean) => {
      selectedIds.value = checked ? tracks.value.map((t) => t.id) : [];
    },
  });

  // Drop selections that no longer exist (e.g. after a single remove).
  watch(tracks, (list) => {
    const ids = new Set(list.map((t) => t.id));
    selectedIds.value = selectedIds.value.filter((id) => ids.has(id));
  });

  // Removal
  const removeTracks = async (ids: string[]) => {
    ids.forEach(onRemoved);
    await removeMany(ids);
  };

  const removeTrack = (id: string) => removeTracks([id]);

  // Playlists
  const removePlaylist = async (id: string) => {
    const doomed = playlists.value.find((p) => p.id === id);
    doomed?.tracks.forEach((t) => onRemoved(t.id));
    await deletePlaylist(id);
  };
  const removeSelected = () => removeTracks([...selectedIds.value]);
  const clearAll = () => removeTracks(tracks.value.map((t) => t.id));

  return {
    mode,
    toggleMode,
    tracks,
    queue,
    playlists,
    activeId,
    error,
    adding,
    removingIds,
    isRemoving,
    currentId,
    currentIndex,
    currentTrack,
    loadError,
    playing,
    currentTime,
    duration,
    volume,
    speed,
    sleepMinutes,
    sleepRemaining,
    coverUrl,
    shuffle,
    repeat,
    selectedIds,
    someSelected,
    allSelected,
    addFiles,
    select,
    toggle,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    cycleSpeed,
    cycleSleep,
    createPlaylist,
    renamePlaylist,
    removePlaylist,
    removeTrack,
    removeSelected,
    clearAll,
  };
});
