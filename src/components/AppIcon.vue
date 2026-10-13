<template>
  <!-- Renders /public/svg/<name>.svg as a mask so it inherits the text colour. -->
  <span
    class="app-icon"
    aria-hidden="true"
    :style="{ '--icon': `url(/svg/${name}.svg)` }"
  ></span>
</template>

<script lang="ts" setup>
defineProps<{ name: string }>();
</script>

<style scoped>
.app-icon {
  display: inline-block;
  background-color: currentColor;
  mask: var(--icon) center / contain no-repeat;
  -webkit-mask: var(--icon) center / contain no-repeat;
}
</style>
