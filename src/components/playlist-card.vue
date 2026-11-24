<template>
  <section
    class="min-w-0 rounded-3xl bg-white/80 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10 md:p-6"
  >
    <div class="flex items-center justify-between pb-3">
      <h2 class="text-lg font-semibold">
        Playlist
        <span
          v-if="tracks.length"
          class="text-sm font-normal text-slate-500 dark:text-slate-400"
        >
          ({{ tracks.length }})
        </span>
      </h2>
      <label
        class="cursor-pointer rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
      >
        + Add songs
        <input
          type="file"
          accept="audio/*"
          multiple
          class="hidden"
          @change="onPick"
        />
      </label>
    </div>

    <!-- Playlists -->
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 pb-3">
      <div
        class="playlist-scroll flex min-w-0 basis-full gap-1 overflow-x-auto pb-1 sm:basis-0 sm:flex-1"
      >
        <VButton
          v-for="p in playlists"
          :key="p.id"
          variant="toggle"
          size="pill"
          class="shrink-0"
          :active="p.id === activeId"
          @click="activeId = p.id"
          @dblclick="openRename(p.id, p.name)"
        >
          {{ p.name }}
        </VButton>
      </div>

      <VButton
        v-if="firstHasSongs"
        size="pill"
        title="New playlist"
        aria-label="New playlist"
        @click="openCreate"
      >
        +
      </VButton>
      <VButton
        size="pill"
        title="Rename playlist"
        @click="openRename(activeId, activeName)"
      >
        Rename
      </VButton>
      <VButton
        v-if="canDelete"
        variant="toggle"
        size="pill"
        class="hover:text-red-500"
        title="Delete playlist"
        :disabled="isRemoving"
        @click="onDelete"
      >
        Delete
      </VButton>
    </div>

    <playlist-name-dialog
      v-model:open="dialogOpen"
      :title="dialogMode === 'create' ? 'New playlist' : 'Rename playlist'"
      :confirm-label="dialogMode === 'create' ? 'Create' : 'Rename'"
      :initial-name="dialogName"
      @submit="onDialogSubmit"
    />

    <playlist-toolbar v-if="tracks.length" />

    <div
      v-if="!tracks.length && !adding"
      class="mt-3 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-16 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-slate-400"
    >
      Drop audio files anywhere on this page, or use "Add songs".
    </div>

    <ul
      v-else
      class="playlist-scroll mt-2 max-h-[55vh] min-h-40 space-y-1 overflow-y-auto pr-1"
      :aria-busy="adding > 0 || isRemoving"
    >
      <template v-for="(track, i) in tracks" :key="track.id">
        <skeleton-row v-if="removingIds.includes(track.id)" />
      
        <playlist-item v-else :track="track" :index="i" />
      </template>

      <skeleton-row
        v-for="n in adding"
        :key="`adding-${n}`"
        :width="`${55 + ((n * 17) % 35)}%`"
      />
    </ul>
  </section>
</template>

<script lang="ts" setup>
const store = usePlayerStore();
const { tracks, playlists, activeId, adding, isRemoving, removingIds } =
  storeToRefs(store);
const { addFiles, createPlaylist, renamePlaylist, removePlaylist } = store;
const toast = useToast();

const activeName = computed(
  () => playlists.value.find((p) => p.id === activeId.value)?.name ?? "",
);

// The first playlist anchors the others: until it has songs there is nothing
// to organise, so creating more playlists (or deleting it) is not offered.
const firstHasSongs = computed(() => !!playlists.value[0]?.tracks.length);
const canDelete = computed(
  () => firstHasSongs.value || activeId.value !== playlists.value[0]?.id,
);

// Create and rename share one name dialog.
const dialogOpen = ref(false);
const dialogMode = ref<"create" | "rename">("create");
const dialogName = ref("");
const renamingId = ref("");

const openCreate = () => {
  dialogMode.value = "create";
  dialogName.value = `Playlist ${playlists.value.length + 1}`;
  dialogOpen.value = true;
};

const openRename = (id: string, name: string) => {
  dialogMode.value = "rename";
  renamingId.value = id;
  dialogName.value = name;
  dialogOpen.value = true;
};

const onDialogSubmit = (name: string) => {
  if (dialogMode.value === "create") createPlaylist(name);
  else renamePlaylist(renamingId.value, name);
};

const onDelete = async () => {
  const count = tracks.value.length;
  const confirmed = await toast.confirm(
    count
      ? `Delete "${activeName.value}" and its ${count} songs?`
      : `Delete "${activeName.value}"?`,
  );
  if (confirmed) removePlaylist(activeId.value);
};

const onPick = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) await addFiles(input.files);
  input.value = "";
};
</script>