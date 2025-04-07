
import { format, formatDistance, formatRelative, isDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format currency in BRL
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format date in Brazilian format
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = isDate(date) ? date : new Date(date);
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

// Format date with time
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = isDate(date) ? date : new Date(date);
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

// Format relative time (e.g. "há 2 dias")
export const formatRelativeTime = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = isDate(date) ? date : new Date(date);
  return formatDistance(dateObj, new Date(), { 
    locale: ptBR,
    addSuffix: true 
  });
};

// Format month name
export const formatMonth = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: ptBR });
};

// Get month short name
export const getMonthShortName = (date: Date): string => {
  return format(date, 'MMM', { locale: ptBR });
};

// Get weekday name
export const getWeekdayName = (date: Date): string => {
  return format(date, 'EEEE', { locale: ptBR });
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Format number with thousands separator
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Format date for input fields (yyyy-MM-dd)
export const formatDateForInput = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = isDate(date) ? date : new Date(date);
  return format(dateObj, 'yyyy-MM-dd');
};

// Parse date from input format
export const parseDateFromInput = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Parse currency string to number
export const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
};

// Format currency without currency symbol
export const formatCurrencyRaw = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
