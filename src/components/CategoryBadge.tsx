
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface CategoryBadgeProps {
  category: {
    name: string;
    color: string;
    icon: string;
  };
  className?: string;
}

const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  // Get icon component from string name
  const IconComponent = (Icons as Record<string, LucideIcon>)[category.icon] || Icons.Tag;

  return (
    <Badge
      className={cn(
        'flex items-center gap-1.5 px-2 py-1',
        className
      )}
      style={{
        backgroundColor: category.color + '20', // Add transparency
        color: category.color,
        borderColor: category.color
      }}
    >
      <IconComponent className="h-3.5 w-3.5" />
      <span>{category.name}</span>
    </Badge>
  );
};

export default CategoryBadge;
