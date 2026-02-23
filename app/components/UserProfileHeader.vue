<template>
  <ClientOnly>
    <div class="header-user-presence" v-if="user">
      <!-- Perfil Real ou Metadados do Auth -->
      <div class="user-profile">
        <div class="user-info">
          <span class="user-name">
            {{ formattedName }}
          </span>
          <span 
            class="user-status-text" 
            :class="isOnline ? 'online' : 'offline'"
          >
            {{ isOnline ? 'online' : 'offline' }}
          </span>
        </div>
        <div class="avatar-wrapper">
          <img 
            v-if="formattedName"
            :src="`https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}&backgroundColor=818cf8`" 
            alt="Avatar" 
            class="user-avatar" 
          />
          <div 
            class="online-indicator" 
            :class="{ 'is-online': isOnline }"
          ></div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

const { profile, user, fetchProfile, isOnlineCalculated } = useAuth();

// Garante que o perfil seja carregado ao montar o componente
onMounted(async () => {
  if (user.value && !profile.value) {
    await fetchProfile();
  }
});

// Formata o nome para exibir apenas os dois primeiros
const formattedName = computed(() => {
  const fullContent = profile.value?.nome || user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || user.value?.email?.split('@')[0] || 'Usuário';
  
  // Lista de preposições para ignorar
  const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
  
  // Limpa espaços extras e divide, filtrando as preposições
  const names = fullContent.trim().split(/\s+/)
    .filter((part: string) => !preposicoes.includes(part.toLowerCase()));
  
  // Retorna os dois primeiros nomes significativos
  if (names.length >= 2) {
    return `${names[0]} ${names[1]}`;
  }
  return names[0] || fullContent;
});

// O status exibido no header é o do próprio usuário logado
const isOnline = isOnlineCalculated;
</script>

<style scoped>
.header-user-presence {
  display: flex;
  align-items: center;
}

.profile-placeholder {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.placeholder-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
  line-height: 1.2;
  margin-bottom: 0px;
}

.user-status-text {
  font-size: 0.7rem;
  font-weight: 600;
  transition: color 0.3s;
}

.user-status-text.online {
  color: #22c55e;
}

.user-status-text.offline {
  color: #94a3b8;
}

.avatar-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #94a3b8;
  border: 2px solid white;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.online-indicator.is-online {
  background-color: #22c55e;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #22c55e40;
  animation: pulse-presence 2s infinite;
}

@keyframes pulse-presence {
  0% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); }
}
</style>
