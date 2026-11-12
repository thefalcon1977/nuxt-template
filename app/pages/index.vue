<template>
  <main class="page-wrapper">
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('home.description') }}</p>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>

<style scoped></style>
