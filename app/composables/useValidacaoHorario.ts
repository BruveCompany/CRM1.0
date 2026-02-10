import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AgAgendamento } from '../../shared/types/database'

/**
 * ================= useValidacaoHorario.ts =================
 * Composable para validação e cálculo de horários disponíveis.
 * 
 * Responsabilidades:
 * - Gerar todos os horários possíveis (08:00–22:00 / 30min)
 * - Filtrar agendamentos do dia selecionado
 * - Calcular horários de INÍCIO disponíveis (sem sobreposição)
 * - Calcular horários de FIM disponíveis (limitado ao próximo agendamento)
 * - Converter hora string → minutos totais
 * 
 * @param dataSelecionada - Ref com a data selecionada (formato YYYY-MM-DD)
 * @param horaInicioSelecionada - Ref com a hora de início selecionada (HH:MM)
 * @param agendamentos - Ref com todos os agendamentos carregados
 * ==========================================================
 */
export function useValidacaoHorario(
  dataSelecionada: Ref<string>,
  horaInicioSelecionada: Ref<string>,
  agendamentos: Ref<AgAgendamento[]>
) {
  /**
   * Converte string de hora ("08:30" ou "08:30:00-03") para minutos totais
   * Ex: "08:30" → 510, "14:00" → 840
   */
  function horaParaMinutos(hora: string): number {
    const partes = hora.split(':')
    return parseInt(partes[0] || '0', 10) * 60 + parseInt(partes[1] || '0', 10)
  }

  /**
   * Gera todos os horários possíveis (08:00 às 22:00 em intervalos de 30min)
   */
  const todosHorarios = computed(() => {
    const horarios: string[] = []
    for (let hora = 8; hora <= 22; hora++) {
      horarios.push(`${String(hora).padStart(2, '0')}:00`)
      if (hora < 22) {
        horarios.push(`${String(hora).padStart(2, '0')}:30`)
      }
    }
    return horarios
  })

  /**
   * Filtra agendamentos existentes para o dia selecionado.
   * Retorna array ordenado por hora_inicio para facilitar cálculos.
   */
  const agendamentosDoDia = computed(() => {
    if (!dataSelecionada.value) return []
    return agendamentos.value
      .filter((ag) => ag.data === dataSelecionada.value)
      .sort((a, b) => horaParaMinutos(a.hora_inicio || '0') - horaParaMinutos(b.hora_inicio || '0'))
  })

  /**
   * Horários de INÍCIO disponíveis.
   * Bloqueia qualquer horário que cai dentro de um agendamento existente.
   * 
   * Regra: um horário H está bloqueado se existe agendamento onde
   * H >= hora_inicio E H < hora_fim (está dentro do período ocupado)
   * 
   * Ex: Agendamento 08:00-10:00 → bloqueia 08:00, 08:30, 09:00, 09:30
   *     10:00 fica livre (é o fim, não sobrepõe)
   */
  const horariosInicioDisponiveis = computed(() => {
    if (!dataSelecionada.value) return todosHorarios.value

    const ocupados = agendamentosDoDia.value

    return todosHorarios.value.filter((horario) => {
      const minutos = horaParaMinutos(horario)
      return !ocupados.some((ag) => {
        const inicioAg = horaParaMinutos(ag.hora_inicio || '0')
        const fimAg = horaParaMinutos(ag.hora_fim || '0')
        return minutos >= inicioAg && minutos < fimAg
      })
    })
  })

  /**
   * Horários de FIM disponíveis.
   * Após selecionar hora de início, limita o fim para:
   * - Ser maior que a hora de início
   * - Não ultrapassar o início do próximo agendamento (evita sobreposição)
   * 
   * Ex: Início = 10:00, próximo agendamento às 14:00
   *     → Fim disponível: 10:30, 11:00, ..., 14:00
   * 
   * Ex: Início = 15:30, sem agendamento depois
   *     → Fim disponível: 16:00, ..., 22:00
   */
  const horariosFimDisponiveis = computed(() => {
    if (!horaInicioSelecionada.value) return []

    const inicioSelecionado = horaParaMinutos(horaInicioSelecionada.value)
    const ocupados = agendamentosDoDia.value

    // Encontra o início do próximo agendamento APÓS o horário selecionado
    let tetoMaximo = horaParaMinutos('22:00')
    for (const ag of ocupados) {
      const inicioAg = horaParaMinutos(ag.hora_inicio || '0')
      if (inicioAg > inicioSelecionado) {
        tetoMaximo = inicioAg
        break
      }
    }

    return todosHorarios.value.filter((horario) => {
      const minutos = horaParaMinutos(horario)
      return minutos > inicioSelecionado && minutos <= tetoMaximo
    })
  })

  return {
    todosHorarios,
    agendamentosDoDia,
    horariosInicioDisponiveis,
    horariosFimDisponiveis,
    horaParaMinutos
  }
}
