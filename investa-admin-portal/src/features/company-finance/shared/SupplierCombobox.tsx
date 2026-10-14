/**
 * Supplier combobox shared by MoneyIn and MoneyOut create pages.
 * Moved verbatim from FinanceMoneyInCreatePage (it was already
 * imported by FinanceMoneyOutCreatePage from there).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { FinanceSupplier } from '../types';

export type LocalizedFinanceSupplier = FinanceSupplier & {
  nameAr?: string | null;
  nameEn?: string | null;
};

export const supplierPrimaryLabel = (supplier: LocalizedFinanceSupplier, isArabic: boolean) =>
  (isArabic ? supplier.nameAr : supplier.nameEn)
  || (isArabic ? supplier.nameEn : supplier.nameAr)
  || supplier.name
  || supplier.legalName
  || supplier.supplierCode
  || '';

export const supplierSecondaryLabel = (supplier: LocalizedFinanceSupplier, primaryLabel: string) => {
  if (supplier.legalName && supplier.legalName !== primaryLabel) return supplier.legalName;
  if (supplier.supplierCode && supplier.supplierCode !== primaryLabel) return supplier.supplierCode;
  return '';
};

export interface SupplierComboboxProps {
  suppliers: LocalizedFinanceSupplier[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: (element: HTMLInputElement | null) => void;
  isArabic: boolean;
  placeholder: string;
  emptyText: string;
  clearLabel: string;
  invalid: boolean;
}

export const SupplierCombobox: React.FC<SupplierComboboxProps> = ({
  suppliers,
  value,
  onChange,
  onBlur,
  inputRef,
  isArabic,
  placeholder,
  emptyText,
  clearLabel,
  invalid,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const localInputRef = useRef<HTMLInputElement | null>(null);
  const selectedSupplier = suppliers.find((supplier) => String(supplier.id) === value);
  const selectedLabel = selectedSupplier ? supplierPrimaryLabel(selectedSupplier, isArabic) : '';
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (!normalizedQuery) return true;
    return [supplier.nameAr, supplier.nameEn, supplier.name, supplier.legalName, supplier.supplierCode]
      .filter((item): item is string => Boolean(item))
      .some((item) => item.toLocaleLowerCase().includes(normalizedQuery));
  });

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const selectSupplier = (supplier: LocalizedFinanceSupplier) => {
    const label = supplierPrimaryLabel(supplier, isArabic);
    onChange(String(supplier.id));
    setQuery(label);
    setIsOpen(false);
    localInputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative mt-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
          onBlur();
        }
      }}
    >
      <div className={`flex min-h-10 items-center rounded-lg border bg-card transition focus-within:ring-2 focus-within:ring-primary/15 ${invalid ? 'border-rose-500' : 'border-border focus-within:border-primary'}`}>
        <Search size={16} className="ms-3 shrink-0 text-slate-400" />
        <input
          ref={(element) => {
            localInputRef.current = element;
            inputRef(element);
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="supplier-combobox-options"
          aria-activedescendant={isOpen && filteredSuppliers[activeIndex] ? `supplier-option-${filteredSuppliers[activeIndex].id}` : undefined}
          aria-invalid={invalid}
          value={isOpen ? query : selectedLabel}
          placeholder={placeholder}
          onFocus={(event) => {
            setQuery(selectedLabel);
            setIsOpen(true);
            event.currentTarget.select();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setQuery(selectedLabel);
              setIsOpen(false);
              return;
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              if (!isOpen) setIsOpen(true);
              if (filteredSuppliers.length) {
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                setActiveIndex((current) => (current + direction + filteredSuppliers.length) % filteredSuppliers.length);
              }
              return;
            }
            if (event.key === 'Enter' && isOpen && filteredSuppliers[activeIndex]) {
              event.preventDefault();
              selectSupplier(filteredSuppliers[activeIndex]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-slate-400"
        />
        {value && (
          <button
            type="button"
            aria-label={clearLabel}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange('');
              setQuery('');
              setIsOpen(true);
              localInputRef.current?.focus();
            }}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={15} />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          aria-label={placeholder}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setQuery(isOpen ? selectedLabel : '');
            setIsOpen((current) => !current);
            localInputRef.current?.focus();
          }}
          className="me-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {isOpen && (
        <div id="supplier-combobox-options" role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {filteredSuppliers.length ? filteredSuppliers.map((supplier, index) => {
            const primaryLabel = supplierPrimaryLabel(supplier, isArabic);
            const secondaryLabel = supplierSecondaryLabel(supplier, primaryLabel);
            const isSelected = String(supplier.id) === value;
            return (
              <button
                id={`supplier-option-${supplier.id}`}
                key={supplier.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSupplier(supplier)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-start ${index === activeIndex ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{primaryLabel}</span>
                  {secondaryLabel && <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400" dir="auto">{secondaryLabel}</span>}
                </span>
                {isSelected && <Check size={16} className="shrink-0 text-primary" />}
              </button>
            );
          }) : <p className="px-3 py-5 text-center text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>}
        </div>
      )}
    </div>
  );
};
