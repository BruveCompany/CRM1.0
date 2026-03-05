<template>
  <div class="p-2 space-y-1">
    <div v-if="loadingConversations" class="space-y-2 p-2 animate-pulse">
      <div v-for="i in 5" :key="i" class="h-14 bg-neutral-100 rounded-xl"></div>
    </div>
    
    <button 
      v-for="conversa in sortedConversations" 
      :key="conversa.id"
      @click="$emit('select', conversa)"
      class="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left border border-transparent"
      :class="activeId === conversa.id 
        ? 'bg-primary-50 border-primary-100 shadow-sm' 
        : 'hover:bg-neutral-100'
      "
    >
      <!-- Avatar Simulado -->
      <div class="relative flex-shrink-0">
        <div class="w-11 h-11 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500 text-sm overflow-hidden">
          {{ getAvatarLetters(conversa.lead?.nome || conversa.cliente?.nome) }}
        </div>
        <!-- Status Online Realtime (CRM Prime) -->
        <span 
          v-if="isVendedorOnline(conversa.lead?.vendedor_id)" 
          class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"
          title="Online"
        ></span>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start mb-0.5">
          <h3 class="font-bold text-sm text-neutral-900 truncate pr-2">
            {{ conversa.lead?.nome || conversa.cliente?.nome || 'Contato sem nome' }}
          </h3>
          <span class="text-[10px] text-neutral-400 whitespace-nowrap pt-1">
            {{ formatTime(conversa.ultima_mensagem_em) }}
          </span>
        </div>
        <p class="text-xs text-neutral-500 truncate pr-4">
          {{ conversa.ultima_mensagem || 'Atendimento iniciado' }}
        </p>
      </div>

      <!-- Badge Não Lidas -->
      <div v-if="conversa.nao_lidas > 0" class="flex-shrink-0 min-w-[20px] h-5 px-1 bg-primary-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
        {{ conversa.nao_lidas }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';

const props = defineProps<{ activeId: number | null }>();
const emit = defineEmits(['select']);

const supabase = useSupabaseClient();
const { onlineUsers: socketOnlineUsers } = usePresence(); // CRM Prime
const { waitForProfile } = useAuth();
const conversations = ref<any[]>([]);
const loadingConversations = ref(true);

const isVendedorOnline = (vId: number | string | null) => {
  if (!vId) return false;
  return !!socketOnlineUsers.value[String(vId)];
};

const fetchConversations = async () => {
  try {
    // 1. ESPERA PELO PERFIL (GARANTIA RLS NO CHAT)
    await waitForProfile();

    const performFetch = async (retryCount = 0): Promise<any[]> => {
      const { data, error } = await supabase
        .from('ag_conversas')
        .select(`
          *,
          lead:ag_leads (
            id, 
            nome, 
            status,
            score,
            vendedor_id
          ),
          cliente:ag_clientes (
            id, 
            nome, 
            telefone
          )
        `)
        .order('ultima_mensagem_em', { ascending: false });

      if (error) throw error;

      return data || [];
    };

    conversations.value = await performFetch();
  } catch (err) {
    console.error('Erro ao buscar conversas:', err);
  } finally {
    loadingConversations.value = false;
  }
};

const sortedConversations = computed(() => {
  return [...conversations.value].sort((a, b) => 
    new Date(b.ultima_mensagem_em).getTime() - new Date(a.ultima_mensagem_em).getTime()
  );
});

// Realtime listener para atualizar a lista
const subscribeToConversations = () => {
  return (supabase as any)
    .channel('conversas-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_conversas' }, () => {
      fetchConversations();
    })
    .subscribe();
};

const getAvatarLetters = (nome?: string) => {
  if (!nome || !nome.trim()) return '??';
  const parts = nome.trim().split(/\s+/);
  const first = parts[0] ? parts[0].charAt(0) : '';
  const second = parts[1] ? parts[1].charAt(0) : '';
  
  if (first && second) {
    return (first + second).toUpperCase();
  }
  return nome.trim().substring(0, 2).toUpperCase();
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  
  // Se for hoje, mostrar hora. Se não, mostrar data simples.
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const conversationSubscription = ref<any>(null);

onMounted(() => {
  fetchConversations();
  conversationSubscription.value = subscribeToConversations();
});

onUnmounted(() => {
  if (conversationSubscription.value) conversationSubscription.value.unsubscribe();
});

defineExpose({ fetchConversations, sortedConversations });
</script>
