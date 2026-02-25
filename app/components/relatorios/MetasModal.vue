<template>
  <BaseModal 
    :model-value="show" 
    @update:modelValue="$emit('close')"
    size="2xl"
  >
    <template #header>
      <div class="flex items-center gap-3 py-1">
        <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <Icon name="heroicons:outline:adjustments-horizontal" class="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 class="text-base font-bold text-neutral-900">Definição de Metas</h3>
          <p class="text-[11px] text-neutral-500 font-medium">Gerencie as metas mensais da sua equipe</p>
        </div>
      </div>
    </template>

    <div class="space-y-6 py-2">
      <!-- Seletor de Mês -->
      <div class="p-4 bg-primary-50/50 rounded-xl border border-primary-100/50 flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Período de Referência</label>
          <input 
            type="month" 
            v-model="selectedMonth" 
            @change="fetchMetas"
            class="bg-white border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none p-2 shadow-sm"
          />
        </div>
        <p class="text-[11px] text-neutral-500 font-medium max-w-[240px] text-right">
          Selecione o mês desejado para atualizar as metas de conversão e faturamento.
        </p>
      </div>

      <!-- Tabela de Vendedores -->
      <div class="border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-neutral-50 border-b border-neutral-100">
              <th class="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase">Consultor</th>
              <th class="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase w-32 text-center">Meta Conv.</th>
              <th class="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase w-40 text-right pr-6">Meta Valor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-50">
            <tr v-for="vendedor in vendedoresComMetas" :key="vendedor.id" class="hover:bg-neutral-50/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500 border border-neutral-200">
                    {{ vendedor.nome.substring(0,2).toUpperCase() }}
                  </div>
                  <span class="text-xs font-semibold text-neutral-700">{{ vendedor.nome }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <input 
                  type="number" 
                  v-model.number="vendedor.meta_conversoes"
                  class="w-full bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 p-2 text-center focus:ring-2 focus:ring-primary-500/20 outline-none"
                  placeholder="0"
                />
              </td>
              <td class="px-4 py-3 pr-6">
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">R$</span>
                  <input 
                    type="number" 
                    v-model.number="vendedor.meta_valor"
                    class="w-full bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 p-2 pl-8 text-right focus:ring-2 focus:ring-primary-500/20 outline-none"
                    placeholder="0,00"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <BaseButton 
        variant="ghost" 
        @click="emit('close')"
        :disabled="loading"
        class="text-neutral-500 hover:text-neutral-700"
      >
        Cancelar
      </BaseButton>
      <BaseButton 
        variant="primary" 
        @click="saveMetas"
        :loading="loading"
        class="px-8"
      >
        Salvar Metas
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
/* Remove a barra de rolagem visualmente mas mantém a funcionalidade caso o conteúdo exceda a tela */
:deep(.overflow-y-auto) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

:deep(.overflow-y-auto::-webkit-scrollbar) {
  display: none; /* Chrome, Safari, Opera */
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '../BaseModal.vue';
import BaseButton from '../BaseButton.vue';

interface VendedorMeta {
  id: number;
  nome: string;
  meta_conversoes: number;
  meta_valor: number;
}

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['close', 'saved']);

const supabase = useSupabaseClient();
const isOpen = ref(props.show);
const loading = ref(false);
const selectedMonth = ref(new Date().toISOString().substring(0, 7)); // Formato YYYY-MM
const vendedoresComMetas = ref<VendedorMeta[]>([]);

// Sincronizar estado local com prop
watch(() => props.show, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    initialize();
  }
});

const closeModal = () => {
  emit('close');
};

const initialize = async () => {
  if (loading.value) return;
  loading.value = true;
  await fetchVendedores();
  await fetchMetas();
  loading.value = false;
};

const fetchVendedores = async () => {
  const { data } = await supabase
    .from('ag_profiles')
    .select('id, nome')
    .order('nome');
  
  if (data) {
    vendedoresComMetas.value = (data as any[]).map(v => ({
      id: v.id,
      nome: v.nome,
      meta_conversoes: 0,
      meta_valor: 0
    }));
  }
};

const fetchMetas = async () => {
  const mesInicio = `${selectedMonth.value}-01`;
  
  const { data } = await supabase
    .from('ag_metas_vendedores')
    .select('*')
    .eq('mes', mesInicio);

  if (data) {
    vendedoresComMetas.value.forEach(v => {
      const meta = (data as any[]).find(m => Number(m.vendedor_id) === Number(v.id));
      if (meta) {
        v.meta_conversoes = meta.meta_conversoes;
        v.meta_valor = meta.meta_valor;
      } else {
        v.meta_conversoes = 0;
        v.meta_valor = 0;
      }
    });
  }
};

const saveMetas = async () => {
  loading.value = true;
  const mesInicio = `${selectedMonth.value}-01`;
  
  try {
    const upsertData = vendedoresComMetas.value.map(v => ({
      vendedor_id: v.id,
      mes: mesInicio,
      meta_conversoes: v.meta_conversoes || 0,
      meta_valor: v.meta_valor || 0
    }));

    const { error } = await (supabase.from('ag_metas_vendedores') as any)
      .upsert(upsertData, { onConflict: 'vendedor_id, mes' });

    if (error) throw error;

    emit('saved');
    closeModal();
  } catch (err) {
    console.error('Erro ao salvar metas:', err);
    alert('Erro ao salvar as metas. Verifique as permissões de admin.');
  } finally {
    loading.value = false;
  }
};
</script>
