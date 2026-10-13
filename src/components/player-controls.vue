<template>
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
      <app-icon name="shuffle-icon" class="size-5" />
    </button>

    <button
      class="flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-gray-800"
      :disabled="!tracks.length"
      aria-label="Previous"
      @click="prev"
    >
      <app-icon name="skip-prev-icon" class="size-7" />
    </button>

    <button
      class="flex items-center justify-center rounded-full bg-emerald-500 p-4 text-white shadow-md transition hover:bg-emerald-600 disabled:opacity-40"
      :disabled="!tracks.length"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="toggle"
    >
      <app-icon
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
      <app-icon name="skip-next-icon" class="size-7" />
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
      <app-icon
        :name="repeat === 'one' ? 'repeat-one-icon' : 'repeat-icon'"
        class="size-5"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
const store = usePlayerStore();
const { tracks, playing, shuffle, repeat } = storeToRefs(store);
const { toggle, next, prev, toggleShuffle, cycleRepeat } = store;
</script>
