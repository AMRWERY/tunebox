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
      <VButton
        v-if="selectedIds.length"
        variant="danger"
        size="pill"
        :disabled="isRemoving"
        @click="removeSelected"
      >
        Remove selected ({{ selectedIds.length }})
      </VButton>
      <VButton
        variant="toggle"
        size="pill"
        class="hover:text-red-500"
        :disabled="isRemoving"
        @click="onClear"
      >
        Clear all
      </VButton>
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