import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrency, parseCurrencyToNumber } from '@/lib/locale';

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
      setDisplayValue(initialValue.toString().replace('.', ','));
    }, [value, defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
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
      
      // Display the value without currency symbol
      setDisplayValue(input);
      
      // Parse to number for storing
      const numericValue = parseCurrencyToNumber(input);
      internalValueRef.current = numericValue;
      
      // Call the onValueChange callback with the numeric value
      if (onValueChange) {
        onValueChange(numericValue);
      }
    };

    const handleBlur = () => {
      // On blur, ensure the value is properly formatted with comma as decimal separator
      // but don't add currency symbol
      const value = internalValueRef.current;
      const formattedValue = value.toString().replace('.', ',');
      
      // If there's no decimal part, add it
      if (!formattedValue.includes(',')) {
        setDisplayValue(`${formattedValue},00`);
      } else {
        // Ensure proper decimal places
        const [whole, decimal] = formattedValue.split(',');
        if (decimal.length === 1) {
          setDisplayValue(`${whole},${decimal}0`);
        } else {
          setDisplayValue(formattedValue);
        }
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Do nothing special on focus, keep the current display value
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
