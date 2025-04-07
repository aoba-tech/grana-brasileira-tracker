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
      
      // Remove all non-numeric characters except commas and dots
      input = input.replace(/[^\d,.]/g, '');
      
      // Replace all dots with empty string (keeping only commas for decimal separator)
      input = input.replace(/\./g, '');
      
      // Ensure only one comma
      const commaCount = (input.match(/,/g) || []).length;
      if (commaCount > 1) {
        const lastCommaIndex = input.lastIndexOf(',');
        input = input.substring(0, lastCommaIndex) + input.substring(lastCommaIndex).replace(/,/g, '');
      }
      
      const numericValue = parseCurrencyToNumber(input);
      internalValueRef.current = numericValue;
      
      // Format and display the value
      setDisplayValue(input ? `R$ ${input}` : '');
      
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
      // On focus, strip the currency symbol and formatting for easier editing
      const strippedValue = formatCurrencyRaw(internalValueRef.current);
      setDisplayValue(strippedValue === '0,00' ? '' : strippedValue);
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
