/**
 * Composable para gerenciamento de tarefas
 */
export const useTarefas = () => {
    const supabase = useSupabaseClient()

    /**
     * IA, por favor, crie uma função assíncrona e exportada chamada "getProximasTarefas".
     * Esta função deve:
     * 1. Aceitar dois parâmetros: "profissionalId" (number) e "limite" (number, com valor padrão 5).
     * 2. Retornar um array vazio e logar um erro se "profissionalId" não for fornecido.
     * 3. Usar o cliente Supabase para fazer uma consulta na tabela "ag_tarefas".
     * 4. A consulta deve selecionar as colunas: "id", "titulo", "descricao", "data_vencimento", e também fazer um join para buscar o "nome" da tabela "ag_leads", renomeando o resultado para "lead".
     * 5. A consulta deve aplicar 3 filtros (where):
     *    - Onde "profissional_id" é igual ao parâmetro "profissionalId".
     *    - Onde a coluna "concluida" é "false".
     *    - Onde "data_vencimento" é maior ou igual a data e hora atual.
     * 6. A consulta deve ordenar os resultados por "data_vencimento" em ordem ascendente.
     * 7. A consulta deve limitar o número de resultados usando o parâmetro "limite".
     * 8. Se houver um erro na chamada ao Supabase, ele deve ser logado no console e a função deve retornar um array vazio.
     * 9. Se a chamada for bem-sucedida, deve retornar o array de dados.
     */
    const getProximasTarefas = async (profissionalId: number | string, limite: number = 5) => {
        // 2. Retornar um array vazio e logar um erro se "profissionalId" não for fornecido.
        if (!profissionalId) {
            console.error('[getProximasTarefas] Erro: profissionalId é obrigatório!');
            return [];
        }

        try {
            // Data e hora atual em formato ISO para comparação no banco
            const agora = new Date().toISOString();

            // 3. Consulta na tabela "ag_tarefas"
            // 4. Seleciona colunas e faz join com "ag_leads"
            const { data, error } = await supabase
                .from('ag_tarefas')
                .select(`
          id, 
          titulo, 
          descricao, 
          data_vencimento, 
          lead:ag_leads(nome)
        `)
                // 5. Filtros sugeridos
                .eq('profissional_id', profissionalId)
                .eq('concluida', false)
                .gte('data_vencimento', agora)
                // 6. Ordenação
                .order('data_vencimento', { ascending: true })
                // 7. Limite
                .limit(limite);

            // 8. Tratamento de erro na chamada
            if (error) {
                console.error('[getProximasTarefas] Erro ao buscar tarefas do Supabase:', error.message);
                return [];
            }

            // 9. Retorno bem-sucedido
            return data || [];

        } catch (err) {
            // 8. Log de erro inesperado
            console.error('[getProximasTarefas] Erro inesperado:', err);
            return [];
        }
    };

    return {
        getProximasTarefas
    }
}
