
/**
 * Formatadores para diferentes tipos de dados
 */

/**
 * Formata um número como moeda brasileira (R$)
 * @param value Valor a ser formatado
 * @returns String formatada como moeda
 */
export function formatCurrency(value: number | string): string {
  // Converte para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Retorna zero formatado se não for um número válido
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
}

/**
 * Converte uma string de moeda em número
 * @param value String formatada como moeda (ex: "R$ 1.234,56")
 * @returns Valor numérico
 */
export function parseCurrency(value: string): number {
  // Remove qualquer caractere que não seja número ou vírgula/ponto
  const sanitized = value.replace(/[^\d,.-]/g, '');
  
  // Substitui vírgula por ponto para interpretação correta do parseFloat
  const normalized = sanitized.replace(',', '.');
  
  // Converte para número
  return parseFloat(normalized) || 0;
}

/**
 * Hook para usar em campos de entrada de moeda
 * @param value Valor inicial
 * @param onChange Função de callback para mudanças
 * @returns Props para o componente Input
 */
export function useCurrencyInput(
  value: number,
  onChange: (value: number) => void
) {
  return {
    value: formatCurrency(value),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseCurrency(e.target.value);
      onChange(newValue);
    },
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      // Seleciona todo o texto quando o campo recebe foco
      e.target.select();
    }
  };
}

/**
 * Formata uma data como string no formato brasileiro
 * @param date Data a ser formatada
 * @returns String formatada como data
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formata uma data e hora como string no formato brasileiro
 * @param date Data e hora a ser formatada
 * @returns String formatada como data e hora
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata um número como porcentagem
 * @param value Valor a ser formatado
 * @param decimals Número de casas decimais
 * @returns String formatada como porcentagem
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
