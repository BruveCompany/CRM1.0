<script setup lang="ts">
import { usePresence } from '~/composables/usePresence';

const { initPresence } = usePresence();
initPresence();
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <!-- Debug temporário para ver o que está sendo retornado -->
    <!-- <AuthDebug /> -->
  </div>
</template>
