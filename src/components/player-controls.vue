<template>
  <div class="mt-3 flex items-center justify-center gap-2 sm:gap-4">
    <VButton
      variant="toggle"
      :active="shuffle"
      :title="shuffle ? 'Shuffle: on' : 'Shuffle: off'"
      aria-label="Shuffle"
      @click="toggleShuffle"
    >
      <app-icon name="shuffle-icon" class="size-5" />
    </VButton>

    <VButton
      size="sm"
      :disabled="!tracks.length"
      aria-label="Previous"
      @click="prev"
    >
      <app-icon name="skip-prev-icon" class="size-7" />
    </VButton>

    <VButton
      variant="primary"
      size="lg"
      :disabled="!tracks.length"
      :aria-label="playing ? 'Pause' : 'Play'"
      @click="toggle"
    >
      <app-icon
        :name="playing ? 'player-pause-icon' : 'player-play-icon'"
        class="size-7"
      />
    </VButton>

    <VButton
      size="sm"
      :disabled="!tracks.length"
      aria-label="Next"
      @click="next"
    >
      <app-icon name="skip-next-icon" class="size-7" />
    </VButton>

    <VButton
      variant="toggle"
      :active="repeat !== 'off'"
      :title="`Repeat: ${repeat}`"
      :aria-label="`Repeat: ${repeat}`"
      @click="cycleRepeat"
    >
      <app-icon
        :name="repeat === 'one' ? 'repeat-one-icon' : 'repeat-icon'"
        class="size-5"
      />
    </VButton>
  </div>
</template>

<script lang="ts" setup>
const store = usePlayerStore();
const { queue: tracks, playing, shuffle, repeat } = storeToRefs(store);
const { toggle, next, prev, toggleShuffle, cycleRepeat } = store;
</script>