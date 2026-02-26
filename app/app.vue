<script setup lang="ts">
import { usePresence } from '~/composables/usePresence';

const { initPresence } = usePresence();
initPresence();
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- 
      O componente NuxtLayout é essencial aqui para que o definePageMeta({ layout: '...' }) 
      das páginas funcione corretamente e envolva o conteúdo com a Sidebar.
    -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
