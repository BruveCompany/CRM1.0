<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-gray-50">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Default layout with sidebar
</script>
