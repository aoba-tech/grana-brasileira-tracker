import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrency, parseCurrencyToNumber, formatCurrencyRaw } from '@/lib/locale';

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
      setDisplayValue(formatCurrency(initialValue));
    }, [value, defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      // Remove currency symbol and spaces
      input = input.replace(/R\$\s?/g, '');
      
      // Keep only digits, comma and dot
      input = input.replace(/[^\d,.]/g, '');
      
      // Handle when user types a comma or dot
      if ((input.match(/,/g) || []).length > 1) {
        const parts = input.split(',');
        input = parts[0] + ',' + parts.slice(1).join('');
      }
      
      if ((input.match(/\./g) || []).length > 0) {
        // Convert dot to comma (Brazilian format)
        input = input.replace(/\./g, ',');
        
        // Ensure only one comma
        if ((input.match(/,/g) || []).length > 1) {
          const parts = input.split(',');
          input = parts[0] + ',' + parts.slice(1).join('');
        }
      }
      
      // Format for display
      setDisplayValue(input ? `R$ ${input}` : '');
      
      // Parse to number for storing
      const numericValue = parseCurrencyToNumber(input);
      internalValueRef.current = numericValue;
      
      // Call the onValueChange callback with the numeric value
      if (onValueChange) {
        onValueChange(numericValue);
      }
    };

    const handleBlur = () => {
      // Format the value on blur for consistent display
      setDisplayValue(formatCurrency(internalValueRef.current));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // On focus, strip the currency symbol for easier editing
      // But keep the formatted number with comma
      const rawValue = internalValueRef.current === 0 ? '' : formatCurrencyRaw(internalValueRef.current);
      setDisplayValue(rawValue === '0,00' ? '' : rawValue);
      
      // Place cursor at the end
      setTimeout(() => {
        e.target.setSelectionRange(displayValue.length, displayValue.length);
      }, 0);
    };

    return (
      <Input
        className={cn('text-right', className)}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
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
