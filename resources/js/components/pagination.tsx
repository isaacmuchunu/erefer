import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

type PaginationProps = {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ currentPage, lastPage, onPageChange, className }: PaginationProps) {
  const pages = [];
  for (let i = 1; i <= lastPage; i++) {
    pages.push(i);
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {lastPage > 5 && <MoreHorizontal className="h-4 w-4" />}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}