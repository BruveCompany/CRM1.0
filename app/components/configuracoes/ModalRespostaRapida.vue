<template>
  <BaseModal 
    :modelValue="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="respostaEditando ? 'Editar Resposta Rápida' : 'Nova Resposta Rápida'"
    size="md"
  >
    <form @submit.prevent="handleSave" class="space-y-4">
      <div class="space-y-2">
        <label class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Atalho</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-neutral-400">/</span>
          <input 
            v-model="form.atalho" 
            type="text" 
            required 
            placeholder="ex: boasvindas"
            class="w-full pl-7 pr-4 py-2 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          />
        </div>
        <p class="text-[10px] text-neutral-400 italic">O atalho será usado no chat para localizar a resposta.</p>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Conteúdo</label>
        <textarea 
          v-model="form.conteudo" 
          required 
          rows="4"
          placeholder="Digite a mensagem completa aqui..."
          class="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
        ></textarea>
      </div>

      <div class="flex items-center gap-3 pt-4">
        <BaseButton 
          type="button" 
          variant="secondary" 
          class="flex-1"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </BaseButton>
        <BaseButton 
          type="submit" 
          variant="primary" 
          class="flex-[1.5]"
          :loading="saving"
        >
          {{ respostaEditando ? 'Salvar Alterações' : 'Criar Resposta' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useUserStore } from '~/stores/user';
import BaseModal from '~/components/BaseModal.vue';
import BaseButton from '~/components/BaseButton.vue';

const props = defineProps<{
  modelValue: boolean;
  respostaEditando: any | null;
}>();

const emit = defineEmits(['update:modelValue', 'success']);
const supabase = useSupabaseClient();
const userStore = useUserStore();
const saving = ref(false);

// Estado do formulário local
const form = ref({
  atalho: '',
  conteudo: ''
});

/**
 * Monitora a prop 'respostaEditando'.
 * Quando um item é passado para edição, preenche o formulário.
 * Se for null, limpa o formulário para uma nova criação.
 */
watch(() => props.respostaEditando, (val) => {
  if (val) {
    form.value = { 
      atalho: val.atalho.replace('/', ''), // Remove a barra se existir para evitar duplicação
      conteudo: val.conteudo 
    };
  } else {
    form.value = { atalho: '', conteudo: '' };
  }
}, { immediate: true });

/**
 * Salva ou Atualiza a Resposta Rápida no banco de dados.
 * Valida a existência do perfil do profissional antes da operação.
 */
const handleSave = async () => {
  if (saving.value) return;
  saving.value = true;

  try {
    // Obter ID do profissional logado da store
    const profileId = userStore.profile?.id;
    if (!profileId) throw new Error('Perfil não localizado');

    // Preparar dados para o Supabase
    const payload = {
      atalho: form.value.atalho.trim().toLowerCase(),
      conteudo: form.value.conteudo.trim(),
      profissional_id: profileId
    };

    let error;
    if (props.respostaEditando) {
      // Caso de Edição: Atualiza registro existente por ID
      const { error: err } = await (supabase
        .from('ag_respostas_rapidas') as any)
        .update(payload)
        .eq('id', props.respostaEditando.id);
      error = err;
    } else {
      // Caso de Criação: Insere novo registro
      const { error: err } = await (supabase
        .from('ag_respostas_rapidas') as any)
        .insert(payload);
      error = err;
    }

    if (error) throw error;

    // Notifica sucesso e fecha o modal
    emit('success');
    emit('update:modelValue', false);
  } catch (err: any) {
    console.error('Erro ao salvar resposta:', err);
    alert('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
  } finally {
    saving.value = false;
  }
};
</script>
