<script setup lang="ts">
const { t } = useI18n()
const { login, isLoggedIn } = useAuth()
const route = useRoute()
const toast = useToast()

definePageMeta({ layout: false })

// Login page is the only surface crawlers / link scrapers see without auth —
// give it a page-specific title so `<title>` reads "Увійти · Файна Таун — Бронювання".
useSeoMeta({
  title: () => t('meta.loginTitle'),
})

const phoneNumber = ref('')
const password = ref('')
const loading = ref(false)

const redirectTo = computed(() => {
  const param = route.query.redirect
  return typeof param === 'string' ? param : '/'
})

// If a returning user lands on /login with a valid JWT already in
// localStorage (seeded by `plugins/auth-token.client.ts`), bounce them to
// the home page. Runs on client hydration only — the plugin is .client.ts
// so `isLoggedIn` is never true during SSR of this page.
if (isLoggedIn.value) {
  await navigateTo(redirectTo.value, { external: true, replace: true })
}

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  try {
    await login(phoneNumber.value, password.value)
    // `external: true` forces a full browser navigation. Needed because
    // /login is SSR but `/` is SPA (`routeRules.ssr=false`) — Nuxt's
    // SPA-side router doesn't reliably switch rendering modes mid-nav.
    // A hard reload is safe now that auth is Bearer-only: `localStorage`
    // survives the reload, `plugins/auth-token.client.ts` reseeds state,
    // middleware allows, and `/` renders. `replace: true` drops /login
    // from history so the back button doesn't return to it.
    await navigateTo(redirectTo.value, { external: true, replace: true })
  }
  catch {
    toast.error(t('auth.loginError'))
    loading.value = false
  }
}
</script>

<template>
  <div class="login-root">
    <form
      class="login-card"
      @submit.prevent="handleSubmit"
    >
      <h1 class="login-title">
        {{ t('app.title') }}
      </h1>

      <label class="login-field">
        <span>{{ t('auth.phone') }}</span>
        <input
          v-model="phoneNumber"
          class="login-input"
          :placeholder="t('auth.phonePlaceholder')"
          autocomplete="tel"
          inputmode="tel"
          required
        >
      </label>

      <label class="login-field">
        <span>{{ t('auth.password') }}</span>
        <input
          v-model="password"
          class="login-input"
          type="password"
          autocomplete="current-password"
          required
        >
      </label>

      <button
        type="submit"
        class="login-submit"
        :disabled="loading"
      >
        {{ loading ? '…' : t('auth.login') }}
      </button>
    </form>
  </div>
</template>
