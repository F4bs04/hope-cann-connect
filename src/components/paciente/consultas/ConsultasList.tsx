import React from 'react';
import { ConsultaCard } from './ConsultaCard';
import { ConsultasEmpty } from './ConsultasEmpty';
import { Loader2 } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';

interface ConsultasListProps {
  consultas: any[];
  loading: boolean;
  error?: string | null;
  onReagendar: (id: string) => void;
  onCancelar: (id: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}


export function ConsultasList({ consultas, loading, error, onReagendar, onCancelar, page, totalPages, onPageChange }: ConsultasListProps) {
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-hopecann-teal" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-8 p-4 border border-destructive/20 rounded-lg">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (consultas.length === 0) {
    return <ConsultasEmpty />;
  }

  const currentPage = page ?? 1;
  const total = totalPages ?? 1;

  const makePages = () => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(total - 1, currentPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (currentPage < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  const pagesArr = makePages();

  return (
    <div className="space-y-4">
      {consultas.map(consulta => (
        <ConsultaCard
          key={consulta.id}
          consulta={consulta}
          onReagendar={onReagendar}
          onCancelar={onCancelar}
        />
      ))}

      {total > 1 && onPageChange && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                href="#"
              />
            </PaginationItem>

            {pagesArr.map((p, idx) => (
              <PaginationItem key={idx}>
                {p === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={p === currentPage}
                    onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
                    href="#"
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < total && onPageChange(currentPage + 1)}
                aria-disabled={currentPage >= total}
                className={currentPage >= total ? 'pointer-events-none opacity-50' : ''}
                href="#"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
