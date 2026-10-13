export const usePlayerStore = defineStore("player", () => {
  // Theme
  const mode = useColorMode();

  const toggleMode = () => {
    mode.value = mode.value === "dark" ? "light" : "dark";
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
