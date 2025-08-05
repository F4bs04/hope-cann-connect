/**
 * Utility functions for formatting data across the application
 */

/**
 * Formats a monetary value to Brazilian Real currency format
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "R$ 150,00")
 */
export const formatCurrency = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'A definir';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats a date to Brazilian format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "15/03/2024")
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
};

/**
 * Formats a CPF to the standard Brazilian format
 * @param cpf - CPF string with or without formatting
 * @returns Formatted CPF string (e.g., "123.456.789-00")
 */
export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return cpf;
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formats a phone number to Brazilian format
 * @param phone - Phone number string
 * @returns Formatted phone string
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

// Legacy aliases for backward compatibility
export const formatarCPF = formatCPF;
export const formatTelefone = formatPhone;
export const formatarDataParaDisplay = formatDate;