<template>
  <main
    class="min-h-screen bg-linear-to-br from-slate-100 to-emerald-100 text-slate-900 dark:from-gray-950 dark:to-emerald-950 dark:text-slate-100 flex items-center justify-center p-4"
  >
    <div
      ref="card"
      class="w-full max-w-xl overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10"
      :class="{ 'ring-2 ring-emerald-400': isOverDropZone }"
    >
      <!-- Header -->
      <header class="flex items-center justify-between px-6 pt-6">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ greeting }}
          </p>
           <p
        class="pt-2 pb-2 text-xs tabular-nums text-slate-500 dark:text-slate-400"
      >
        {{ date }} &middot; {{ time }}
      </p>
          <h1 class="text-lg font-semibold tracking-tight">Tunebox</h1>
        </div>
        <button
          class="rounded-full bg-emerald-300 p-2 transition hover:bg-emerald-400"
          :aria-label="
            mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          "
          @click="toggleMode"
        >
          <img
            :src="mode === 'dark' ? '/svg/sun-icon.svg' : '/svg/moon-icon.svg'"
            alt=""
            class="size-5"
          />
        </button>
      </header>

      <!-- Now playing -->
      <section class="px-6 pt-6">
        <div
          class="mx-auto flex size-40 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg ring-8 ring-emerald-200/60 dark:ring-emerald-900/60 animate-spin [animation-duration:8s]"
          :class="{ '[animation-play-state:paused]': !playing }"
        >
          <AppIcon name="music-icon" class="size-14 text-white/90" />
        </div>

        <div class="mt-5 text-center">
          <p class="truncate text-lg font-semibold">
            {{ currentTrack?.name ?? "Nothing playing" }}
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{
              currentTrack
                ? `Track ${currentIndex + 1} of ${tracks.length}`
                : "Add songs to get started"
            }}
          </p>
        </div>

        <!-- Seek -->
        <div class="mt-5">
          <input
            v-model.number="currentTime"
            type="range"
            min="0"
            :max="duration || 0"
            step="0.1"
            :disabled="!currentTrack"
            class="w-full accent-emerald-500"
            aria-label="Seek"
          />
          <div
            class="flex justify-between text-xs tabular-nums text-slate-500 dark:text-slate-400"
          >
            <span>{{ formatTime(currentTime) }}</span>

            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="mt-3 flex items-center justify-center gap-6">
          <button
            class="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-gray-800 flex items-center justify-center"
            :disabled="!tracks.length"
            aria-label="Previous"
            @click="prev"
          >
            <AppIcon name="skip-prev-icon" class="size-7" />
          </button>

          <button
            class="rounded-full bg-emerald-500 p-4 text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-40 flex items-center justify-center"
            :disabled="!tracks.length"
            :aria-label="playing ? 'Pause' : 'Play'"
            @click="toggle"
          >
            <AppIcon v-if="playing" name="player-pause-icon" class="size-7" />
         
            <AppIcon v-else name="player-play-icon" class="size-7" />
          </button>

          <button
            class="rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-gray-800 flex items-center justify-center"
            :disabled="!tracks.length"
            aria-label="Next"
            @click="next"
          >
            <AppIcon name="skip-next-icon" class="size-7" />
          </button>
        </div>

        <!-- Volume -->
        <label
          class="mt-4 flex items-center gap-3 text-slate-500 dark:text-slate-400"
        >
          <AppIcon name="volume-icon" class="size-5 shrink-0" />
          <input
            v-model.number="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="w-full accent-emerald-500"
            aria-label="Volume"
          />
        </label>
      </section>

      <!-- Playlist -->
      <section
        class="mt-6 border-t border-slate-200 px-3 py-4 dark:border-gray-800"
      >
        <div class="flex items-center justify-between px-3 pb-2">
          <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Playlist
            <span v-if="tracks.length">({{ tracks.length }})</span>
          </h2>
          <label
            class="cursor-pointer rounded-full bg-emerald-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-emerald-600"
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

        <p v-if="error || loadError" class="px-3 pb-2 text-sm text-red-500">
          {{ error || loadError }}
        </p>

        <div
          v-if="tracks.length"
          class="flex items-center justify-between px-3 pb-2 text-sm"
        >
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="allSelected"
              type="checkbox"
              class="size-4 accent-emerald-500"
              :indeterminate="someSelected && !allSelected"
            />
            Select all
          </label>
          <div class="flex items-center gap-3">
            <button
              v-if="selectedIds.length"
              :disabled="isRemoving"
              class="font-medium text-red-500 hover:underline disabled:opacity-50"
              @click="removeSelected"
            >
              Remove selected ({{ selectedIds.length }})
            </button>
            <button
              :disabled="isRemoving"
              class="text-slate-500 hover:text-red-500 hover:underline disabled:opacity-50 dark:text-slate-400"
              @click="onClear"
            >
              Clear all
            </button>
          </div>
        </div>

        <div
          v-if="!tracks.length && !adding"
          class="mx-3 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-slate-400"
        >
          Drop audio files here or use "Add songs".
        </div>

        <ul
          v-else
          class="playlist-scroll max-h-64 space-y-1 overflow-y-auto pr-1"
          :aria-busy="adding > 0 || isRemoving"
        >
          <template v-for="(track, i) in tracks" :key="track.id">
            <li
              v-if="removingIds.includes(track.id)"
              class="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2"
              aria-hidden="true"
            >
              <div class="size-4 rounded bg-slate-200 dark:bg-gray-700"></div>
              <div class="h-3 w-5 rounded bg-slate-200 dark:bg-gray-700"></div>
              <div
                class="h-3 flex-1 rounded bg-slate-200 dark:bg-gray-700"
              ></div>
            </li>
            <li
              v-else
              class="group relative flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-300 before:absolute before:inset-y-2 before:left-0 before:w-1 before:origin-center before:rounded-full before:bg-emerald-500 before:transition-transform before:duration-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              :class="[
                track.id === currentId
                  ? 'translate-x-1 bg-emerald-50 before:scale-y-100 dark:bg-emerald-950/60'
                  : 'before:scale-y-0',
                selectedIds.includes(track.id)
                  ? 'ring-1 ring-emerald-300 dark:ring-emerald-700'
                  : 'ring-0',
              ]"
            >
              <input
                v-model="selectedIds"
                type="checkbox"
                :value="track.id"
                class="row-check size-4 accent-emerald-500"
                :aria-label="`Select ${track.name}`"
              />
              <span
                class="flex h-4 w-5 items-end justify-center text-xs tabular-nums text-slate-400"
                :class="{
                  'text-emerald-500 font-bold': track.id === currentId,
                }"
              >
                <span
                  v-if="track.id === currentId && playing"
                  class="flex h-4 items-end gap-0.5"
                  aria-label="Playing"
                >
                  <span class="eq-bar"></span>
                  <span class="eq-bar"></span>
                  <span class="eq-bar"></span>
                </span>
                <template v-else>{{ i + 1 }}</template>
              </span>
              <button
                class="flex-1 truncate text-left text-sm"
                :class="{
                  'font-semibold text-emerald-600 dark:text-emerald-400':
                    track.id === currentId,
                }"
                @click="select(track.id)"
              >
                {{ track.name }}
              </button>
              <button
                class="rounded-full p-1 text-slate-400 opacity-0 transition hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
                :aria-label="`Remove ${track.name}`"
                @click="removeTrack(track.id)"
              >
                <AppIcon name="close-icon" class="size-4" />
              </button>
            </li>
          </template>

          <li
            v-for="n in adding"
            :key="`adding-${n}`"
            class="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2"
            aria-hidden="true"
          >
            <div class="size-4 rounded bg-slate-200 dark:bg-gray-700"></div>
            <div class="h-3 w-5 rounded bg-slate-200 dark:bg-gray-700"></div>
            <div
              class="h-3 rounded bg-slate-200 dark:bg-gray-700"
              :style="{ width: `${55 + ((n * 17) % 35)}%` }"
            ></div>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script lang="ts" setup>
const playerStore = usePlayerStore();
const { greeting, time, date } = useClock();

const {
  mode,
  tracks,
  error,
  adding,
  isRemoving,
  removingIds,
  currentId,
  currentIndex,
  currentTrack,
  loadError,
  playing,
  currentTime,
  duration,
  volume,
  selectedIds,
  someSelected,
  allSelected,
} = storeToRefs(playerStore);

const {
  toggleMode,
  addFiles,
  select,
  toggle,
  next,
  prev,
  removeTrack,
  removeSelected,
  clearAll,
} = playerStore;

const card = useTemplateRef<HTMLElement>("card");
const { isOverDropZone } = useDropZone(card, {
  onDrop: (files) => {
    if (files?.length) addFiles(files);
  },
});

const onPick = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) await addFiles(input.files);
  input.value = "";
};

const onClear = () => {
  if (confirm(`Remove all ${tracks.value.length} songs from the playlist?`))
    clearAll();
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
</script>