import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { CreateFinanceTransactionRequest, FinanceAccount, FinanceCategory, FinanceSupplier } from './types';
import { FinancePermissionDenied } from './CompanyFinanceStates';
import { SupplierCombobox, type LocalizedFinanceSupplier } from './FinanceMoneyInCreatePage';

const MONEY_INPUT = /^\d*(?:\.\d{0,2})?$/;
const RATE_INPUT = /^\d*(?:\.\d{0,6})?$/;

const todayLocal = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const normalizedNumberInput = (value: string, pattern: RegExp) => {
  const normalized = value.replace(/,/g, '');
  return pattern.test(normalized) ? normalized : null;
};

const formatMoney = (value: string) => {
  if (!value) return '';
  const [whole, fraction] = value.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-US');
  return fraction === undefined ? `${grouped}.00` : `${grouped}.${fraction}`;
};

export const FinanceMoneyOutCreatePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const isEdit = Boolean(transactionId);
  const { hasAnyPermission } = usePermissions();
  const canCreate = hasAnyPermission('Finance.Create');
  const canEditDraft = hasAnyPermission('Finance.EditDraft');
  const canAccess = isEdit ? canEditDraft : canCreate;
  const isArabic = i18n.language === 'ar';
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [suppliers, setSuppliers] = useState<FinanceSupplier[]>([]);
  const [transactionDate, setTransactionDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [exchangeRate, setExchangeRate] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isMasterDataLoading, setIsMasterDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const localToday = todayLocal();
  const fieldClass = 'mt-1 min-h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-wait disabled:opacity-60';
  const labelClass = 'block self-start text-sm font-medium text-slate-700 dark:text-slate-300';
  const key = (name: string) => t(`companyFinance.moneyOutCreate.${name}`);
  const validationMessage = (name: string) => t(`companyFinance.moneyOutCreate.validation.${name}`);

  useEffect(() => {
    if (!canAccess) return;
    void Promise.all([
      companyFinanceService.getAccounts(),
      companyFinanceService.getExpenseCategories(),
      companyFinanceService.getSuppliers(),
    ]).then(([accountItems, categoryItems, supplierItems]) => {
      setAccounts(accountItems.filter((item) => item.isActive));
      setCategories(categoryItems.filter((item) => item.isActive));
      setSuppliers(supplierItems.filter((item) => item.isActive));
    }).catch(() => setLoadError(key('loadError')))
      .finally(() => setIsMasterDataLoading(false));
  }, [canAccess, t]);

  useEffect(() => {
    if (!transactionId) return;
    void companyFinanceService.getTransaction(Number(transactionId)).then((transaction) => {
      setTransactionDate(transaction.transactionDate.slice(0, 10));
      setDescription(transaction.description || '');
      setAmount(String(transaction.amount));
      setCurrency(transaction.currency || 'EGP');
      setExchangeRate(transaction.exchangeRate && transaction.exchangeRate !== 1 ? String(transaction.exchangeRate) : '');
      setSourceAccountId(transaction.sourceAccountId ? String(transaction.sourceAccountId) : '');
      setPaymentMethod(transaction.paymentMethod || '');
      setExpenseCategoryId(transaction.expenseCategoryId ? String(transaction.expenseCategoryId) : '');
      setSupplierId(transaction.supplierId ? String(transaction.supplierId) : '');
      setInvoiceNumber(transaction.invoiceNumber || '');
      setExternalReference(transaction.externalReference || '');
      setNotes(transaction.notes || '');
    }).catch(() => setLoadError(key('loadError')));
  }, [transactionId, t]);

  const currencies = useMemo(() => ['EGP', ...new Set(accounts.map((account) => account.currency).filter((value) => value && value !== 'EGP'))], [accounts]);
  const isForeignCurrency = currency !== 'EGP';
  const categoryLabel = (category: FinanceCategory) => isArabic
    ? category.nameAr || category.nameEn || category.name || category.code
    : category.nameEn || category.nameAr || category.name || category.code;

  useEffect(() => {
    if (!isForeignCurrency) {
      setExchangeRate('');
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.exchangeRate;
        return next;
      });
    }
  }, [isForeignCurrency]);

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
    if (field === 'transactionDate') return setFieldError(field, !transactionDate || transactionDate > localToday ? validationMessage('date') : '');
    if (field === 'description') {
      const value = description.trim();
      return setFieldError(field, !value ? validationMessage('required') : value.length > 1000 ? validationMessage('descriptionLength') : '');
    }
    if (field === 'amount') return setFieldError(field, !amount || Number(amount) <= 0 ? validationMessage('amount') : '');
    if (field === 'currency') return setFieldError(field, !currency ? validationMessage('required') : '');
    if (field === 'exchangeRate' && isForeignCurrency) return setFieldError(field, !exchangeRate || Number(exchangeRate) <= 0 ? validationMessage('exchangeRate') : '');
    if (field === 'sourceAccountId') return setFieldError(field, !sourceAccountId ? validationMessage('required') : '');
    if (field === 'expenseCategoryId') return setFieldError(field, !expenseCategoryId ? validationMessage('required') : '');
    return '';
  };

  const saveDraft = async () => {
    if (isSaving) return;
    const fields = ['transactionDate', 'description', 'amount', 'currency', 'sourceAccountId', 'expenseCategoryId'];
    if (isForeignCurrency) fields.push('exchangeRate');
    const invalidFields = fields.filter((field) => Boolean(validateField(field)));
    if (invalidFields.length) {
      setValidationError(validationMessage('summary'));
      setSaveError('');
      fieldRefs.current[invalidFields[0]]?.focus();
      return;
    }

    const cleanDescription = description.trim();
    const cleanNotes = notes.trim();
    const cleanPaymentMethod = paymentMethod.trim();
    const cleanInvoiceNumber = invoiceNumber.trim();
    const cleanExternalReference = externalReference.trim();
    const selectedAccount = Number(sourceAccountId);
    const payload: CreateFinanceTransactionRequest = {
      transactionType: 'MoneyOut',
      transactionDate,
      description: cleanDescription,
      amount: Number(amount),
      currency,
      sourceAccountId: selectedAccount,
      destinationAccountId: selectedAccount,
      expenseCategoryId: Number(expenseCategoryId),
      ...(isForeignCurrency ? { exchangeRate: Number(exchangeRate) } : {}),
      ...(supplierId ? { supplierId: Number(supplierId) } : {}),
      ...(cleanPaymentMethod ? { paymentMethod: cleanPaymentMethod } : {}),
      ...(cleanInvoiceNumber ? { invoiceNumber: cleanInvoiceNumber } : {}),
      ...(cleanExternalReference ? { externalReference: cleanExternalReference } : {}),
      ...(cleanNotes ? { notes: cleanNotes } : {}),
    };

    setDescription(cleanDescription);
    setNotes(cleanNotes);
    setPaymentMethod(cleanPaymentMethod);
    setInvoiceNumber(cleanInvoiceNumber);
    setExternalReference(cleanExternalReference);
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
      navigate('/admin/company-finance/money-out');
    } catch (error) {
      if (transactionId) {
        setSaveError(t('companyFinance.workflow.actionError'));
        return;
      }
      const message = error instanceof Error ? error.message.replace(/^POST failed:\s*/i, '') : '';
      setSaveError(message || key('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!canAccess) return <FinancePermissionDenied />;

  return (
    <div className="w-full space-y-4">
      <header className="flex w-full flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <button type="button" onClick={() => navigate('/admin/company-finance/money-out')} className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={key('back')}><ArrowLeft size={17} className={isArabic ? 'rotate-180' : ''} /></button>
          <div className="min-w-0"><h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEdit ? t('companyFinance.workflow.editMoneyOutTitle') : key('title')}</h2><p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{isEdit ? t('companyFinance.workflow.editSubtitle') : key('subtitle')}</p></div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:ms-auto">
          <button type="button" onClick={() => navigate('/admin/company-finance/money-out')} className="h-9 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-slate-100 dark:hover:bg-slate-800">{key('cancel')}</button>
          <button type="submit" form="money-out-create-form" disabled={isSaving} className="h-9 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900">{isSaving ? key('saving') : isEdit ? t('companyFinance.workflow.saveChanges') : key('saveDraft')}</button>
        </div>
      </header>

      <form id="money-out-create-form" noValidate onSubmit={(event) => { event.preventDefault(); void saveDraft(); }} className="w-full">
        {(validationError || loadError || saveError) && <div role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">{validationError || loadError || saveError}</div>}
        {isMasterDataLoading && <div role="status" className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />{key('loadingMasterData')}</div>}
        <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          <section className="py-4">
            <div className="mb-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{key('sectionTransaction')}</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{key('sectionTransactionHint')}</p></div>
            <div className="grid items-start gap-x-4 gap-y-3.5 md:grid-cols-2 xl:grid-cols-3">
              <label className={labelClass}>{key('transactionDate')} <span className="text-rose-600">*</span><input ref={(element) => { fieldRefs.current.transactionDate = element; }} type="date" max={localToday} value={transactionDate} onChange={(event) => { setTransactionDate(event.target.value); if (event.target.value && event.target.value <= localToday) setFieldError('transactionDate'); }} onBlur={() => validateField('transactionDate')} className={fieldClass} dir="ltr" aria-describedby="money-out-date-message" />{fieldErrors.transactionDate ? <p id="money-out-date-message" className="mt-1 text-xs text-rose-600">{fieldErrors.transactionDate}</p> : <p id="money-out-date-message" className="mt-1 text-xs font-normal text-slate-500 dark:text-slate-400">{key('dateHint')}</p>}</label>
              <label className={`${labelClass} md:col-span-2 xl:col-span-3`}>{key('description')} <span className="text-rose-600">*</span><textarea ref={(element) => { fieldRefs.current.description = element; }} rows={3} maxLength={1000} value={description} onChange={(event) => { setDescription(event.target.value); if (event.target.value.trim()) setFieldError('description'); }} onBlur={() => validateField('description')} className={fieldClass} />{fieldErrors.description && <p className="mt-1 text-xs text-rose-600">{fieldErrors.description}</p>}</label>
            </div>
          </section>

          <section className="py-4">
            <div className="mb-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{key('sectionPayment')}</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{key('sectionPaymentHint')}</p></div>
            <div className="grid grid-flow-row-dense items-start gap-x-4 gap-y-3.5 md:grid-cols-2 xl:grid-cols-3">
              <label className={`${labelClass} order-1`}>{key('amount')} <span className="text-rose-600">*</span><input ref={(element) => { fieldRefs.current.amount = element; }} type="text" inputMode="decimal" value={isAmountFocused ? amount : formatMoney(amount)} onFocus={() => setIsAmountFocused(true)} onBlur={() => { setIsAmountFocused(false); validateField('amount'); }} onChange={(event) => { const next = normalizedNumberInput(event.target.value, MONEY_INPUT); if (next !== null) { setAmount(next); if (next && Number(next) > 0) setFieldError('amount'); } }} onKeyDown={(event) => { if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault(); }} className={fieldClass} dir="ltr" />{fieldErrors.amount && <p className="mt-1 text-xs text-rose-600">{fieldErrors.amount}</p>}</label>
              <label className={`${labelClass} order-2`}>{key('currency')} <span className="text-rose-600">*</span><select ref={(element) => { fieldRefs.current.currency = element; }} value={currency} onChange={(event) => { setCurrency(event.target.value); setFieldError('currency'); }} onBlur={() => validateField('currency')} className={fieldClass} dir="ltr">{currencies.map((value) => <option key={value} value={value}>{value}</option>)}</select>{fieldErrors.currency && <p className="mt-1 text-xs text-rose-600">{fieldErrors.currency}</p>}</label>
              {isForeignCurrency && <label className={`${labelClass} order-3`}>{key('exchangeRate')} <span className="text-rose-600">*</span><input ref={(element) => { fieldRefs.current.exchangeRate = element; }} type="text" inputMode="decimal" value={exchangeRate} onChange={(event) => { const next = normalizedNumberInput(event.target.value, RATE_INPUT); if (next !== null) { setExchangeRate(next); if (Number(next) > 0) setFieldError('exchangeRate'); } }} onBlur={() => validateField('exchangeRate')} className={fieldClass} dir="ltr" />{fieldErrors.exchangeRate && <p className="mt-1 text-xs text-rose-600">{fieldErrors.exchangeRate}</p>}</label>}
              <label className={`${labelClass} md:col-span-2 ${isForeignCurrency ? 'order-5 xl:col-span-2' : 'order-4 xl:col-span-3'}`}>{key('sourceAccount')} <span className="text-rose-600">*</span><select ref={(element) => { fieldRefs.current.sourceAccountId = element; }} disabled={isMasterDataLoading} value={sourceAccountId} onChange={(event) => { setSourceAccountId(event.target.value); if (event.target.value) setFieldError('sourceAccountId'); }} onBlur={() => validateField('sourceAccountId')} className={fieldClass}><option value="">{isMasterDataLoading ? key('loadingAccounts') : key('selectAccount')}</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>{fieldErrors.sourceAccountId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.sourceAccountId}</p>}</label>
              <label className={`${labelClass} ${isForeignCurrency ? 'order-4' : 'order-3 md:col-span-2 xl:col-span-1'}`}>{key('paymentMethod')}<input maxLength={100} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} onBlur={() => setPaymentMethod((value) => value.trim())} className={fieldClass} /></label>
            </div>
          </section>

          <section className="py-4">
            <div className="mb-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{key('sectionClassification')}</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{key('sectionClassificationHint')}</p></div>
            <div className="grid items-start gap-x-4 gap-y-3.5 md:grid-cols-2 xl:grid-cols-3">
              <label className={`${labelClass} md:col-span-2 xl:col-span-1`}>{key('expenseCategory')} <span className="text-rose-600">*</span><select ref={(element) => { fieldRefs.current.expenseCategoryId = element; }} disabled={isMasterDataLoading} value={expenseCategoryId} onChange={(event) => { setExpenseCategoryId(event.target.value); if (event.target.value) setFieldError('expenseCategoryId'); }} onBlur={() => validateField('expenseCategoryId')} className={fieldClass}><option value="">{isMasterDataLoading ? key('loadingCategories') : key('selectCategory')}</option>{categories.map((category) => <option key={category.id} value={category.id}>{categoryLabel(category)}</option>)}</select>{fieldErrors.expenseCategoryId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.expenseCategoryId}</p>}</label>
              <div className={`${labelClass} md:col-span-2 xl:col-span-2`}><label htmlFor="money-out-supplier">{key('supplier')}</label>{isMasterDataLoading ? <div className="mt-1 flex min-h-10 items-center rounded-lg border border-border bg-card px-3 text-sm font-normal text-slate-500 dark:text-slate-400">{key('loadingSuppliers')}</div> : <SupplierCombobox suppliers={suppliers as LocalizedFinanceSupplier[]} value={supplierId} onChange={setSupplierId} onBlur={() => undefined} inputRef={(element) => { if (element) element.id = 'money-out-supplier'; }} isArabic={isArabic} placeholder={key('supplierSearchPlaceholder')} emptyText={key('noSuppliersFound')} clearLabel={key('clearSupplier')} invalid={false} />}</div>
            </div>
          </section>

          <section className="py-4">
            <div className="mb-3"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{key('sectionReferences')}</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{key('sectionReferencesHint')}</p></div>
            <div className="grid items-start gap-x-4 gap-y-3.5 md:grid-cols-2 xl:grid-cols-3">
              <label className={labelClass}>{key('invoiceNumber')}<input value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} onBlur={() => setInvoiceNumber((value) => value.trim())} className={fieldClass} dir="auto" /></label>
              <label className={`${labelClass} md:col-span-1 xl:col-span-2`}>{key('externalReference')}<input value={externalReference} onChange={(event) => setExternalReference(event.target.value)} onBlur={() => setExternalReference((value) => value.trim())} className={fieldClass} dir="auto" /></label>
              <label className={`${labelClass} md:col-span-2 xl:col-span-3`}>{key('notes')}<textarea rows={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => setNotes((value) => value.trim())} className={fieldClass} /></label>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};
