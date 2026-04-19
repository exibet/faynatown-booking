<script setup lang="ts">
/**
 * Warning banner shown after the user clicks "Забронювати" — explains that
 * the official app's captcha blocks external booking creation. Same copy and
 * visual style on desktop and mobile; only sizing differs (tighter paddings
 * + smaller type on desktop).
 */
defineProps<{
  variant: 'desktop' | 'mobile'
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="ft-notice"
    :class="`ft-notice--${variant}`"
    role="status"
  >
    <div class="ft-notice-title">
      {{ t('zones.captchaTitle') }}
    </div>
    <p class="ft-notice-p">
      {{ t('zones.captchaP1') }}
    </p>
    <p class="ft-notice-p">
      {{ t('zones.captchaP2') }}
    </p>
    <p class="ft-notice-p">
      {{ t('zones.captchaP3') }}
    </p>
  </div>
</template>
