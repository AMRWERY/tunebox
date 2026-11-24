<template>
  <div
    class="pointer-events-none fixed inset-3 z-50 flex flex-col items-center justify-center gap-2"
    aria-live="polite"
  >
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full max-w-sm rounded-2xl px-4 py-3 text-sm shadow-xl ring-1 backdrop-blur"
        :class="styles[toast.type]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <div class="flex items-start gap-3">
          <p class="min-w-0 flex-1 wrap-break-word">{{ toast.message }}</p>
          <VButton
            variant="plain"
            size="xs"
            class="-mr-1 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
            @click="dismiss(toast.id)"
          >
            <app-icon name="close-icon" class="size-4" />
          </VButton>
        </div>

        <div v-if="toast.resolve" class="mt-3 flex justify-end gap-2">
          <VButton size="pill" @click="dismiss(toast.id)">Cancel</VButton>
          <VButton
            variant="primary"
            size="pill"
            @click="dismiss(toast.id, true)"
          >
            Remove
          </VButton>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import type { ToastType } from "@/types/composables/useToast";

const { toasts, dismiss } = useToast();

const styles: Record<ToastType, string> = {
  error:
    "bg-red-50/95 text-red-700 ring-red-200 dark:bg-red-950/90 dark:text-red-200 dark:ring-red-900",
  success:
    "bg-emerald-50/95 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-200 dark:ring-emerald-900",
  info: "bg-white/95 text-slate-700 ring-black/10 dark:bg-gray-900/95 dark:text-slate-200 dark:ring-white/10",
};
</script>

<style>
.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.toast-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>