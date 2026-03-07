<template>
  <div class="p-2 space-y-1">
    <div v-if="loadingConversations" class="space-y-2 p-2 animate-pulse">
      <div v-for="i in 5" :key="i" class="h-14 bg-neutral-100 rounded-xl"></div>
    </div>
    
    <button 
      v-for="conversa in sortedConversations" 
      :key="conversa.id"
      @click="$emit('select', conversa)"
      @contextmenu.prevent="openContextMenu($event, conversa)"
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
        <h3 class="font-semibold text-sm text-neutral-800 truncate mb-0.5 tracking-tight">
          {{ conversa.lead?.nome || conversa.cliente?.nome || 'Contato sem nome' }}
        </h3>
        <p class="text-xs text-neutral-400 truncate pr-2 font-normal">
          {{ conversa.ultima_mensagem || 'Atendimento iniciado' }}
        </p>
      </div>

      <!-- Lado Direito: Horários e Badges -->
      <div class="flex flex-col items-end justify-between self-stretch py-0.5">
        <span class="text-[10px] text-neutral-400 font-medium whitespace-nowrap">
          {{ formatTime(conversa.ultima_mensagem_em) }}
        </span>
        
        <div class="flex items-center gap-1.5">
          <Icon v-if="conversa.favorita" name="heroicons:star-solid" class="w-3.5 h-3.5 text-amber-400 drop-shadow-sm" />
          <div v-if="conversa.nao_lidas > 0" class="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-semibold">
            {{ conversa.nao_lidas }}
          </div>
        </div>
      </div>
    </button>

    <!-- Context Menu Flutuante -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="contextMenu.show"
          class="fixed z-[9999] bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] filter drop-shadow-md py-2 min-w-[230px] border border-neutral-100"
          :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
        >
          <!-- Arquivar conversa (Apenas Front) -->
          <button @click="closeContextMenu" class="flex items-center gap-4 w-full px-5 py-2.5 hover:bg-[#F5F6F6] text-left">
             <Icon name="lucide:archive-x" class="w-[20px] h-[20px] text-[#54656F]" />
             <span class="text-[14.5px] text-[#3b4a54] font-medium font-sans">Arquivar conversa</span>
          </button>
          
          <!-- Marcar como lida/não lida -->
          <button @click="toggleReadStatus" class="flex items-center gap-4 w-full px-5 py-2.5 hover:bg-[#F5F6F6] text-left">
             <Icon name="lucide:mail" class="w-[20px] h-[20px] text-[#54656F]" />
             <span class="text-[14.5px] text-[#3b4a54] font-medium font-sans">
                {{ contextMenu.conversa?.nao_lidas > 0 ? 'Marcar como lida' : 'Marcar como não lida' }}
             </span>
          </button>

          <!-- Favoritos -->
          <button @click="toggleFavorite" class="flex items-center gap-4 w-full px-5 py-2.5 hover:bg-[#F5F6F6] text-left">
             <Icon :name="contextMenu.conversa?.favorita ? 'lucide:heart-off' : 'lucide:heart'" class="w-[20px] h-[20px] text-[#54656F]" />
             <span class="text-[14.5px] text-[#3b4a54] font-medium font-sans">
               {{ contextMenu.conversa?.favorita ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos' }}
             </span>
          </button>

          <hr class="border-neutral-100 my-1 mx-3" />

          <!-- Apagar conversa -->
          <button @click="deleteConversation" class="flex items-center gap-4 w-full px-5 py-2.5 hover:bg-[#F5F6F6] text-left">
             <Icon name="lucide:trash-2" class="w-[20px] h-[20px] text-[#54656F]" />
             <span class="text-[14.5px] text-[#3b4a54] font-medium font-sans">Apagar conversa</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';

const props = defineProps<{ 
  activeId: number | null;
  searchQuery?: string;
  activeFilter?: string;
}>();
const emit = defineEmits(['select']);

const supabase = useSupabaseClient();
const { onlineUsers: socketOnlineUsers } = usePresence(); // CRM Prime
const { waitForProfile } = useAuth();
const conversations = ref<any[]>([]);
const loadingConversations = ref(true);

// Estado do Context Menu
const contextMenu = ref<{ show: boolean, x: number, y: number, conversa: any | null }>({
  show: false,
  x: 0,
  y: 0,
  conversa: null
});

// Abertura do Menu Direito
const openContextMenu = (e: MouseEvent, conversa: any) => {
  e.preventDefault();
  // Evitar overflow da janela calculando tamanho basico do menu (altura ~220px, largura ~230px)
  let posX = e.clientX;
  let posY = e.clientY;
  
  if (posY + 220 > window.innerHeight) {
    posY = posY - 220; // abre pra cima se estourar a tela
  }
  
  contextMenu.value = {
    show: true,
    x: posX,
    y: posY,
    conversa
  };
};

const closeContextMenu = () => {
  if (contextMenu.value.show) {
    contextMenu.value.show = false;
  }
};

// Listeners p/ fechar menu ao clicar por fora
onMounted(() => {
  window.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  window.removeEventListener('click', closeContextMenu);
});

// Ações do Menu de Contexto
const toggleReadStatus = async () => {
  if (!contextMenu.value.conversa) return;
  const targetId = contextMenu.value.conversa.id;
  const readVal = contextMenu.value.conversa.nao_lidas > 0 ? 0 : 1; 

  // Optimistic UI
  contextMenu.value.conversa.nao_lidas = readVal; 

  const { error } = await (supabase.from('ag_conversas') as any).update({ nao_lidas: readVal }).eq('id', targetId);
  closeContextMenu();
};

const toggleFavorite = async () => {
  if (!contextMenu.value.conversa) return;
  const targetId = contextMenu.value.conversa.id;
  const curFav = !!contextMenu.value.conversa.favorita;
  
  // Optimistic UI
  contextMenu.value.conversa.favorita = !curFav;

  const { error } = await (supabase.from('ag_conversas') as any).update({ favorita: !curFav }).eq('id', targetId);
  closeContextMenu();
};

const deleteConversation = async () => {
  if (!contextMenu.value.conversa) return;
  if (!confirm('Deseja realmente apagar esta conversa e todo o seu histórico?\nEssa ação não pode ser desfeita.')) {
     closeContextMenu();
     return;
  }
  
  const targetId = contextMenu.value.conversa.id;

  // Primeiro remove as mensagens linkadas para evitar erro FK, se existir restrição 
  await (supabase.from('ag_chat') as any).delete().eq('conversa_id', targetId);
  
  // Então deleta a conversa mae
  await (supabase.from('ag_conversas') as any).delete().eq('id', targetId);
  
  // Se for o char ativo, reseta a prop selection alertando o parent
  if (props.activeId === targetId) {
    // Para simplificar a hierarquia, nao emitir select vazio (necessitaria logica no page) 
    // O realtime cuidará de remover do v-for
  }

  closeContextMenu();
};

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
  let list = [...conversations.value];
  
  // Filtro de Busca por texto (Nome)
  if (props.searchQuery) {
    const q = props.searchQuery.toLowerCase();
    list = list.filter(c => {
      const name = (c.lead?.nome || c.cliente?.nome || '').toLowerCase();
      return name.includes(q);
    });
  }

  // Filtro por botões
  if (props.activeFilter === 'nao_lidas') {
    list = list.filter(c => c.nao_lidas > 0);
  } else if (props.activeFilter === 'favoritas') {
    // Se não existir a prop `favorita` na tabela, isso filtrará pra zero até ser implementado no backend
    list = list.filter(c => c.favorita === true);
  }

  return list.sort((a, b) => 
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
