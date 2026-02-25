<template>
  <Teleport to="body">
    <Transition
      enter-active-class="ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>

        <!-- Modal Panel -->
        <Transition
          appear
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon name="heroicons:outline:adjustments-horizontal" class="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-800">Definição de Metas</h3>
                  <p class="text-[11px] text-slate-500 font-medium">Gerencie as metas mensais da sua equipe</p>
                </div>
              </div>
              <button @click="emit('close')" class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                <Icon name="heroicons:outline:x-mark" class="w-5 h-5" />
              </button>
            </div>

            <div class="p-6">
              <!-- Seletor de Mês -->
              <div class="mb-6 flex items-center gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                <div class="flex flex-col gap-1">
                  <label class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Período de Referência</label>
                  <input 
                    type="month" 
                    v-model="selectedMonth" 
                    @change="fetchMetas"
                    class="bg-white border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none p-2 shadow-sm"
                  />
                </div>
                <p class="text-[11px] text-slate-500 font-medium max-w-[300px]">
                  Selecione o mês para visualizar ou editar as metas dos consultores.
                </p>
              </div>

              <!-- Tabela de Vendedores -->
              <div class="border border-slate-100 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto">
                <table class="w-full text-left">
                  <thead class="sticky top-0 z-10">
                    <tr class="bg-slate-50 border-b border-slate-100">
                      <th class="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Consultor</th>
                      <th class="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase w-32">Meta Conversões</th>
                      <th class="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase w-40 text-right">Meta Valor</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr v-for="vendedor in vendedoresComMetas" :key="vendedor.id" class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                            {{ vendedor.nome.substring(0,2).toUpperCase() }}
                          </div>
                          <span class="text-xs font-semibold text-slate-700">{{ vendedor.nome }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <input 
                          type="number" 
                          v-model.number="vendedor.meta_conversoes"
                          class="w-full bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 p-2 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          placeholder="0"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                          <input 
                            type="number" 
                            v-model.number="vendedor.meta_valor"
                            class="w-full bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 p-2 pl-8 text-right focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="0,00"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-end gap-3">
              <button 
                @click="emit('close')"
                class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                :disabled="loading"
              >
                Cancelar
              </button>
              <button 
                @click="saveMetas"
                :disabled="loading"
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Icon v-if="loading" name="svg-spinners:18-dots-indicator" class="w-4 h-4 text-white" />
                <Icon v-else name="heroicons:outline:check" class="w-4 h-4 text-white" />
                {{ loading ? 'Salvando...' : 'Salvar Metas' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

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
