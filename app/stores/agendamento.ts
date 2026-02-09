import { defineStore } from 'pinia'

/**
 * ================= Store de Agendamentos =================
 * Gerencia o estado global relacionado aos agendamentos
 * 
 * Estado:
 * - dataReferencia: Data de referência para cálculo da semana
 * 
 * Getters:
 * - diasSemana: Array com os 7 dias da semana atual (Domingo a Sábado)
 * 
 * Actions:
 * - avancarSemana(): Navega para a próxima semana (+7 dias)
 * - voltarSemana(): Navega para a semana anterior (-7 dias)
 * ==========================================================
 */
export const useAgendamentoStore = defineStore('agendamento', () => {
  /**
   * Estado: Data de referência para navegação
   * Inicializada com a data/hora atual
   */
  const dataReferencia = ref(new Date())

  /**
   * Getter: Calcula os 7 dias da semana com base na data de referência
   * Retorna array de objetos Date começando sempre no Domingo
   * 
   * Exemplo: Se dataReferencia = 09/02/2026 (Segunda)
   * Retorna: [08/02 (Dom), 09/02 (Seg), ..., 14/02 (Sáb)]
   */
  const diasSemana = computed(() => {
    const ref = new Date(dataReferencia.value)
    const currentDay = ref.getDay() // 0 (Domingo) a 6 (Sábado)
    
    // Calcular o domingo da semana atual (início da semana)
    const startOfWeek = new Date(ref)
    startOfWeek.setDate(ref.getDate() - currentDay)
    
    // Criar array com os 7 dias da semana
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  })

  /**
   * Action: Avança para a próxima semana
   * Adiciona 7 dias à data de referência
   */
  function avancarSemana() {
    const novaData = new Date(dataReferencia.value)
    novaData.setDate(novaData.getDate() + 7)
    dataReferencia.value = novaData
  }

  /**
   * Action: Volta para a semana anterior
   * Subtrai 7 dias da data de referência
   */
  function voltarSemana() {
    const novaData = new Date(dataReferencia.value)
    novaData.setDate(novaData.getDate() - 7)
    dataReferencia.value = novaData
  }

  // Exporta o estado e ações da store
  return {
    dataReferencia,
    diasSemana,
    avancarSemana,
    voltarSemana
  }
})
