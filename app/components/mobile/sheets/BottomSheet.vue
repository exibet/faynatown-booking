<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="ftsheet">
      <template v-if="open">
        <div>
          <div
            class="sh-back"
            @click="emit('close')"
          />
          <div
            class="sh"
            role="dialog"
            aria-modal="true"
          >
            <div class="sh-handle" />
            <div class="sh-head">
              <span>{{ title }}</span>
              <button
                type="button"
                @click="emit('close')"
              >
                <Icon name="close" />
              </button>
            </div>
            <div class="sh-body">
              <slot />
            </div>
          </div>
        </div>
      </template>
    </Transition>
  </Teleport>
</template>
