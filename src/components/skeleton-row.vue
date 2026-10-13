<template>
  <li
    class="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2.5"
    aria-hidden="true"
  >
    <div class="size-4 rounded bg-slate-200 dark:bg-gray-700"></div>
    <div class="h-3 w-5 rounded bg-slate-200 dark:bg-gray-700"></div>
    <div
      class="h-3 rounded bg-slate-200 dark:bg-gray-700"
      :class="{ 'flex-1': !width }"
      :style="width ? { width } : undefined"
    ></div>
  </li>
</template>

<script lang="ts" setup>
defineProps<{ width?: string }>();
</script>
