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
  const { tracks, error, adding, removingIds, addFiles, removeMany, getBlob } =
    usePlaylist();

  // The store owns the audio element, so no component needs to render one.
  const audioEl = shallowRef(new Audio());

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
    select,
    toggle,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    onRemoved,
  } = usePlayer(audioEl, { tracks, getBlob });

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
  const removeSelected = () => removeTracks([...selectedIds.value]);
  const clearAll = () => removeTracks(tracks.value.map((t) => t.id));

  return {
    mode,
    toggleMode,
    tracks,
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
    removeTrack,
    removeSelected,
    clearAll,
  };
});
