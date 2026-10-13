<template>
  <!-- Each digit slides out/in when it changes; other characters stay static. -->
  <span class="rolling-text" :aria-label="value">
    <template v-for="(char, i) in chars" :key="i">
      <span v-if="/\d/.test(char)" class="cell" aria-hidden="true">
        <Transition name="digit">
          <span :key="char">{{ char }}</span>
        </Transition>
      </span>
      <span v-else aria-hidden="true">{{ char }}</span>
    </template>
  </span>
</template>

<script lang="ts" setup>
const props = defineProps<{ value: string }>();

const chars = computed(() => [...props.value]);
</script>

<style scoped>
.rolling-text {
  display: inline-flex;
  font-variant-numeric: tabular-nums;
  white-space: pre;
}

.cell {
  position: relative;
  display: inline-block;
  overflow: hidden;
  min-width: 1ch;
  text-align: center;
}

.digit-enter-active,
.digit-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}

.digit-leave-active {
  position: absolute;
  inset: 0;
}

.digit-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.digit-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .digit-enter-active,
  .digit-leave-active {
    transition: none;
  }
}
</style>