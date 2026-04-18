<script setup lang="ts">
const { t, locale } = useI18n()
const url = useRequestURL()

useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: title => (title ? `${title}` : t('app.title')),
})

// Dynamic SEO + OG meta — reactive to locale changes. `useSeoMeta` takes
// getters as function values; values recompute when `locale.value` flips.
// `url.origin` is the request origin on SSR and `window.location.origin` on
// the client, so absolute URLs work for scrapers that don't resolve relative.
useSeoMeta({
  description: () => t('meta.description'),
  ogType: 'website',
  ogSiteName: () => t('app.title'),
  ogTitle: () => t('app.title'),
  ogDescription: () => t('meta.description'),
  ogImage: `${url.origin}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogLocale: () => (locale.value === 'uk' ? 'uk_UA' : 'en_US'),
  ogLocaleAlternate: () => (locale.value === 'uk' ? ['en_US'] : ['uk_UA']),
  ogUrl: `${url.origin}${url.pathname}`,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('app.title'),
  twitterDescription: () => t('meta.description'),
  twitterImage: `${url.origin}/og-image.png`,
})
// Theme init runs in plugins/theme.client.ts — no need to wire it here.
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
  </div>
</template>
