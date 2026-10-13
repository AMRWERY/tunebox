<template>
  <li
    class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 before:absolute before:inset-y-2 before:left-0 before:w-1 before:origin-center before:rounded-full before:bg-emerald-500 before:transition-transform before:duration-300 hover:bg-slate-100 dark:hover:bg-gray-800"
    :class="[
      isCurrent
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
      :class="{ 'text-emerald-500 font-bold': isCurrent }"
    >
      <span
        v-if="isCurrent && playing"
        class="flex h-4 items-end gap-0.5"
        aria-label="Playing"
      >
        <span class="eq-bar"></span>
        <span class="eq-bar"></span>
        <span class="eq-bar"></span>
      </span>
      <template v-else>{{ index + 1 }}</template>
    </span>

    <button
      class="flex-1 truncate text-left text-sm"
      :class="{
        'font-semibold text-emerald-600 dark:text-emerald-400': isCurrent,
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
      <app-icon name="close-icon" class="size-4" />
    </button>
  </li>
</template>

<script lang="ts" setup>
import type { Track } from "@/types";

const props = defineProps<{ track: Track; index: number }>();

const store = usePlayerStore();
const { currentId, playing, selectedIds } = storeToRefs(store);
const { select, removeTrack } = store;

const isCurrent = computed(() => props.track.id === currentId.value);
</script>
