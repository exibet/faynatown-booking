<script setup lang="ts">
useHead({ title: 'Faynatown Booking — Тест' })

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const selectedType = ref('Paddle_Tennis')

const bookingTypes = [
  { label: 'Альтанки (BBQ)', value: 'BBQ' },
  { label: 'Великий теніс', value: 'Tennis' },
  { label: 'Баскетбол', value: 'Basketball' },
  { label: 'Волейбол', value: 'Volleyball' },
  { label: 'Футбол', value: 'Football' },
  { label: 'Падл теніс', value: 'Paddle_Tennis' },
]

const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00']

type SlotState = 'available' | 'busy' | 'mine'

const mockGrid: SlotState[][] = [
  ['available', 'busy', 'available', 'mine', 'available', 'busy', 'available'],
  ['busy', 'available', 'busy', 'available', 'mine', 'available', 'busy'],
  ['available', 'available', 'busy', 'busy', 'available', 'available', 'available'],
  ['mine', 'busy', 'available', 'available', 'busy', 'available', 'busy'],
  ['available', 'available', 'available', 'busy', 'busy', 'mine', 'available'],
  ['busy', 'available', 'mine', 'available', 'available', 'busy', 'busy'],
]

function toggleDark() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const CELL_STYLES: Record<SlotState, string> = {
  available: 'slot-available',
  busy: 'slot-busy',
  mine: 'slot-mine',
}

function cellLabel(state: SlotState) {
  if (state === 'available') return 'Вільно'
  if (state === 'mine') return 'Моє'
  return 'Зайнято'
}
</script>

<template>
  <div class="app-root">
    <header class="app-header">
      <div>
        <h1 class="text-xl font-semibold">
          Faynatown Booking
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Тестова сторінка — перевірка PrimeVue + Tailwind v4
        </p>
      </div>
      <div class="flex items-center gap-3">
        <Select
          v-model="selectedType"
          :options="bookingTypes"
          option-label="label"
          option-value="value"
          placeholder="Тип бронювання"
          class="w-56"
        />
        <Button
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          severity="secondary"
          text
          rounded
          aria-label="Змінити тему"
          @click="toggleDark"
        />
      </div>
    </header>

    <main class="app-main">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          Легенда
        </h2>
        <div class="flex flex-wrap gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="legend-dot slot-available" />
            Вільний слот
          </div>
          <div class="flex items-center gap-2">
            <span class="legend-dot slot-busy" />
            Зайнято
          </div>
          <div class="flex items-center gap-2">
            <span class="legend-dot slot-mine" />
            Моє бронювання
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          Тиждень — мок-превʼю
        </h2>
        <div class="grid-wrapper">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th class="grid-head w-20 text-left">
                  Час
                </th>
                <th
                  v-for="day in days"
                  :key="day"
                  class="grid-head text-center"
                >
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIdx) in mockGrid"
                :key="rowIdx"
                class="grid-row"
              >
                <td class="grid-hour">
                  {{ hours[rowIdx] }}
                </td>
                <td
                  v-for="(cell, colIdx) in row"
                  :key="colIdx"
                  class="p-1"
                >
                  <div :class="['slot-cell', CELL_STYLES[cell]]">
                    {{ cellLabel(cell) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">
          Тест PrimeVue кнопок
        </h2>
        <div class="flex flex-wrap gap-2">
          <Button label="Primary" />
          <Button
            label="Secondary"
            severity="secondary"
          />
          <Button
            label="Success"
            severity="success"
          />
          <Button
            label="Danger"
            severity="danger"
          />
          <Button
            label="З іконкою"
            icon="pi pi-calendar"
          />
          <Button
            label="Outlined"
            outlined
          />
          <Button
            label="Text"
            text
          />
        </div>
      </section>

      <footer class="app-footer">
        Обраний тип:
        <span class="font-mono">{{ selectedType }}</span>
        — буде замінено реальним календарем.
      </footer>
    </main>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.app-root {
  @apply min-h-screen bg-white text-zinc-900 transition-colors;
  @apply dark:bg-zinc-950 dark:text-zinc-100;
}

.app-header {
  @apply border-b border-zinc-200 px-6 py-4 flex items-center justify-between;
  @apply dark:border-zinc-800;
}

.app-main {
  @apply px-6 py-8 max-w-6xl mx-auto space-y-8;
}

.app-footer {
  @apply pt-6 border-t border-zinc-200 text-sm text-zinc-500;
  @apply dark:border-zinc-800 dark:text-zinc-400;
}

.grid-wrapper {
  @apply overflow-x-auto rounded-lg border border-zinc-200;
  @apply dark:border-zinc-800;
}

.grid-head {
  @apply px-3 py-2 font-medium text-zinc-500;
  @apply dark:text-zinc-400;
}

.grid-row {
  @apply border-t border-zinc-200;
  @apply dark:border-zinc-800;
}

.grid-hour {
  @apply px-3 py-2 text-zinc-500 tabular-nums;
  @apply dark:text-zinc-400;
}

.legend-dot {
  @apply inline-block w-4 h-4 rounded border;
}

.slot-cell {
  @apply border rounded px-2 py-2 text-center text-xs font-medium transition-colors;
}

.slot-available {
  @apply bg-green-100 border-green-300 cursor-pointer;
  @apply hover:bg-green-200;
  @apply dark:bg-green-900/40 dark:border-green-700;
  @apply dark:hover:bg-green-800/60;
}

.slot-busy {
  @apply bg-zinc-100 border-zinc-200;
  @apply dark:bg-zinc-800 dark:border-zinc-700;
}

.slot-mine {
  @apply bg-blue-100 border-blue-300;
  @apply dark:bg-blue-900/40 dark:border-blue-700;
}
</style>
