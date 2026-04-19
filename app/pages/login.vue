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

// We intentionally do NOT redirect on cookie presence here. `useAuth`'s
// `isLoggedIn` is now state-only (true after explicit login or after the
// auth middleware verified the cookie on SSR for a protected route). If a
// genuinely-logged-in user types /login, they'll see the form again — minor
// UX trade-off vs. risking a redirect loop with stale cookies.
if (isLoggedIn.value) {
  await navigateTo(redirectTo.value)
}

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  try {
    await login(phoneNumber.value, password.value)
    // SPA navigation — `useAuth.login()` now stores the JWT in
    // `useState(STATE_KEY.TOKEN)` and the auth middleware / `createApi`
    // both read from it, so we don't need a hard reload to let SSR see the
    // cookie. A hard reload here would actively BREAK iOS Safari: ITP can
    // drop our cookie between the login POST response and the next top-level
    // navigation on *.vercel.app, sending the user back to /login.
    await navigateTo(redirectTo.value)
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
