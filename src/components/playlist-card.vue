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
      <input
        v-if="renamingId"
        ref="renameInput"
        v-model="draft"
        maxlength="40"
        aria-label="Playlist name"
        class="min-w-0 basis-full rounded-full bg-slate-100 px-3 py-1 text-sm outline-none ring-1 ring-emerald-400 dark:bg-gray-800 sm:basis-0 sm:flex-1"
        @keyup.enter="commitRename"
        @keyup.esc="renamingId = ''"
        @blur="commitRename"
      />
      <div
        v-else
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
          @dblclick="startRename(p.id, p.name)"
        >
          {{ p.name }}
        </VButton>
      </div>

      <VButton
        size="pill"
        title="New playlist"
        aria-label="New playlist"
        @click="onCreate"
      >
        +
      </VButton>
      <VButton
        size="pill"
        title="Rename playlist"
        @click="startRename(activeId, activeName)"
      >
        Rename
      </VButton>
      <VButton
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

// Inline rename: double-click a playlist, or use Rename / +.
const renamingId = ref("");
const draft = ref("");
const renameInput = useTemplateRef<HTMLInputElement>("renameInput");

const startRename = async (id: string, name: string) => {
  renamingId.value = id;
  draft.value = name;
  await nextTick();
  renameInput.value?.select();
};

const commitRename = () => {
  if (!renamingId.value) return;
  renamePlaylist(renamingId.value, draft.value);
  renamingId.value = "";
};

const onCreate = () => {
  const id = createPlaylist();
  startRename(id, playlists.value.find((p) => p.id === id)?.name ?? "");
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