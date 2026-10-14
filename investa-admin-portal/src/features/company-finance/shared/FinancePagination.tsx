/**
 * Shared `admin-table-footer` pagination used by finance list pages.
 * Visual differences between pages are preserved through optional
 * class-name props (Review passes its richer button styles,
 * MoneyIn relies on the plainer defaults).
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface FinancePaginationProps {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizes: readonly number[];
  /** e.g. `t('companyFinance.moneyIn.showing', { from, to, total })` */
  showingText: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectClassName?: string;
  navButtonClassName?: string;
  pageLabelClassName?: string;
}

export const FinancePagination: React.FC<FinancePaginationProps> = ({
  page,
  pageCount,
  pageSize,
  pageSizes,
  showingText,
  onPageChange,
  onPageSizeChange,
  selectClassName,
  navButtonClassName,
  pageLabelClassName,
}) => (
  <footer className="admin-table-footer flex items-center justify-between border-t px-3 py-2.5 text-sm">
    <span dir="ltr">{showingText}</span>
    <div className="flex items-center gap-2">
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className={selectClassName}
      >
        {pageSizes.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={navButtonClassName}
      >
        <ChevronLeft size={16} />
      </button>
      <span dir="ltr" className={pageLabelClassName}>
        {page}/{pageCount}
      </span>
      <button
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
        className={navButtonClassName}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </footer>
);
