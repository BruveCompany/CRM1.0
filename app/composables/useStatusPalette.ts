/**
 * ======================================================
 * useStatusPalette.ts
 * Paleta de cores "Moderno e Sutil" para status de
 * agendamentos. Fonte única da verdade para cores no
 * frontend — independente do que está no banco.
 *
 * Design: fundo muito claro + texto escuro correspondente
 * Garante legibilidade WCAG AA em todos os contexts.
 * ======================================================
 */

export interface StatusPaletteEntry {
    /** Fundo pastel suave (card do calendário e badge) */
    background: string
    /** Cor do texto escura e legível correspondente */
    text: string
    /** Cor accent sólida (faixa lateral, bordas) */
    accent: string
}

/**
 * Mapa de status → par de cores.
 * Chave: nome normalizado (minúsculas, sem acentos).
 *
 * Paleta "Moderno e Sutil" — alta legibilidade, baixa
 * agressividade visual.
 */
const PALETA: Record<string, StatusPaletteEntry> = {
    'pendente': {
        background: '#FEFCE8',
        text: '#A16207',
        accent: '#CA8A04'
    },
    'confirmado': {
        background: '#F0FDF4',
        text: '#15803D',
        accent: '#16A34A'
    },
    'cancelado': {
        background: '#FEF2F2',
        text: '#B91C1C',
        accent: '#DC2626'
    },
    'concluido': {
        background: '#EFF6FF',
        text: '#1E40AF',
        accent: '#2563EB'
    },
    'nao compareceu': {
        background: '#FFF7ED',
        text: '#C2410C',
        accent: '#EA580C'
    }
}

/** Paleta padrão para status desconhecidos */
const PALETA_DEFAULT: StatusPaletteEntry = {
    background: '#F1F5F9',
    text: '#334155',
    accent: '#475569'
}

/**
 * Normaliza o nome do status para usar como chave do mapa.
 * Remove acentos e converte para minúsculas.
 */
function normalizarNome(nome: string | null | undefined): string {
    if (!nome) return ''
    return nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacríticos (acentos)
        .trim()
}

/**
 * Retorna o par de cores (fundo + texto + accent) para um
 * status pelo nome. Sempre tem fallback seguro.
 *
 * @example
 * const p = getPaletteByName('Pendente')
 * // → { background: '#FFFBEB', text: '#B45309', accent: '#D97706' }
 */
export function getPaletteByName(nome: string | null | undefined): StatusPaletteEntry {
    const key = normalizarNome(nome)
    return PALETA[key] ?? PALETA_DEFAULT
}

/**
 * Composable para uso em componentes Vue.
 */
export function useStatusPalette() {
    return {
        getPaletteByName,
        paleta: PALETA,
        paletaDefault: PALETA_DEFAULT
    }
}
