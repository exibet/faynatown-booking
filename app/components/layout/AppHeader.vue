<script setup lang="ts">
/**
 * Desktop header shell. Composes 4 logical clusters (flat pill, type pill,
 * week nav, actions) and owns the mutually-exclusive dropdown group so only
 * one menu is open at a time across children.
 */
const dropdowns = useDropdownGroup<'flat' | 'type' | 'profile'>()
</script>

<template>
  <header class="ft-header">
    <div class="ft-header-left">
      <HeaderFlatPill
        :open="dropdowns.is('flat')"
        @toggle="dropdowns.toggle('flat')"
        @close="dropdowns.closeAll"
      />
      <HeaderTypePill
        :open="dropdowns.is('type')"
        @toggle="dropdowns.toggle('type')"
        @close="dropdowns.closeAll"
      />
    </div>

    <HeaderWeekNav />

    <HeaderActions
      :profile-open="dropdowns.is('profile')"
      @toggle-profile="dropdowns.toggle('profile')"
      @close="dropdowns.closeAll"
    />
  </header>
</template>
