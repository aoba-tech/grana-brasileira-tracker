
import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/locale';

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
          ? parseFloat(defaultValue) || 0 
          : typeof defaultValue === 'number' 
            ? defaultValue 
            : 0;
      }
      if (value !== undefined) {
        initialValue = typeof value === 'string' 
          ? parseFloat(value) || 0 
          : typeof value === 'number' 
            ? value 
            : 0;
      }
      
      internalValueRef.current = initialValue;
      setDisplayValue(formatCurrency(initialValue));
    }, [value, defaultValue]);

    const parseCurrency = (value: string): number => {
      return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      // Remove all non-numeric characters except commas
      input = input.replace(/[^\d,]/g, '');
      
      // Ensure only one comma
      const commaCount = (input.match(/,/g) || []).length;
      if (commaCount > 1) {
        const lastCommaIndex = input.lastIndexOf(',');
        input = input.substring(0, lastCommaIndex) + input.substring(lastCommaIndex).replace(/,/g, '');
      }
      
      const numericValue = parseCurrency(input);
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
      const strippedValue = internalValueRef.current.toString().replace('.', ',');
      setDisplayValue(strippedValue === '0' ? '' : strippedValue);
      // Place cursor at the end
      e.target.setSelectionRange(displayValue.length, displayValue.length);
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
