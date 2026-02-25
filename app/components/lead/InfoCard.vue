<template>
  <UiCard title="Dados do Lead" icon="heroicons:identification" padding>
    <div class="space-y-1">
      <LeadPropertyRow label="Telefone" :value="lead.telefone" />
      <LeadPropertyRow label="E-mail" :value="lead.email" />
      <LeadPropertyRow label="Origem" :value="lead.origem" />
      <LeadPropertyRow label="Interesse" :value="lead.interesse" />
      <LeadPropertyRow label="Empresa/Cargo" :value="lead.empresa" />
      <LeadPropertyRow label="Dono do Lead" :value="lead.vendedor_nome" />

      <!-- Novos campos estratégicos -->
      <LeadPropertyRow
        v-if="lead.valor_estimado"
        label="Valor Estimado"
        :value="formatCurrency(lead.valor_estimado)"
      />
      <LeadPropertyRow
        v-if="lead.setor_atuacao"
        label="Setor"
        :value="lead.setor_atuacao"
      />
      <LeadPropertyRow
        v-if="lead.principal_desafio"
        label="Principal Desafio"
        :value="lead.principal_desafio"
      />

      <!-- Produtos de Interesse (jsonb -> array de tags) -->
      <div v-if="produtosTags.length" class="flex flex-col gap-1 py-1">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produtos</span>
        <div class="flex flex-wrap gap-1.5 mt-0.5">
          <span
            v-for="tag in produtosTags"
            :key="tag"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <template #header-action>
      <button class="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">Ver tudo</button>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  lead: any;
}>();

// Converte jsonb (array ou string) → array de tags
const produtosTags = computed<string[]>(() => {
  const p = props.lead?.produtos_interesse;
  if (!p) return [];
  if (Array.isArray(p)) return p.filter(Boolean);
  return String(p).split(',').map((t: string) => t.trim()).filter(Boolean);
});

// Formata número como moeda BRL
const formatCurrency = (value: number | null) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
</script>
