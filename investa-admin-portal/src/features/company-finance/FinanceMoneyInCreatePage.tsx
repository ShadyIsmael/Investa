import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { CreateFinanceTransactionRequest, FinanceAccount, FinanceCategory, FinanceSupplier } from './types';
import { FinancePermissionDenied } from './CompanyFinanceStates';

const MONEY_INPUT = /^\d*(?:\.\d{0,2})?$/;

const todayLocal = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const normalizeMoneyInput = (value: string) => {
  const normalized = value.replace(/,/g, '');
  return MONEY_INPUT.test(normalized) ? normalized : null;
};

const formatMoney = (value: string) => {
  if (!value) return '';
  const [whole, fraction] = value.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-US');
  return fraction === undefined ? `${grouped}.00` : `${grouped}.${fraction}`;
};

export type LocalizedFinanceSupplier = FinanceSupplier & {
  nameAr?: string | null;
  nameEn?: string | null;
};

const supplierPrimaryLabel = (supplier: LocalizedFinanceSupplier, isArabic: boolean) =>
  (isArabic ? supplier.nameAr : supplier.nameEn)
  || (isArabic ? supplier.nameEn : supplier.nameAr)
  || supplier.name
  || supplier.legalName
  || supplier.supplierCode
  || '';

const supplierSecondaryLabel = (supplier: LocalizedFinanceSupplier, primaryLabel: string) => {
  if (supplier.legalName && supplier.legalName !== primaryLabel) return supplier.legalName;
  if (supplier.supplierCode && supplier.supplierCode !== primaryLabel) return supplier.supplierCode;
  return '';
};

interface SupplierComboboxProps {
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

export const FinanceMoneyInCreatePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const isEdit = Boolean(transactionId);
  const { hasAnyPermission } = usePermissions();
  const canAccess = isEdit ? hasAnyPermission('Finance.EditDraft') : hasAnyPermission('Finance.Create');
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [suppliers, setSuppliers] = useState<FinanceSupplier[]>([]);
  const [incomingType, setIncomingType] = useState('CompanyRevenue');
  const [transactionDate, setTransactionDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [incomeCategoryId, setIncomeCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const isArabic = i18n.language === 'ar';
  const key = (name: string) => t(`companyFinance.moneyInCreate.${name}`);

  useEffect(() => {
    void companyFinanceService
      .getAccounts()
      .then((items) => setAccounts(items.filter((item) => item.isActive)));
  }, []);

  useEffect(() => {
    if (!transactionId) return;
    void companyFinanceService.getTransaction(Number(transactionId)).then((transaction) => {
      setIncomingType(transaction.transactionType === 'InternalTransfer' ? 'InternalTransfer' : transaction.incomingMoneyType || 'CompanyRevenue');
      setTransactionDate(transaction.transactionDate.slice(0, 10));
      setDescription(transaction.description || '');
      setAmount(String(transaction.amount));
      setCurrency(transaction.currency || 'EGP');
      setDestinationAccountId(transaction.destinationAccountId ? String(transaction.destinationAccountId) : '');
      setSourceAccountId(transaction.sourceAccountId ? String(transaction.sourceAccountId) : '');
      setSupplierId(transaction.supplierId ? String(transaction.supplierId) : '');
      setSourceName(transaction.sourceName || '');
      setIncomeCategoryId(transaction.incomeCategoryId ? String(transaction.incomeCategoryId) : '');
      setPaymentMethod(transaction.paymentMethod || '');
    }).catch(() => setSaveError(t('companyFinance.moneyInCreate.saveError')));
  }, [transactionId, t]);

  useEffect(() => {
    void companyFinanceService
      .getIncomeCategories()
      .then((items) => setCategories(items.filter((item) => item.isActive)));
  }, []);

  useEffect(() => {
    void companyFinanceService
      .getSuppliers()
      .then((items) => setSuppliers(items.filter((item) => item.isActive)));
  }, []);

  const categoryName = (category: FinanceCategory) =>
    isArabic
      ? category.nameAr || category.nameEn || category.name
      : category.nameEn || category.name || category.nameAr;
  const fieldClass = 'mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground';
  const isCompanyRevenue = incomingType === 'CompanyRevenue';
  const isSupplierRefund = incomingType === 'SupplierRefund';
  const isInternalTransfer = incomingType === 'InternalTransfer';
  const canSaveDraft = ['CompanyRevenue', 'CapitalContribution', 'FounderLoan', 'SupplierRefund', 'InternalTransfer'].includes(incomingType);
  const localToday = todayLocal();
  const validationMessage = (name: string) => t(`companyFinance.moneyInCreate.validation.${name}`);

  const setFieldError = (field: string, error = '') => {
    setFieldErrors((current) => {
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
    return error;
  };

  const validateField = (field: string) => {
    if (field === 'transactionDate') {
      return setFieldError(field, !transactionDate || transactionDate > localToday
        ? validationMessage('date') : '');
    }
    if (field === 'description') {
      const value = description.trim();
      return setFieldError(field, !value
        ? validationMessage('required')
        : value.length > 1000 ? validationMessage('descriptionLength') : '');
    }
    if (field === 'amount') {
      return setFieldError(field, !amount || Number(amount) <= 0
        ? validationMessage('amount') : '');
    }
    if (field === 'destinationAccountId' || field === 'sourceAccountId') {
      const value = field === 'destinationAccountId' ? destinationAccountId : sourceAccountId;
      const error = !value ? validationMessage('required') : '';
      if (isInternalTransfer && !error && sourceAccountId && destinationAccountId && sourceAccountId === destinationAccountId) {
        return setFieldError(field, validationMessage('accountsDifferent'));
      }
      return setFieldError(field, error);
    }
    if (field === 'incomeCategoryId' && isCompanyRevenue) {
      return setFieldError(field, !incomeCategoryId ? validationMessage('required') : '');
    }
    if (field === 'supplierId' && isSupplierRefund) {
      return setFieldError(field, !supplierId ? validationMessage('required') : '');
    }
    if (field === 'sourceName' && (isCompanyRevenue || isSupplierRefund)) {
      const value = sourceName.trim();
      return setFieldError(field, !value && isCompanyRevenue
        ? validationMessage('required')
        : value.length > 200 ? validationMessage('sourceNameLength') : '');
    }
    return '';
  };

  const changeIncomingType = (nextType: string) => {
    setIncomingType(nextType);
    setFieldErrors({});
    setSaveError('');
    setSourceName('');
    setIncomeCategoryId('');
    setPaymentMethod('');
    setSupplierId('');
    setSourceAccountId('');
  };

  const saveDraft = async () => {
    if (isSaving || !canSaveDraft) return;

    const parsedAmount = Number(amount);
    const fields = ['transactionDate', 'description', 'amount'];
    
    if (isCompanyRevenue) {
      fields.push('destinationAccountId', 'sourceName', 'incomeCategoryId');
    } else if (isSupplierRefund) {
      fields.push('destinationAccountId', 'supplierId');
    } else if (isInternalTransfer) {
      fields.push('sourceAccountId', 'destinationAccountId');
    }
    
    const invalidFields = fields.filter((field) => Boolean(validateField(field)));

    if (
      invalidFields.length > 0 ||
      !Number.isFinite(parsedAmount)
    ) {
      setSaveError('');
      fieldRefs.current[invalidFields[0]]?.focus();
      setValidationError(validationMessage('summary'));
      return;
    }

    const commonPayload: CreateFinanceTransactionRequest = {
      transactionType: isInternalTransfer ? 'InternalTransfer' : 'MoneyIn',
      incomingMoneyType: incomingType,
      transactionDate,
      description: description.trim(),
      amount: parsedAmount,
      currency,
    };
    
    let payload: CreateFinanceTransactionRequest;
    
    if (isCompanyRevenue) {
      payload = {
        ...commonPayload,
        destinationAccountId: Number(destinationAccountId),
        sourceName: sourceName.trim(),
        incomeCategoryId: Number(incomeCategoryId),
        ...(paymentMethod.trim() ? { paymentMethod: paymentMethod.trim() } : {}),
      };
    } else if (isSupplierRefund) {
      payload = {
        ...commonPayload,
        destinationAccountId: Number(destinationAccountId),
        supplierId: Number(supplierId),
        ...(sourceName.trim() ? { sourceName: sourceName.trim() } : {}),
        ...(paymentMethod.trim() ? { paymentMethod: paymentMethod.trim() } : {}),
      };
    } else if (isInternalTransfer) {
      payload = {
        ...commonPayload,
        sourceAccountId: Number(sourceAccountId),
        destinationAccountId: Number(destinationAccountId),
      };
    } else {
      payload = {
        ...commonPayload,
        destinationAccountId: Number(destinationAccountId),
      };
    }

    setValidationError('');
    setSaveError('');
    setIsSaving(true);
    try {
      if (transactionId) {
        const { transactionType: _transactionType, ...updatePayload } = payload;
        await companyFinanceService.updateTransaction(Number(transactionId), updatePayload);
      } else {
        await companyFinanceService.createTransaction(payload);
      }
      navigate('/admin/company-finance/money-in');
    } catch (error) {
      if (transactionId) {
        setSaveError(t('companyFinance.workflow.actionError'));
        return;
      }
      const message = error instanceof Error ? error.message.replace(/^POST failed:\s*/i, '') : '';
      setSaveError(
        message ||
          (t('companyFinance.moneyInCreate.saveError')),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!canAccess) return <FinancePermissionDenied />;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between dark:border-slate-700">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => navigate('/company-finance/money-in')} className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={key('back')}>
            <ArrowLeft size={17} className={isArabic ? 'rotate-180' : ''} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEdit ? t('companyFinance.workflow.editMoneyInTitle') : key('title')}</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{isEdit ? t('companyFinance.workflow.editSubtitle') : key('subtitle')}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => navigate('/company-finance/money-in')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600">
            {key('cancel')}
          </button>
          <button type="submit" form="money-in-create-form" disabled={!canSaveDraft || isSaving} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900">
            {isSaving ? (t('companyFinance.moneyInCreate.saving')) : isEdit ? t('companyFinance.workflow.saveChanges') : key('saveDraft')}
          </button>
        </div>
      </header>

      <form id="money-in-create-form" noValidate onSubmit={(event) => { event.preventDefault(); void saveDraft(); }} className="w-full">
        {(validationError || saveError) && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
            {validationError || saveError}
          </div>
        )}
        <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          <section className="py-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('companyFinance.moneyInCreate.sectionTransaction')}</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('companyFinance.moneyInCreate.sectionTransactionHint')}</p>
            </div>
            <div className="grid gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {key('transactionDate')} <span className="text-rose-600">*</span>
              <input ref={(element) => { fieldRefs.current.transactionDate = element; }} type="date" max={localToday} value={transactionDate} onChange={(event) => { setTransactionDate(event.target.value); if (event.target.value <= localToday) setFieldError('transactionDate'); }} onBlur={() => validateField('transactionDate')} className={fieldClass} dir="ltr" />
              {fieldErrors.transactionDate && <p className="mt-1 text-xs text-rose-600">{fieldErrors.transactionDate}</p>}
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {key('incomingType')}
              <select value={incomingType} onChange={(event) => changeIncomingType(event.target.value)} className={fieldClass}>
              <option value="CompanyRevenue">{key('companyRevenue')}</option>
              <option value="CapitalContribution">{key('capitalContribution')}</option>
              <option value="FounderLoan">{key('founderLoan')}</option>
              <option value="SupplierRefund">{key('supplierRefund')}</option>
              <option value="InternalTransfer">{key('internalTransfer')}</option>
              </select>
              {!canSaveDraft && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('companyFinance.moneyInCreate.typeDisabled')}
              </p>
              )}
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2 xl:col-span-3">
              {key('description')} <span className="text-rose-600">*</span>
              <textarea ref={(element) => { fieldRefs.current.description = element; }} rows={3} maxLength={1000} value={description} onChange={(event) => { setDescription(event.target.value); if (event.target.value.trim()) setFieldError('description'); }} onBlur={() => { setDescription((value) => value.trim()); validateField('description'); }} className={fieldClass} />
              {fieldErrors.description && <p className="mt-1 text-xs text-rose-600">{fieldErrors.description}</p>}
              </label>
            </div>
          </section>

          <section className="py-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('companyFinance.moneyInCreate.sectionAmountAccount')}</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('companyFinance.moneyInCreate.sectionAmountAccountHint')}</p>
            </div>
            <div className="grid grid-flow-row-dense gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,0.75fr)_minmax(0,1.4fr)]">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {key('amount')} <span className="text-rose-600">*</span>
              <input ref={(element) => { fieldRefs.current.amount = element; }} type="text" inputMode="decimal" value={isAmountFocused ? amount : formatMoney(amount)} onFocus={() => setIsAmountFocused(true)} onBlur={() => { setIsAmountFocused(false); validateField('amount'); }} onChange={(event) => { const next = normalizeMoneyInput(event.target.value); if (next !== null) { setAmount(next); if (next && Number(next) > 0) setFieldError('amount'); } }} onKeyDown={(event) => { if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault(); }} className={fieldClass} dir="ltr" />
              {fieldErrors.amount && <p className="mt-1 text-xs text-rose-600">{fieldErrors.amount}</p>}
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {key('currency')} <span className="text-rose-600">*</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={fieldClass} dir="ltr"><option value="EGP">EGP</option></select>
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {key('destinationAccount')} <span className="text-rose-600">*</span>
              <select ref={(element) => { fieldRefs.current.destinationAccountId = element; }} value={destinationAccountId} onChange={(event) => { setDestinationAccountId(event.target.value); if (event.target.value) setFieldError('destinationAccountId'); }} onBlur={() => validateField('destinationAccountId')} className={fieldClass}>
              <option value="">{key('selectAccount')}</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
              {fieldErrors.destinationAccountId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.destinationAccountId}</p>}
              </label>
              {isInternalTransfer && (
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2 xl:col-span-3">
              {key('sourceAccount')} <span className="text-rose-600">*</span>
              <select ref={(element) => { fieldRefs.current.sourceAccountId = element; }} value={sourceAccountId} onChange={(event) => { setSourceAccountId(event.target.value); if (event.target.value) setFieldError('sourceAccountId'); }} onBlur={() => validateField('sourceAccountId')} className={fieldClass}>
              <option value="">{key('selectAccount')}</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
              {fieldErrors.sourceAccountId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.sourceAccountId}</p>}
              </label>
              )}
            </div>
          </section>

          {(isCompanyRevenue || isSupplierRefund) && (
            <section className="py-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('companyFinance.moneyInCreate.sectionSource')}</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('companyFinance.moneyInCreate.sectionSourceHint')}</p>
              </div>
              <div className="grid grid-flow-row-dense gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)]">
                {isSupplierRefund && (
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-2 xl:col-span-2">
                  <label htmlFor="supplier-combobox">{key('supplier')} <span className="text-rose-600">*</span></label>
                  <SupplierCombobox
                  suppliers={suppliers as LocalizedFinanceSupplier[]}
                  value={supplierId}
                  onChange={(nextValue) => { setSupplierId(nextValue); if (nextValue) setFieldError('supplierId'); }}
                  onBlur={() => validateField('supplierId')}
                  inputRef={(element) => { fieldRefs.current.supplierId = element; if (element) element.id = 'supplier-combobox'; }}
                  isArabic={isArabic}
                  placeholder={t('companyFinance.moneyInCreate.supplierSearchPlaceholder')}
                  emptyText={t('companyFinance.moneyInCreate.noSuppliersFound')}
                  clearLabel={t('companyFinance.moneyInCreate.clearSupplier')}
                  invalid={Boolean(fieldErrors.supplierId)}
                  />
                  {fieldErrors.supplierId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.supplierId}</p>}
                  </div>
                )}
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {key('sourceName')}{isCompanyRevenue && ' '}<span className={isCompanyRevenue ? 'text-rose-600' : ''}>{isCompanyRevenue ? '*' : ''}</span>
                <input ref={(element) => { fieldRefs.current.sourceName = element; }} maxLength={200} value={sourceName} onChange={(event) => { setSourceName(event.target.value); if (event.target.value.trim()) setFieldError('sourceName'); }} onBlur={() => { setSourceName((value) => value.trim()); validateField('sourceName'); }} className={fieldClass} />
                {fieldErrors.sourceName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.sourceName}</p>}
                </label>
                {isCompanyRevenue && (
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {key('incomeCategory')} <span className="text-rose-600">*</span>
                <select ref={(element) => { fieldRefs.current.incomeCategoryId = element; }} value={incomeCategoryId} onChange={(event) => { setIncomeCategoryId(event.target.value); if (event.target.value) setFieldError('incomeCategoryId'); }} onBlur={() => validateField('incomeCategoryId')} className={fieldClass}>
                <option value="">{key('selectCategory')}</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{categoryName(category)}</option>)}
                </select>
                {fieldErrors.incomeCategoryId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.incomeCategoryId}</p>}
                </label>
                )}
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {key('paymentMethod')}
                <input value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={fieldClass} />
                </label>
              </div>
            </section>
          )}
        </div>
      </form>
    </div>
  );
};
