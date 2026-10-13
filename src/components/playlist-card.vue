<template>
  <section
    class="rounded-3xl bg-white/80 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10 md:p-6"
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

    <p v-if="error || loadError" class="pb-2 text-sm text-red-500">
      {{ error || loadError }}
    </p>

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
const { tracks, error, loadError, adding, isRemoving, removingIds } =
  storeToRefs(store);
const { addFiles } = store;

const onPick = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) await addFiles(input.files);
  input.value = "";
};
</script>
