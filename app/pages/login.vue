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

// Returning user with a valid JWT in localStorage (seeded by
// `plugins/auth-token.client.ts`) — bounce them off the login form.
// `replace: true` drops /login from history so the back button doesn't
// trap them in a form→home→form loop.
if (isLoggedIn.value) {
  await navigateTo(redirectTo.value, { replace: true })
}

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  try {
    await login(phoneNumber.value, password.value)
    await navigateTo(redirectTo.value, { replace: true })
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
