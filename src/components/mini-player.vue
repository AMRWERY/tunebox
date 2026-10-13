<template>
  <Transition name="slide-up">
    <div
      v-if="currentTrack"
      class="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-2xl ring-1 ring-black/10 backdrop-blur dark:bg-gray-900/95 dark:ring-white/10 lg:hidden"
    >
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-600 animate-spin [animation-duration:8s]"
        :class="{ '[animation-play-state:paused]': !playing }"
      >
        <app-icon name="music-icon" class="size-5 text-white/90" />
      </div>

      <p class="min-w-0 flex-1 truncate text-sm font-medium">
        {{ currentTrack.name }}
      </p>

      <button
        class="flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300"
        aria-label="Previous"
        @click="prev"
      >
        <app-icon name="skip-prev-icon" class="size-6" />
      </button>
      <button
        class="flex items-center justify-center rounded-full bg-emerald-500 p-2.5 text-white"
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="toggle"
      >
        <app-icon
          :name="playing ? 'player-pause-icon' : 'player-play-icon'"
          class="size-6"
        />
      </button>
      <button
        class="flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-300"
        aria-label="Next"
        @click="next"
      >
        <app-icon name="skip-next-icon" class="size-6" />
      </button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
const store = usePlayerStore();
const { currentTrack, playing } = storeToRefs(store);
const { toggle, next, prev } = store;
</script>
