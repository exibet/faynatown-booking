<script setup lang="ts">
const { t } = useI18n()
const { login, isLoggedIn } = useAuth()
const route = useRoute()
const toast = useToast()

definePageMeta({ layout: false })

useHead({ title: () => t('app.title') })

const phoneNumber = ref('')
const password = ref('')
const loading = ref(false)

const redirectTo = computed(() => {
  const param = route.query.redirect
  return typeof param === 'string' ? param : '/'
})

// Redirect in setup so it runs on SSR too — no flash of the login form
// for users who are already signed in.
if (isLoggedIn.value) {
  await navigateTo(redirectTo.value)
}

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  try {
    await login(phoneNumber.value, password.value)
    await navigateTo(redirectTo.value)
  }
  catch {
    toast.add({
      severity: 'error',
      summary: t('auth.loginError'),
      life: 4000,
    })
  }
  finally {
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
        <InputText
          v-model="phoneNumber"
          :placeholder="t('auth.phonePlaceholder')"
          autocomplete="tel"
          inputmode="tel"
          required
        />
      </label>

      <label class="login-field">
        <span>{{ t('auth.password') }}</span>
        <InputText
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>

      <Button
        type="submit"
        :label="t('auth.login')"
        :loading="loading"
        class="w-full"
      />
    </form>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.login-root {
  @apply min-h-screen flex items-center justify-center bg-white px-4;
  @apply dark:bg-zinc-950;
}

.login-card {
  @apply w-full max-w-sm p-6 flex flex-col gap-4 rounded-lg border;
  @apply border-zinc-200 bg-white;
  @apply dark:border-zinc-800 dark:bg-zinc-900;
}

.login-title {
  @apply text-xl font-semibold text-zinc-900 text-center;
  @apply dark:text-zinc-100;
}

.login-field {
  @apply flex flex-col gap-1 text-sm;
  @apply text-zinc-700 dark:text-zinc-300;
}
</style>
