<template>
  <section
    class="self-start rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10 lg:sticky lg:top-6"
  >
    <div
      class="mx-auto flex size-44 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg ring-8 ring-emerald-200/60 animate-spin [animation-duration:8s] dark:ring-emerald-900/60 md:size-56"
      :class="{ '[animation-play-state:paused]': !playing }"
    >
      <app-icon name="music-icon" class="size-16 text-white/90 md:size-20" />
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

    <player-controls />

    <!-- Volume -->
    <label
      class="mt-5 flex items-center gap-3 text-slate-500 dark:text-slate-400"
    >
      <app-icon name="volume-icon" class="size-5 shrink-0" />
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
</template>

<script lang="ts" setup>
const store = usePlayerStore();
const {
  tracks,
  playing,
  currentTrack,
  currentIndex,
  currentTime,
  duration,
  volume,
} = storeToRefs(store);

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
</script>
