<template>
  <Transition name="drop-fade">
    <div
      v-if="active"
      class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm"
    >
      <p
        class="rounded-2xl border-2 border-dashed border-emerald-500 bg-white/90 px-8 py-6 text-lg font-semibold text-emerald-600 dark:bg-gray-900/90"
      >
        Drop audio files to add them
      </p>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
defineProps<{ active: boolean }>();
</script>
