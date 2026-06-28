<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AuthLayout from './layouts/AuthLayout.vue';
import MainLayout from './layouts/MainLayout.vue';

const route = useRoute();

// Словарь доступных макетов
const layouts = {
  AuthLayout,
  MainLayout
};

// Вычисляем, какой макет нужен текущей странице
const currentLayout = computed(() => {
  return layouts[route.meta.layout || 'MainLayout'];
});
</script>

<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>