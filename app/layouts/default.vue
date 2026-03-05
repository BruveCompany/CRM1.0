<template>
  <div class="flex h-screen w-full overflow-hidden bg-neutral-50">
<!-- Sidebar fixa à esquerda -->
    <Sidebar :unreadCount="unreadCount" />

    <!-- Conteúdo Principal -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Área de Conteúdo principal ajustada para permitir componentes de altura total -->
      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar" style="scrollbar-gutter: stable;">
        <slot />
      </div>
    </main>

    <!-- Modais Globais -->
    <LeadsLeadFormModal v-model="isCreateLeadModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';
import { useTitle } from '@vueuse/core';

const { isCreateLeadModalOpen } = useLeads();
const supabase = useSupabaseClient();
const userStore = useUserStore();

// ============================================
// SISTEMA DE NOTIFICAÇÕES DE CHAT EM TEMPO REAL
// ============================================

// Conjunto (Set) de conversas não lidas e estado de foco da janela
const unreadConversations = ref(new Set<string>());
const isWindowFocused = ref(true);

// Controle do Título do documento
const originalTitle = useTitle();
const titleRef = useTitle();

// Audio ref (carregado dinamicamente para evitar erro SSR)
let notificationSound: HTMLAudioElement | null = null;
let chatChannel: any = null;

const unreadCount = computed(() => unreadConversations.value.size);

// Atualiza título da janela baseado nas mensagens não lidas e foco
const updatePageTitle = () => {
  if (unreadCount.value > 0 && !isWindowFocused.value) {
    titleRef.value = `(${unreadCount.value}) Nova Mensagem! | Painel`;
  } else {
    // Tenta restaurar omitindo o "(X) Nova Mensagem! | "
    titleRef.value = (originalTitle.value || '').replace(/^\(\d+\) Nova Mensagem! \| /, '');
  }
};

// Limpa notificações quando o usuário volta (focus)
watch(isWindowFocused, (focused) => {
  if (focused) {
    // Pequeno delay para garantir que o usuário viu, ou para evitar glitches
    setTimeout(() => {
      unreadConversations.value.clear();
      updatePageTitle();
    }, 1500);
  }
});

const playNotificationSound = () => {
  if (notificationSound) {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(e => console.warn('Não foi possível reproduzir som de notificação (automação do navegador bloqueou):', e));
  }
};

const setupFocusListeners = () => {
  const onFocus = () => { isWindowFocused.value = true; };
  const onBlur = () => { isWindowFocused.value = false; };
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);

  // Define status inicial real baseado na verificação do documento
  isWindowFocused.value = document.hasFocus();
};

const setupRealtimeChatNotifications = () => {
  chatChannel = supabase.channel('global-chat-notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ag_chat' },
      (payload: any) => {
        const msg = payload.new;
        
        // Verifica se a mensagem NÃO foi enviada pelo atendente atual e se a janela está sem foco
        // `direcao = 'in'` geralmente representa mensagens recebidas de leads/clientes
        const currentUserProfileId = userStore.profile?.id;
        const isReceived = msg.direcao === 'in' || (msg.profissional_id && msg.profissional_id !== currentUserProfileId);
        
        if (isReceived && !isWindowFocused.value) {
          unreadConversations.value.add(msg.conversa_id);
          playNotificationSound();
          updatePageTitle();
        }
      }
    )
    .subscribe();
};

onMounted(() => {
  // Inicializamos o som de notificação - o usuário deve garantir esse arquivo /public/sounds/notification.mp3
  notificationSound = new Audio('/sounds/notification.mp3');
  
  setupFocusListeners();
  setupRealtimeChatNotifications();
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', () => { isWindowFocused.value = true; });
    window.removeEventListener('blur', () => { isWindowFocused.value = false; });
  }
  if (chatChannel) {
    supabase.removeChannel(chatChannel);
  }
});

/**
 * ================= Layout: Default =================
 * Layout principal que mantém a Sidebar persistente.
 * ===============================================
 */
</script>

<style scoped>
/* Firefox */
.hover-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s;
}

.hover-scrollbar:hover {
  scrollbar-color: #cbd5e1 transparent;
}

/* Webkit (Chrome, Edge, Safari) */
.hover-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.hover-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.hover-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 20px;
}

.hover-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
}
</style>
