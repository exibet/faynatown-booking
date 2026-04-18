<script setup lang="ts">
const { t, locale } = useI18n()
const theme = useTheme()

useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: title => (title ? `${title}` : t('app.title')),
})

onMounted(() => {
  theme.init()
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
  </div>
</template>
