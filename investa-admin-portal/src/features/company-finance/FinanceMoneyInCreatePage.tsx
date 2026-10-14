import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import { defaultIsoCode, getCurrencies, ensureCurrenciesLoaded } from '../../utils/currency';
import type { CreateFinanceTransactionRequest, FinanceAccount, FinanceCategory, FinanceSupplier } from './types';
import { FinancePermissionDenied } from './CompanyFinanceStates';
import { formatMoneyInput, normalizeMoneyInput, todayLocal } from './shared/moneyInput';
import { SupplierCombobox, type LocalizedFinanceSupplier } from './shared/SupplierCombobox';

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
  const [currency, setCurrency] = useState(defaultIsoCode());
  const [currencyOptions, setCurrencyOptions] = useState<string[]>(() => getCurrencies().map((c) => c.isoCode));
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
    void ensureCurrenciesLoaded().then(() => {
      const options = getCurrencies().map((c) => c.isoCode);
      setCurrencyOptions(options);
      setCurrency(current => current || defaultIsoCode());
    });
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
      setCurrency(transaction.currency || defaultIsoCode());
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
          <button type="button" onClick={() => navigate('/company-finance/money-in')} className="btn-secondary">
            {key('cancel')}
          </button>
          <button type="submit" form="money-in-create-form" disabled={!canSaveDraft || isSaving} className="btn-primary">
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
              <input ref={(element) => { fieldRefs.current.amount = element; }} type="text" inputMode="decimal" value={isAmountFocused ? amount : formatMoneyInput(amount)} onFocus={() => setIsAmountFocused(true)} onBlur={() => { setIsAmountFocused(false); validateField('amount'); }} onChange={(event) => { const next = normalizeMoneyInput(event.target.value); if (next !== null) { setAmount(next); if (next && Number(next) > 0) setFieldError('amount'); } }} onKeyDown={(event) => { if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault(); }} className={fieldClass} dir="ltr" />
              {fieldErrors.amount && <p className="mt-1 text-xs text-rose-600">{fieldErrors.amount}</p>}
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {key('currency')} <span className="text-rose-600">*</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={fieldClass} dir="ltr">{currencyOptions.map((code) => <option key={code} value={code}>{code}</option>)}</select>
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
