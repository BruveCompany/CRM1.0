<template>
  <UiCard title="Dados do Lead" icon="heroicons:identification" padding>
    <div class="space-y-1">
      <LeadPropertyRow label="Telefone" :value="lead.telefone" />
      <LeadPropertyRow label="E-mail" :value="lead.email" />
      <LeadPropertyRow label="Origem" :value="lead.origem" />
      <LeadPropertyRow label="Interesse" :value="lead.interesse" />
      <LeadPropertyRow label="Empresa/Cargo" :value="lead.empresa" />
      <LeadPropertyRow label="Dono do Lead" :value="lead.vendedor_nome" />
    </div>

    <template #header-action>
      <button class="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">Ver tudo</button>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  lead: any;
}>();
</script>
