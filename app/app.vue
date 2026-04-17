<script setup lang="ts">
// Initialise theme as early as possible to avoid FOUC.
useTheme()

const { t, locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: title => (title ? `${title}` : t('app.title')),
})
</script>

<template>
  <div>
    <Toast />
    <NuxtPage />
  </div>
</template>
