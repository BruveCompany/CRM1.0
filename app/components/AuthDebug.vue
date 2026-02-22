<template>
  <div style="position: fixed; bottom: 0; right: 0; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-size: 10px; z-index: 9999; max-width: 300px; max-height: 200px; overflow: auto; pointer-events: none;">
    <b>Auth Debug:</b><br/>
    User ID: {{ user?.id }}<br/>
    Email: {{ user?.email }}<br/>
    Metadata Nome: {{ user?.user_metadata?.full_name || user?.user_metadata?.name || 'N/A' }}<br/>
    Profile Nome: {{ profile?.nome || 'N/A' }}<br/>
    Profile ID: {{ profile?.id || 'N/A' }}
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
const { user, profile } = useAuth();
</script>
