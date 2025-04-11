
import React, { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrencyRaw } from '@/lib/locale';

interface CurrencyInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    // Format number as Brazilian currency (with comma as decimal separator)
    const formatCurrency = (num: number): string => {
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    // Track formatted display value separately from actual numeric value
    const [displayValue, setDisplayValue] = useState(() => {
      if (value) {
        return formatCurrency(Number(value));
      }
      return '';
    });

    // Parse formatted string back to number
    const parseFormattedValue = (formatted: string): number => {
      // Replace all non-digit and non-comma characters and convert comma to dot for JS parsing
      const cleanValue = formatted.replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(cleanValue) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Only allow digits and commas
      inputValue = inputValue.replace(/[^\d,]/g, '');
      
      // Ensure only one comma
      const commaIndex = inputValue.indexOf(',');
      if (commaIndex !== -1) {
        const beforeComma = inputValue.substring(0, commaIndex);
        let afterComma = inputValue.substring(commaIndex + 1);
        
        // Limit to 2 decimal places
        if (afterComma.length > 2) {
          afterComma = afterComma.substring(0, 2);
        }
        
        inputValue = beforeComma + ',' + afterComma;
      }
      
      setDisplayValue(inputValue);
      
      // Pass numeric value to parent
      if (onValueChange) {
        onValueChange(parseFormattedValue(inputValue));
      }
    };

    // When input loses focus, format the number properly
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (displayValue) {
        const numericValue = parseFormattedValue(displayValue);
        setDisplayValue(formatCurrency(numericValue));
      }
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <Input
        className={cn('text-right', className)}
        onChange={handleChange}
        onBlur={handleBlur}
        value={displayValue}
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
