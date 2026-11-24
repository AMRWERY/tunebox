<template>
  <VDialog
    v-model:open="open"
    :title="title"
    :confirm-label="confirmLabel"
    :confirm-disabled="!name.trim()"
    @submit="onSubmit"
  >
    <input
      ref="input"
      v-model="name"
      maxlength="40"
      aria-label="Playlist name"
      placeholder="Playlist name"
      class="w-full rounded-full bg-slate-100 px-4 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-emerald-400 dark:bg-gray-800 dark:ring-gray-700 dark:focus:ring-emerald-500"
    />
  </VDialog>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string;
  confirmLabel: string;
  initialName: string;
}>();

const emit = defineEmits<{ submit: [name: string] }>();
const open = defineModel<boolean>("open", { default: false });

const name = ref("");
const input = useTemplateRef<HTMLInputElement>("input");

watch(open, async (isOpen) => {
  if (!isOpen) return;
  name.value = props.initialName;
  await nextTick();
  input.value?.select();
});

const onSubmit = () => {
  const trimmed = name.value.trim();
  if (!trimmed) return;
  emit("submit", trimmed);
  open.value = false;
};
</script>
