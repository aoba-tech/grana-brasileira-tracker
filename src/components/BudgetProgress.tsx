
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/locale';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  category: string;
  spent: number;
  total: number;
  color?: string;
  className?: string;
}

const BudgetProgress = ({
  category,
  spent,
  total,
  color = '#00A86B',
  className,
}: BudgetProgressProps) => {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  
  // Determine the status color based on percentage
  const getStatusColor = () => {
    if (percentage >= 100) return '#E53935'; // Red for over budget
    if (percentage >= 80) return '#FFC107'; // Yellow for warning
    return color; // Default or specified color
  };

  const statusColor = getStatusColor();

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{category}</span>
        <span>
          {formatCurrency(spent)} / {formatCurrency(total)}
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-2"
          style={{ 
            '--progress-background': statusColor + '40', 
            '--progress-foreground': statusColor
          } as React.CSSProperties}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}%</span>
        {percentage > 100 && (
          <span className="text-destructive font-medium">
            +{formatCurrency(spent - total)} acima
          </span>
        )}
      </div>
    </div>
  );
};

export default BudgetProgress;
