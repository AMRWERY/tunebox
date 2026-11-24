<template>
  <dialog
    ref="dialog"
    class="m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-3xl bg-white p-0 text-slate-800 shadow-2xl ring-1 ring-black/10 backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:bg-gray-900 dark:text-slate-100 dark:ring-white/10"
    :aria-labelledby="titleId"
    @close="open = false"
    @click.self="open = false"
  >
    <form class="space-y-4 p-5" @submit.prevent="emit('submit')">
      <h3 :id="titleId" class="text-lg font-semibold">{{ title }}</h3>

      <slot />

      <div class="flex justify-end gap-2 pt-1">
        <VButton size="pill" @click="open = false">Cancel</VButton>
        <VButton
          type="submit"
          variant="primary"
          size="pill"
          :disabled="confirmDisabled"
        >
          {{ confirmLabel }}
        </VButton>
      </div>
    </form>
  </dialog>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  confirmLabel: string;
  confirmDisabled?: boolean;
}>();

const emit = defineEmits<{ submit: [] }>();
const open = defineModel<boolean>("open", { default: false });

const titleId = `dialog-title-${useId()}`;
const dialog = useTemplateRef<HTMLDialogElement>("dialog");

watch(
  open,
  (isOpen) => {
    const el = dialog.value;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    else if (!isOpen && el.open) el.close();
  },
  { flush: "post" },
);
</script>
