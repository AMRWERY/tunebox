<template>
  <div
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
</template>

<script lang="ts" setup>
const store = usePlayerStore();
const { tracks, isRemoving, selectedIds, someSelected, allSelected } =
  storeToRefs(store);
const { removeSelected, clearAll } = store;

const onClear = () => {
  if (confirm(`Remove all ${tracks.value.length} songs from the playlist?`))
    clearAll();
};
</script>
