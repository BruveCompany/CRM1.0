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
          <MenuItems class="absolute bottom-full left-0 mb-2 w-56 origin-bottom-left divide-y divide-neutral-100 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-neutral-100">
            <div class="px-1 py-1 max-h-60 overflow-y-auto custom-scrollbar">
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
                    active ? 'bg-primary-50 text-primary-700' : 'text-neutral-700',
                    'group flex w-full items-center rounded-xl px-3 py-2.5 text-xs transition-colors'
                  ]"
                >
                  <span class="font-bold text-primary-500 mr-2 min-w-[30px]">/{{ item.atalho }}</span>
                  <span class="truncate">{{ item.conteudo }}</span>
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
const respostas = ref<any[]>([]);
const loading = ref(true);

const fetchRespostas = async () => {
  try {
    const userStore = useUserStore();
    const profileId = userStore.profile?.id;

    let query = (supabase.from('ag_respostas_rapidas') as any).select('atalho, conteudo');
    
    if (profileId) {
      query = query.eq('profissional_id', profileId);
    }

    const { data, error } = await query.order('atalho');

    if (error) throw error;
    respostas.value = data || [];
  } catch (err) {
    console.error('Erro ao buscar respostas rápidas:', err);
  } finally {
    loading.value = false;
  }
};

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
