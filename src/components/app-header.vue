<template>
  <header class="flex items-center justify-between gap-4">
    <div class="min-w-0">
      <p
        class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"
      >
        <app-icon
          :name="greetingIcon"
          class="size-4"
          :class="isEvening ? 'text-indigo-400' : 'text-amber-500'"
        />
        {{ greeting }}
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {{ date }}
      </p>
      <p class="text-lg font-semibold"><rolling-text :value="time" /></p>
    </div>

    <VButton
      variant="accent"
      class="overflow-hidden"
      :aria-label="
        mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      "
      @click="toggleMode($event)"
    >
      <transition name="icon-spin" mode="out-in">
        <img
          :key="mode"
          :src="mode === 'dark' ? '/svg/sun-icon.svg' : '/svg/moon-icon.svg'"
          alt=""
          class="size-5"
        />
      </transition>
    </VButton>
  </header>
</template>

<script lang="ts" setup>
const { greeting, greetingIcon, isEvening, time, date } = useClock();

const store = usePlayerStore();
const { mode } = storeToRefs(store);
const { toggleMode } = store;
</script>