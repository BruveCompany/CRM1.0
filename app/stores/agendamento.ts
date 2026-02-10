import { defineStore } from 'pinia'
import type { Agendamento } from '../../shared/types/Agendamento'

/**
 * ================= Store de Agendamentos =================
 * Gerencia o estado global relacionado aos agendamentos
 * 
 * Estado:
 * - dataReferencia: Data de referência para cálculo da semana
 * - agendamentos: Lista de agendamentos
 * 
 * ⚠️ DADOS DE TESTE - TEMPORÁRIO
 * Agendamentos atualmente são mockados (hardcoded)
 * TODO: Implementar integração com banco de dados Supabase
 * 
 * Getters:
 * - diasSemana: Array com os 7 dias da semana atual (Domingo a Sábado)
 * 
 * Actions:
 * - avancarSemana(): Navega para a próxima semana (+7 dias)
 * - voltarSemana(): Navega para a semana anterior (-7 dias)
 * - getAgendamentosDoDia(): Retorna agendamentos de uma data específica
 * ==========================================================
 */
export const useAgendamentoStore = defineStore('agendamento', () => {
  /**
   * Estado: Data de referência para navegação
   * Inicializada com a data/hora atual
   */
  const dataReferencia = ref(new Date())

  /**
   * ⚠️ AGENDAMENTOS MOCKADOS - DADOS DE TESTE
   * 
   * Esta lista contém agendamentos hardcoded para desenvolvimento
   * Distribuídos entre 08/02/2026 e 14/02/2026 (semana atual de teste)
   * 
   * TODO: Substituir por:
   * - Tabela 'ag_agendamentos' no Supabase
   * - Fetch dinâmico baseado na semana visualizada
   * - CRUD completo (criar, editar, deletar agendamentos)
   */
  const agendamentos = ref<Agendamento[]>([
    // Domingo 08/02/2026
    {
      id: 1,
      titulo: 'Consulta João Silva',
      descricao: 'Avaliação inicial',
      inicio: new Date(2026, 1, 8, 9, 0),
      fim: new Date(2026, 1, 8, 10, 0),
      clienteNome: 'João Silva'
    },
    {
      id: 2,
      titulo: 'Retorno Maria Santos',
      descricao: 'Acompanhamento',
      inicio: new Date(2026, 1, 8, 14, 0),
      fim: new Date(2026, 1, 8, 15, 30),
      clienteNome: 'Maria Santos'
    },
    // Segunda 09/02/2026
    {
      id: 3,
      titulo: 'Pedro Costa',
      descricao: 'Primeira consulta',
      inicio: new Date(2026, 1, 9, 8, 0),
      fim: new Date(2026, 1, 9, 9, 0),
      clienteNome: 'Pedro Costa'
    },
    {
      id: 4,
      titulo: 'Ana Oliveira',
      descricao: 'Procedimento especial',
      inicio: new Date(2026, 1, 9, 10, 30),
      fim: new Date(2026, 1, 9, 12, 0),
      clienteNome: 'Ana Oliveira'
    },
    {
      id: 5,
      titulo: 'Carlos Lima',
      descricao: 'Retorno',
      inicio: new Date(2026, 1, 9, 15, 0),
      fim: new Date(2026, 1, 9, 16, 0),
      clienteNome: 'Carlos Lima'
    },
    // Terça 10/02/2026
    {
      id: 6,
      titulo: 'Juliana Rocha',
      descricao: 'Consulta de rotina',
      inicio: new Date(2026, 1, 10, 9, 0),
      fim: new Date(2026, 1, 10, 10, 0),
      clienteNome: 'Juliana Rocha'
    },
    {
      id: 7,
      titulo: 'Roberto Souza',
      descricao: 'Avaliação',
      inicio: new Date(2026, 1, 10, 11, 0),
      fim: new Date(2026, 1, 10, 12, 30),
      clienteNome: 'Roberto Souza'
    },
    {
      id: 8,
      titulo: 'Fernanda Alves',
      descricao: 'Tratamento',
      inicio: new Date(2026, 1, 10, 16, 0),
      fim: new Date(2026, 1, 10, 17, 0),
      clienteNome: 'Fernanda Alves'
    },
    // Quarta 11/02/2026
    {
      id: 9,
      titulo: 'Lucas Pereira',
      descricao: 'Consulta inicial',
      inicio: new Date(2026, 1, 11, 8, 30),
      fim: new Date(2026, 1, 11, 9, 30),
      clienteNome: 'Lucas Pereira'
    },
    {
      id: 10,
      titulo: 'Beatriz Martins',
      descricao: 'Acompanhamento mensal',
      inicio: new Date(2026, 1, 11, 13, 0),
      fim: new Date(2026, 1, 11, 14, 0),
      clienteNome: 'Beatriz Martins'
    },
    {
      id: 11,
      titulo: 'Gabriel Santos',
      descricao: 'Procedimento',
      inicio: new Date(2026, 1, 11, 17, 0),
      fim: new Date(2026, 1, 11, 18, 30),
      clienteNome: 'Gabriel Santos'
    },
    // Quinta 12/02/2026
    {
      id: 12,
      titulo: 'Patrícia Lima',
      descricao: 'Retorno pós-procedimento',
      inicio: new Date(2026, 1, 12, 9, 0),
      fim: new Date(2026, 1, 12, 10, 0),
      clienteNome: 'Patrícia Lima'
    },
    {
      id: 13,
      titulo: 'Ricardo Fernandes',
      descricao: 'Consulta de emergência',
      inicio: new Date(2026, 1, 12, 12, 0),
      fim: new Date(2026, 1, 12, 13, 0),
      clienteNome: 'Ricardo Fernandes'
    },
    {
      id: 14,
      titulo: 'Amanda Costa',
      descricao: 'Avaliação completa',
      inicio: new Date(2026, 1, 12, 14, 30),
      fim: new Date(2026, 1, 12, 16, 0),
      clienteNome: 'Amanda Costa'
    },
    // Sexta 13/02/2026
    {
      id: 15,
      titulo: 'Thiago Oliveira',
      descricao: 'Primeira consulta',
      inicio: new Date(2026, 1, 13, 8, 0),
      fim: new Date(2026, 1, 13, 9, 0),
      clienteNome: 'Thiago Oliveira'
    },
    {
      id: 16,
      titulo: 'Camila Ribeiro',
      descricao: 'Retorno',
      inicio: new Date(2026, 1, 13, 10, 0),
      fim: new Date(2026, 1, 13, 11, 0),
      clienteNome: 'Camila Ribeiro'
    },
    {
      id: 17,
      titulo: 'Felipe Araújo',
      descricao: 'Tratamento',
      inicio: new Date(2026, 1, 13, 15, 0),
      fim: new Date(2026, 1, 13, 16, 30),
      clienteNome: 'Felipe Araújo'
    },
    // Sábado 14/02/2026
    {
      id: 18,
      titulo: 'Larissa Mendes',
      descricao: 'Consulta especial',
      inicio: new Date(2026, 1, 14, 9, 0),
      fim: new Date(2026, 1, 14, 10, 30),
      clienteNome: 'Larissa Mendes'
    },
    {
      id: 19,
      titulo: 'Bruno Carvalho',
      descricao: 'Avaliação final',
      inicio: new Date(2026, 1, 14, 11, 0),
      fim: new Date(2026, 1, 14, 12, 0),
      clienteNome: 'Bruno Carvalho'
    },
    {
      id: 20,
      titulo: 'Isabela Gomes',
      descricao: 'Acompanhamento',
      inicio: new Date(2026, 1, 14, 14, 0),
      fim: new Date(2026, 1, 14, 15, 0),
      clienteNome: 'Isabela Gomes'
    }
  ])

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

  /**
   * Action: Retorna agendamentos de um dia específico
   * Compara apenas a data (dia/mês/ano), ignorando horário
   */
  function getAgendamentosDoDia(data: Date): Agendamento[] {
    return agendamentos.value.filter((ag: Agendamento) => {
      const agData = new Date(ag.inicio)
      return (
        agData.getDate() === data.getDate() &&
        agData.getMonth() === data.getMonth() &&
        agData.getFullYear() === data.getFullYear()
      )
    })
  }

  // Exporta o estado e ações da store
  return {
    dataReferencia,
    diasSemana,
    agendamentos,
    avancarSemana,
    voltarSemana,
    getAgendamentosDoDia
  }
})
