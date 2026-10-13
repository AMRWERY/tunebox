<template>
  <main
    ref="page"
    class="min-h-screen bg-linear-to-br from-slate-100 to-emerald-100 text-slate-900 dark:from-gray-950 dark:to-emerald-950 dark:text-slate-100"
  >
    <drop-overlay :active="isOverDropZone" />

    <div class="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-28 md:px-8 lg:pb-8">
      <app-header />

      <div class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <player-card />

        <playlist-card />
      </div>
    </div>

    <mini-player />
  </main>
</template>

<script lang="ts" setup>
const { addFiles } = usePlayerStore();

// The whole page is a drop target.
const page = useTemplateRef<HTMLElement>("page");

const { isOverDropZone } = useDropZone(page, {
  onDrop: (files) => {
    if (files?.length) addFiles(files);
  },
});
</script>
