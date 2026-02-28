<template>
  <div class="relative inline-block text-left">
    <div v-if="loading" class="p-3 text-neutral-400">
      <Icon name="svg-spinners:18-dots-indicator" class="w-5 h-5" />
    </div>
    <div v-else>
      <Menu as="div" class="relative inline-block text-left">
        <MenuButton 
          class="p-2.5 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all group flex items-center gap-1"
          title="Respostas Rápidas"
        >
          <Icon name="heroicons:bolt" class="w-5 h-5" />
        </MenuButton>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems class="absolute bottom-full left-0 mb-2 w-96 origin-bottom-left divide-y divide-neutral-100 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-neutral-100">
            <div class="px-1 py-1 max-h-80 overflow-y-auto custom-scrollbar">
              <div v-if="respostas.length === 0" class="px-3 py-4 text-center ">
                <p class="text-xs text-neutral-400">Nenhuma resposta rápida cadastrada.</p>
              </div>
              <MenuItem 
                v-for="item in respostas" 
                :key="item.atalho" 
                v-slot="{ active }"
              >
                <button
                  @click="$emit('select', item.conteudo)"
                  :class="[
                    active ? 'bg-primary-50' : '',
                    'group flex w-full flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-colors border-b border-neutral-50 last:border-none'
                  ]"
                >
                  <span class="font-mono font-bold text-primary-600 text-[10px] uppercase tracking-wider">
                    /{{ item.atalho }}
                  </span>
                  <span class="text-neutral-600 text-xs line-clamp-2">
                    {{ item.conteudo }}
                  </span>
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import { useUserStore } from '~/stores/user';

const emit = defineEmits(['select']);
const supabase = useSupabaseClient();

// Estado da lista e controle de carregamento
const respostas = ref<any[]>([]);
const loading = ref(true);

/**
 * Busca Respostas Rápidas personalizadas do profissional logado.
 * Os dados são filtrados pelo ID do perfil no Supabase.
 */
const fetchRespostas = async () => {
  try {
    const userStore = useUserStore();
    const profileId = userStore.profile?.id;

    // Constrói a query básica
    let query = (supabase.from('ag_respostas_rapidas') as any).select('atalho, conteudo');
    
    // Aplica filtro se o usuário estiver autenticado e com perfil carregado
    if (profileId) {
      query = query.eq('profissional_id', profileId);
    }

    // Executa busca ordenada por atalho
    const { data, error } = await query.order('atalho');

    if (error) throw error;
    respostas.value = data || [];
  } catch (err) {
    console.error('Erro ao buscar respostas rápidas:', err);
  } finally {
    loading.value = false;
  }
};

// Carrega as respostas assim que o componente é montado
onMounted(() => {
  fetchRespostas();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
