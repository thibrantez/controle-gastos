// Tipos e constantes sem dependências Node.js — seguros para importar em client components

export interface Gasto {
  id: number
  data: string        // DD/MM/YYYY
  descricao: string
  categoria: string
  valor: number
  formaPagamento: string
}

export const CATEGORIAS = [
  'Alimentos',
  'Mercado',
  'Lazer',
  'Namorada',
  'Jogos',
  'Trabalho',
  'Investimento',
  'Transporte',
  'Saúde',
  'Outros',
] as const

export const FORMAS_PAGAMENTO = [
  'Cartão de Crédito',
  'Débito',
  'Vale Refeição',
  'Pix',
  'Dinheiro',
] as const

export const MESES_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export function mesLabel(mesAno: string): string {
  const [m, y] = mesAno.split('/')
  return `${MESES_PT[parseInt(m) - 1]}/${y.slice(2)}`
}
