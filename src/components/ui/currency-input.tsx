
import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { parseCurrencyToNumber } from '@/lib/locale';

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onValueChange, defaultValue, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const internalValueRef = useRef<number>(0);

    // Initialize the display value
    useEffect(() => {
      let initialValue = 0;
      if (defaultValue !== undefined) {
        initialValue = typeof defaultValue === 'string' 
          ? parseCurrencyToNumber(defaultValue) || 0 
          : typeof defaultValue === 'number' 
            ? defaultValue 
            : 0;
      }
      if (value !== undefined) {
        initialValue = typeof value === 'string' 
          ? parseCurrencyToNumber(value) || 0 
          : typeof value === 'number' 
            ? value 
            : 0;
      }
      
      internalValueRef.current = initialValue;
      
      // Format initial value with Brazilian currency format
      setDisplayValue(formatBrazilianCurrency(initialValue));
    }, [value, defaultValue]);

    // Format value as Brazilian currency (R$ 0.000,00)
    const formatBrazilianCurrency = (value: number): string => {
      if (value === 0) return '';
      
      const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      return formatter.format(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      // Remove currency symbol and non-numeric characters except comma
      input = input.replace(/[R$\s.]/g, '');
      
      // Keep only digits and comma
      input = input.replace(/[^\d,]/g, '');
      
      // Handle when user types multiple commas
      if ((input.match(/,/g) || []).length > 1) {
        const parts = input.split(',');
        input = parts[0] + ',' + parts.slice(1).join('');
      }
      
      // Parse to number for storing
      const numericValue = parseCurrencyToNumber(input);
      internalValueRef.current = numericValue;
      
      // Format for display
      if (input === '' || numericValue === 0) {
        setDisplayValue('');
      } else {
        // Only format if we have actual numbers
        if (/\d/.test(input)) {
          // For partial inputs, don't add full formatting yet
          if (input.endsWith(',') || (input.includes(',') && input.split(',')[1].length < 2)) {
            setDisplayValue(`R$ ${input}`);
          } else {
            setDisplayValue(formatBrazilianCurrency(numericValue));
          }
        } else {
          setDisplayValue(input); // Just the input for special cases
        }
      }
      
      // Call the onValueChange callback with the numeric value
      if (onValueChange) {
        onValueChange(numericValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // If the field is empty on focus, show R$ prefix
      if (!displayValue) {
        setDisplayValue('R$ ');
      }
      
      // Set cursor position after the prefix
      setTimeout(() => {
        if (e.target.value === 'R$ ') {
          e.target.setSelectionRange(3, 3);
        }
      }, 0);
    };

    const handleBlur = () => {
      // On blur, ensure proper currency format
      const value = internalValueRef.current;
      
      if (value === 0) {
        setDisplayValue('');
        return;
      }
      
      setDisplayValue(formatBrazilianCurrency(value));
    };

    return (
      <Input
        className={cn('text-right', className)}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type="text"
        inputMode="decimal"
        ref={ref}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
