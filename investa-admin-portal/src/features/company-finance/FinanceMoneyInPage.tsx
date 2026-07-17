import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/context/AuthContext";
import { companyFinanceService } from "@/services/companyFinanceService";
import type { FinanceAccount, FinanceCategory, FinanceTransaction } from "./types";
import {
  FinanceEmpty,
  FinanceError,
  FinanceLoading,
  FinancePermissionDenied,
} from "./CompanyFinanceStates";
import { FinanceTransactionHistory } from "./FinanceTransactionHistory";
import { FinanceWorkflowActions } from "./FinanceWorkflowActions";

const pageSizes = [10, 25, 50];
const text = (value?: string | null) => value?.trim() || "-";
export const FinanceMoneyInPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission("Finance.View");
  const canCreate = hasAnyPermission("Finance.Create");
  const [items, setItems] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [currency, setCurrency] = useState("");
  const [method, setMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [details, setDetails] = useState<FinanceTransaction | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [destinationAccounts, setDestinationAccounts] = useState<
    FinanceAccount[]
  >([]);
  const [incomeCategories, setIncomeCategories] = useState<FinanceCategory[]>([]);
  const [createIncomingType, setCreateIncomingType] = useState("CompanyRevenue");
  const [payerName, setPayerName] = useState("");
  const [incomeCategoryId, setIncomeCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(
        (await companyFinanceService.getTransactions()).filter(
          (item) =>
            item.transactionType === "MoneyIn" ||
            item.incomingMoneyType === "InternalTransfer",
        ),
      );
    } catch {
      setError(t("companyFinance.moneyIn.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    if (canView) void load();
    else setLoading(false);
  }, [canView, load]);
  useEffect(() => {
    if (!isCreateModalOpen) return;
    void Promise.all([companyFinanceService.getAccounts(), companyFinanceService.getIncomeCategories()])
      .then(([accounts, categories]) => { setDestinationAccounts(accounts.filter((account) => account.isActive)); setIncomeCategories(categories.filter((category) => category.isActive)); })
      .catch(() =>
        setError(
          t("companyFinance.moneyIn.accountsError", {
            defaultValue:
              i18n.language === "ar"
                ? "تعذر تحميل الحسابات."
                : "Unable to load accounts.",
          }),
        ),
      );
  }, [i18n.language, isCreateModalOpen, t]);
  useEffect(() => { if (createIncomingType !== "CompanyRevenue") { setPayerName(""); setIncomeCategoryId(""); setPaymentMethod(""); } }, [createIncomingType]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const haystack = [
        item.referenceNumber,
        item.sourceName,
        item.description,
        item.invoiceNumber,
        item.externalReference,
        item.amount,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const day = item.transactionDate.slice(0, 10);
      return (
        (!q || haystack.includes(q)) &&
        (!type || item.incomingMoneyType === type) &&
        (!status || item.status === status) &&
        (!documentation || item.documentationStatus === documentation) &&
        (!currency || item.currency === currency) &&
        (!method || item.paymentMethod === method) &&
        (!fromDate || day >= fromDate) &&
        (!toDate || day <= toDate)
      );
    });
  }, [
    currency,
    documentation,
    fromDate,
    items,
    method,
    search,
    status,
    toDate,
    type,
  ]);
  const types = [
    ...new Set(items.map((x) => x.incomingMoneyType).filter(Boolean)),
  ] as string[];
  const statuses = [...new Set(items.map((x) => x.status))];
  const docs = [
    ...new Set(items.map((x) => x.documentationStatus).filter(Boolean)),
  ] as string[];
  const currencies = [...new Set(items.map((x) => x.currency))];
  const methods = [
    ...new Set(items.map((x) => x.paymentMethod).filter(Boolean)),
  ] as string[];
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const from = filtered.length ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, filtered.length);
  const activeFilterCount = [type, status, documentation, currency, method, fromDate, toDate].filter(Boolean).length;
  useEffect(() => {
    setPage(1);
  }, [
    search,
    type,
    status,
    documentation,
    currency,
    method,
    fromDate,
    toDate,
    pageSize,
  ]);
  const reset = () => {
    setSearch("");
    setType("");
    setStatus("");
    setDocumentation("");
    setCurrency("");
    setMethod("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };
  const category = (item: FinanceTransaction) =>
    i18n.language === "ar"
      ? text(
          item.incomeCategoryNameAr ||
            item.incomeCategoryNameEn ||
            item.incomeCategoryName,
        )
      : text(
          item.incomeCategoryNameEn ||
            item.incomeCategoryName ||
            item.incomeCategoryNameAr,
        );
  const label = (group: string, value?: string | null) =>
    value
      ? t(`companyFinance.moneyIn.${group}.${value}`, { defaultValue: value })
      : "-";
  if (!canView) return <FinancePermissionDenied />;
  if (loading) return <FinanceLoading />;
  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("companyFinance.moneyIn.title")}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t("companyFinance.moneyIn.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            dir="ltr"
          >
            {filtered.length}
          </span>
          {canCreate && (
            <button
              type="button"
              onClick={() => navigate("/company-finance/money-in/new")}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
            >
              <Plus size={16} />
              {i18n.language === "ar" ? "إضافة أموال واردة" : "Add Money In"}
            </button>
          )}
        </div>
      </header>
      {error && <FinanceError message={error} />}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md shadow-slate-950/[0.03] dark:border-slate-700 dark:bg-slate-900">
        <div className="money-in-toolbar border-b border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <Search
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("companyFinance.moneyIn.search")}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 ps-9 pe-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
              aria-controls="money-in-secondary-filters"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <SlidersHorizontal size={14} />
              {t(showFilters ? "companyFinance.moneyIn.hideFilters" : "companyFinance.moneyIn.showFilters")}
              {activeFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white" dir="ltr">{activeFilterCount}</span>}
            </button>
          </div>
          {showFilters && <div id="money-in-secondary-filters" className="mt-2.5 border-t border-border pt-2.5">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={reset} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-card dark:text-slate-400"><RotateCcw size={13} />{t("companyFinance.moneyIn.reset")}</button>
            </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">{t("companyFinance.moneyIn.allTypes")}</option>
              {types.map((x) => (
                <option key={x}>{label("types", x)}</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">
                {t("companyFinance.moneyIn.allStatuses")}
              </option>
              {statuses.map((x) => (
                <option key={x}>{label("statuses", x)}</option>
              ))}
            </select>
            <select
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
            >
              <option value="">
                {t("companyFinance.moneyIn.allDocumentation")}
              </option>
              {docs.map((x) => (
                <option key={x}>{label("documentation", x)}</option>
              ))}
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="">
                {t("companyFinance.moneyIn.allCurrencies")}
              </option>
              {currencies.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="">{t("companyFinance.moneyIn.allMethods")}</option>
              {methods.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          </div>}
        </div>
        <div className="admin-table-viewport">
          <table className="admin-data-table min-w-[900px] divide-y dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {[
                  "reference",
                  "date",
                  "incomingType",
                  "source",
                  "amount",
                  "status",
                  "actions",
                ].map((x) => (
                  <th key={x}>{t(`companyFinance.moneyIn.${x}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                >
                  <td
                    className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100"
                    dir="ltr"
                  >
                    {item.referenceNumber}
                    <p className="mt-0.5 font-sans text-[11px] font-normal text-slate-500">
                      {text(item.makerDisplayName)}
                    </p>
                  </td>
                  <td dir="ltr">
                    {new Date(item.transactionDate).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {label("types", item.incomingMoneyType)}
                    </span>
                  </td>
                  <td>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {text(item.sourceName)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {category(item)}
                    </p>
                  </td>
                  <td className="text-end" dir="ltr">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.amount.toLocaleString("en-US")} {item.currency}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t("companyFinance.moneyIn.netReceived")}:{" "}
                      {(item.netAmountReceived ?? item.amount).toLocaleString(
                        "en-US",
                      )}
                    </p>
                  </td>
                  <td>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {label("statuses", item.status)}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      {label("documentation", item.documentationStatus)} ·{" "}
                      {text(item.destinationAccountName)}
                    </p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        void companyFinanceService
                          .getTransaction(item.id)
                          .then(setDetails)
                          .catch(() =>
                            setError(t("companyFinance.moneyIn.detailsError")),
                          )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-primary/10"
                      aria-label={t("companyFinance.moneyIn.details")}
                    >
                      <Eye size={16} />
                    </button>
                    <FinanceWorkflowActions compact transaction={item} onEdit={() => navigate(`/company-finance/money-in/${item.id}/edit`)} onUpdated={(updated) => { setItems((current) => current.map((row) => row.id === updated.id ? updated : row)); if (details?.id === updated.id) setDetails(updated); void load(); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7}>
                    <FinanceEmpty />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <footer className="admin-table-footer flex items-center justify-between border-t px-3 py-2.5 text-sm">
            <span dir="ltr">
              {t("companyFinance.moneyIn.showing", {
                from,
                to,
                total: filtered.length,
              })}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {pageSizes.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span dir="ltr">
                {page}/{pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        )}
      </section>
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 dark:bg-slate-900">
            <div className="flex justify-between">
              <h3 className="font-bold">{details.referenceNumber}</h3>
              <button onClick={() => setDetails(null)}>
                {t("common.close")}
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <dt>{t("companyFinance.moneyIn.description")}</dt>
              <dd>{details.description}</dd>
              <dt>{t("companyFinance.moneyIn.amount")}</dt>
              <dd dir="ltr">
                {details.amount} {details.currency}
              </dd>
              <dt>{t("companyFinance.moneyIn.netReceived")}</dt>
              <dd dir="ltr">{details.netAmountReceived ?? details.amount}</dd>
              <dt>{t("companyFinance.moneyIn.notes")}</dt>
              <dd>
                {text(
                  (details as FinanceTransaction & { notes?: string }).notes,
                )}
              </dd>
            </dl>
            <FinanceTransactionHistory transaction={details} statusLabel={label("statuses", details.status)} />
            <div className="mt-5 border-t border-border pt-4"><FinanceWorkflowActions transaction={details} onEdit={() => navigate(`/company-finance/money-in/${details.id}/edit`)} onUpdated={(updated) => { setDetails(updated); setItems((current) => current.map((row) => row.id === updated.id ? updated : row)); void load(); }} /></div>
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[calc(100vh-2.5rem)]">
            <header className="shrink-0 border-b border-slate-200 px-5 py-3.5 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {i18n.language === "ar" ? "إضافة أموال واردة" : "Add Money In"}
              </h3>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("companyFinance.moneyIn.date")}
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                    dir="ltr"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("companyFinance.moneyIn.incomingType")}
                  <select value={createIncomingType} onChange={(event) => setCreateIncomingType(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                    {types.map((value) => (
                      <option key={value} value={value}>
                        {label("types", value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("companyFinance.moneyIn.description")}
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                  />
                </label>
                {createIncomingType === "CompanyRevenue" && <><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("companyFinance.moneyIn.source")}<input value={payerName} onChange={(event) => setPayerName(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground" /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("companyFinance.moneyIn.category")}<select value={incomeCategoryId} onChange={(event) => setIncomeCategoryId(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"><option value="">{i18n.language === "ar" ? "اختر الفئة" : "Select category"}</option>{incomeCategories.map((category) => <option key={category.id} value={category.id}>{i18n.language === "ar" ? category.nameAr || category.nameEn || category.name : category.nameEn || category.name || category.nameAr}</option>)}</select></label><label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">{i18n.language === "ar" ? "طريقة الدفع" : "Payment Method"}<input value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground" /></label></>}
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("companyFinance.moneyIn.amount")}
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                    dir="ltr"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("companyFinance.moneyIn.currency")}
                  <select
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                    dir="ltr"
                  >
                    {currencies.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("companyFinance.moneyIn.receivingAccount")}
                  <select className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                    <option value="">
                      {i18n.language === "ar"
                        ? "اختر الحساب"
                        : "Select account"}
                    </option>
                    {destinationAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                disabled
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white opacity-50 dark:bg-slate-100 dark:text-slate-900"
              >
                {i18n.language === "ar" ? "حفظ كمسودة" : "Save Draft"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
