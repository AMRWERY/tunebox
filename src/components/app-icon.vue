<template>
  <!-- Renders src/assets/svg/<name>.svg as a mask so it inherits the text colour. -->
  <span
    class="app-icon"
    aria-hidden="true"
    :style="{ '--icon': iconVar }"
  ></span>
</template>

<script lang="ts" setup>
const props = defineProps<{ name: string }>();

const iconVar = computed(() => `url(${getIconUrl(props.name)})`);
</script>

<style scoped>
.app-icon {
  display: inline-block;
  background-color: currentColor;
  mask: var(--icon) center / contain no-repeat;
  -webkit-mask: var(--icon) center / contain no-repeat;
}
</style>