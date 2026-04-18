<script setup lang="ts">
const { state, answer } = useConfirm()

function onKey(event: KeyboardEvent) {
  if (!state.value) return
  if (event.key === 'Escape') answer(false)
  if (event.key === 'Enter') answer(true)
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="state"
        class="ft-modal-backdrop"
        @click.self="answer(false)"
      >
        <div
          class="ft-modal"
          role="dialog"
          aria-modal="true"
        >
          <div class="ft-modal-body">
            {{ state.title }}
          </div>
          <div class="ft-modal-foot">
            <button
              type="button"
              class="ft-btn-ghost"
              @click="answer(false)"
            >
              {{ state.cancelLabel }}
            </button>
            <button
              type="button"
              :class="state.variant === 'danger' ? 'ft-btn-danger' : 'ft-btn-primary'"
              @click="answer(true)"
            >
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>
