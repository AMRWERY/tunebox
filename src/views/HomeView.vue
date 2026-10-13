<template>
  <main
    ref="page"
    class="min-h-screen bg-linear-to-br from-slate-100 to-emerald-100 text-slate-900 dark:from-gray-950 dark:to-emerald-950 dark:text-slate-100"
  >
    <!-- Drag & drop overlay -->
    <Transition name="drop-fade">
      <div
        v-if="isOverDropZone"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm"
      >
        <p
          class="rounded-2xl border-2 border-dashed border-emerald-500 bg-white/90 px-8 py-6 text-lg font-semibold text-emerald-600 dark:bg-gray-900/90"
        >
          Drop audio files to add them
        </p>
      </div>
    </Transition>

    <div class="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-28 md:px-8 lg:pb-8">
      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p
            class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"
          >
            <AppIcon
              :name="greetingIcon"
              class="size-4"
              :class="isEvening ? 'text-indigo-400' : 'text-amber-500'"
            />
            {{ greeting }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ date }}
          </p>
          <p class="text-lg font-semibold"><RollingText :value="time" /></p>
        </div>

        <div class="flex items-center gap-4">
          <button
            class="rounded-full bg-emerald-300 p-2.5 transition hover:bg-emerald-400"
            :aria-label="
              mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            "
            @click="toggleMode"
          >
            <img
              :src="
                mode === 'dark' ? '/svg/sun-icon.svg' : '/svg/moon-icon.svg'
              "
              alt=""
              class="size-5"
            />
          </button>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <!-- Player -->
        <section
          class="self-start rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10 lg:sticky lg:top-6"
        >
          <div
            class="mx-auto flex size-44 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg ring-8 ring-emerald-200/60 animate-spin [animation-duration:8s] dark:ring-emerald-900/60 md:size-56"
            :class="{ '[animation-play-state:paused]': !playing }"
          >
            <AppIcon
              name="music-icon"
              class="size-16 text-white/90 md:size-20"
            />
          </div>

          <div class="mt-6 text-center">
            <p class="truncate text-xl font-semibold">
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
          <div class="mt-3 flex items-center justify-center gap-2 sm:gap-4">
            <button
              class="flex items-center justify-center rounded-full p-2.5 transition"
              :class="
                shuffle
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                  : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-800'
              "
              :aria-pressed="shuffle"
              :title="shuffle ? 'Shuffle: on' : 'Shuffle: off'"
              aria-label="Shuffle"
              @click="toggleShuffle"
            >
              <AppIcon name="shuffle-icon" class="size-5" />
            </button>

            <button
              class="flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-gray-800"
              :disabled="!tracks.length"
              aria-label="Previous"
              @click="prev"
            >
              <AppIcon name="skip-prev-icon" class="size-7" />
            </button>

            <button
              class="flex items-center justify-center rounded-full bg-emerald-500 p-4 text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-40"
              :disabled="!tracks.length"
              :aria-label="playing ? 'Pause' : 'Play'"
              @click="toggle"
            >
              <AppIcon
                :name="playing ? 'player-pause-icon' : 'player-play-icon'"
                class="size-7"
              />
            </button>

            <button
              class="flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-gray-800"
              :disabled="!tracks.length"
              aria-label="Next"
              @click="next"
            >
              <AppIcon name="skip-next-icon" class="size-7" />
            </button>

            <button
              class="flex items-center justify-center rounded-full p-2.5 transition"
              :class="
                repeat !== 'off'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                  : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-800'
              "
              :aria-pressed="repeat !== 'off'"
              :title="`Repeat: ${repeat}`"
              :aria-label="`Repeat: ${repeat}`"
              @click="cycleRepeat"
            >
              <AppIcon
                :name="repeat === 'one' ? 'repeat-one-icon' : 'repeat-icon'"
                class="size-5"
              />
            </button>
          </div>

          <!-- Volume -->
          <label
            class="mt-5 flex items-center gap-3 text-slate-500 dark:text-slate-400"
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

          <div
            v-if="tracks.length"
            class="flex items-center justify-between border-y border-slate-200 py-2 text-sm dark:border-gray-800"
          >
            <label class="flex cursor-pointer items-center gap-2 px-3">
              <input
                v-model="allSelected"
                type="checkbox"
                class="size-4 accent-emerald-500"
                :indeterminate="someSelected && !allSelected"
              />
              Select all
            </label>
            <div class="flex items-center gap-3 px-1">
              <button
                v-if="selectedIds.length"
                :disabled="isRemoving"
                class="rounded-full bg-red-50 px-3 py-1 font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
                @click="removeSelected"
              >
                Remove selected ({{ selectedIds.length }})
              </button>
              <button
                :disabled="isRemoving"
                class="rounded-full px-3 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-red-500 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-gray-800"
                @click="onClear"
              >
                Clear all
              </button>
            </div>
          </div>

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
              <li
                v-if="removingIds.includes(track.id)"
                class="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2"
                aria-hidden="true"
              >
                <div class="size-4 rounded bg-slate-200 dark:bg-gray-700"></div>
                <div
                  class="h-3 w-5 rounded bg-slate-200 dark:bg-gray-700"
                ></div>
                <div
                  class="h-3 flex-1 rounded bg-slate-200 dark:bg-gray-700"
                ></div>
              </li>
              <li
                v-else
                class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 before:absolute before:inset-y-2 before:left-0 before:w-1 before:origin-center before:rounded-full before:bg-emerald-500 before:transition-transform before:duration-300 hover:bg-slate-100 dark:hover:bg-gray-800"
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
              class="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2.5"
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
    </div>

    <!-- Mobile mini-player -->
    <Transition name="slide-up">
      <div
        v-if="currentTrack"
        class="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-2xl ring-1 ring-black/10 backdrop-blur dark:bg-gray-900/95 dark:ring-white/10 lg:hidden"
      >
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 animate-spin [animation-duration:8s]"
          :class="{ '[animation-play-state:paused]': !playing }"
        >
          <AppIcon name="music-icon" class="size-5 text-white/90" />
        </div>
        <p class="min-w-0 flex-1 truncate text-sm font-medium">
          {{ currentTrack.name }}
        </p>
        <button
          class="flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300"
          aria-label="Previous"
          @click="prev"
        >
          <AppIcon name="skip-prev-icon" class="size-6" />
        </button>
        <button
          class="flex items-center justify-center rounded-full bg-emerald-500 p-2.5 text-white"
          :aria-label="playing ? 'Pause' : 'Play'"
          @click="toggle"
        >
          <AppIcon
            :name="playing ? 'player-pause-icon' : 'player-play-icon'"
            class="size-6"
          />
        </button>
        <button
          class="flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300"
          aria-label="Next"
          @click="next"
        >
          <AppIcon name="skip-next-icon" class="size-6" />
        </button>
      </div>
    </Transition>
  </main>
</template>

<script lang="ts" setup>
const playerStore = usePlayerStore();
const { greeting, greetingIcon, isEvening, time, date } = useClock();

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
  shuffle,
  repeat,
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
  toggleShuffle,
  cycleRepeat,
  removeTrack,
  removeSelected,
  clearAll,
} = playerStore;

// The whole page is a drop target.
const page = useTemplateRef<HTMLElement>("page");
const { isOverDropZone } = useDropZone(page, {
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