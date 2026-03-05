<template>
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden text-neutral-900 leading-normal font-sans">
    <!-- Header -->
    <div class="p-6 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
      <div>
        <h2 class="text-xl font-bold text-neutral-900">Minhas Respostas Rápidas</h2>
        <p class="text-sm text-neutral-500 mt-1">Gerencie atalhos para agilizar seus atendimentos no chat.</p>
      </div>
      <BaseButton variant="primary" size="sm" class="gap-2" @click="handleNew">
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Adicionar Nova
      </BaseButton>
    </div>

    <!-- Tabela / Lista -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-neutral-50/50 border-y border-neutral-100">
            <th class="px-6 py-4 text-[11px] font-bold text-neutral-500 uppercase tracking-widest w-64">Atalho</th>
            <th class="px-6 py-4 text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Conteúdo</th>
            <th class="px-6 py-4 text-[11px] font-bold text-neutral-500 uppercase tracking-widest text-right w-32">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-if="loading" v-for="i in 3" :key="'skeleton-'+i" class="animate-pulse">
            <td class="px-6 py-4"><div class="h-4 bg-neutral-100 rounded w-20"></div></td>
            <td class="px-6 py-4"><div class="h-4 bg-neutral-100 rounded w-full"></div></td>
            <td class="px-6 py-4"></td>
          </tr>
          
          <tr v-else-if="respostas.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-neutral-400 italic">
              Nenhuma resposta rápida cadastrada. Clique em "Adicionar Nova" para começar.
            </td>
          </tr>

          <tr v-for="row in respostas" :key="row.id" class="hover:bg-neutral-50/40 transition-colors group text-neutral-700">
            <td class="px-6 py-4 w-64 align-top">
              <span class="inline-block font-mono text-primary-600 font-bold bg-primary-50 px-2.5 py-1 rounded-lg text-[13px] transition-colors hover:bg-primary-100 border border-primary-100">
                /{{ row.atalho }}
              </span>
            </td>
            <td class="px-6 py-4 align-top">
              <p class="text-[13px] text-neutral-600 line-clamp-2 max-w-3xl leading-relaxed">
                {{ row.conteudo }}
              </p>
            </td>
            <td class="px-6 py-4 text-right align-top w-32">
              <div class="flex items-start justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  @click="handleEdit(row)"
                  class="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                  title="Editar"
                >
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                </button>
                <button 
                  @click="handleDelete(row)"
                  class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Excluir"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modais -->
    <ModalRespostaRapida 
      v-model="isModalOpen"
      :resposta-editando="editingItem"
      @success="fetchRespostas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/user';
import BaseButton from '~/components/BaseButton.vue';
import ModalRespostaRapida from './ModalRespostaRapida.vue';

const supabase = useSupabaseClient();
const userStore = useUserStore();

const { waitForProfile } = useAuth();

// Estado reativo da lista e carregamento
const respostas = ref<any[]>([]);
const loading = ref(true);

// Controle do Modal
const isModalOpen = ref(false);
const editingItem = ref<any | null>(null);

/**
 * Busca a lista de respostas rápidas do profissional no Supabase.
 * Filtra pelo ID do perfil no estado global (Store).
 */
const fetchRespostas = async () => {
  loading.value = true;
  try {
    // 1. ESPERA PELO PERFIL (GARANTIA DATABASE SYNC)
    const profile = await waitForProfile();
    const profileId = profile?.id;
    
    if (!profileId) {
      console.warn('[TEMPLATES] Perfil não identificado no tempo limite.');
      return;
    }

    const performFetch = async (retryCount = 0): Promise<any[]> => {
      // Busca ordenada por atalho para facilitar localização visual
      const { data, error } = await (supabase
        .from('ag_respostas_rapidas') as any)
        .select('*')
        .eq('profissional_id', profileId)
        .order('atalho');

      if (error) throw error;

      return data || [];
    };

    respostas.value = await performFetch();
  } catch (err) {
    console.error('Erro ao buscar respostas:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * Abre o modal para criar um novo registro.
 */
const handleNew = () => {
  editingItem.value = null;
  isModalOpen.value = true;
};

/**
 * Abre o modal para editar um registro existente.
 * @param item Objeto da resposta rápida selecionada.
 */
const handleEdit = (item: any) => {
  editingItem.value = item;
  isModalOpen.value = true;
};

/**
 * Remove uma resposta rápida após confirmação do usuário.
 * Realiza o DELETE no banco de dados e atualiza a interface local.
 * @param item Objeto da resposta rápida a ser excluída.
 */
const handleDelete = async (item: any) => {
  if (!confirm(`Tem certeza que deseja excluir o atalho "/${item.atalho}"?`)) return;

  try {
    // Executa exclusão no Supabase
    const { error } = await (supabase
      .from('ag_respostas_rapidas') as any)
      .delete()
      .eq('id', item.id);

    if (error) throw error;
    
    // Filtra a lista local para remover o item sem recarregar tudo do banco
    respostas.value = respostas.value.filter(r => r.id !== item.id);
  } catch (err: any) {
    console.error('Erro ao excluir:', err);
    alert('Erro ao excluir: ' + (err.message || 'Erro desconhecido'));
  }
};

// Carga inicial dos dados
onMounted(() => {
  if (userStore.profile?.id) {
    fetchRespostas();
  }
});

// Assiste mudanças no perfil (importante se o perfil for carregado após o mount)
watch(() => userStore.profile?.id, (newId) => {
  if (newId) {
    fetchRespostas();
  }
}, { immediate: true });
</script>
