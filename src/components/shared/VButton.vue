<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex cursor-pointer items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-40"
    :class="[variants[variant], sizes[size], { 'rounded-full': rounded }]"
    :aria-pressed="active === undefined ? undefined : active"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
import type { Variant, Size } from "@/types/shared/VButton";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    /** Pressed state for `toggle` buttons; also sets aria-pressed. */
    active?: boolean;
    rounded?: boolean;
  }>(),
  {
    variant: "ghost",
    size: "md",
    type: "button",
    disabled: false,
    active: undefined,
    rounded: true,
  },
);

const ghost =
  "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-gray-800";

const variants = computed<Record<Variant, string>>(() => ({
  primary: "bg-emerald-500 text-white shadow-md hover:bg-emerald-600",
  accent: "bg-emerald-300 hover:bg-emerald-400",
  ghost,
  toggle: props.active
    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
    : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-gray-800",
  danger:
    "bg-red-50 font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950",
  "danger-ghost": "text-slate-400 hover:text-red-500",
  plain: "",
}));

const sizes: Record<Size, string> = {
  none: "",
  xs: "p-1",
  sm: "p-2",
  md: "p-2.5",
  lg: "p-4",
  pill: "px-3 py-1 text-sm",
};
</script>