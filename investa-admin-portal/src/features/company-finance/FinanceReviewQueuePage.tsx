import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/AuthContext";
import { companyFinanceService } from "@/services/companyFinanceService";
import type { FinanceTransaction } from "./types";
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
const dateLabel = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-GB") : "-";
const dateTimeLabel = (value?: string | null) => value ? new Date(value).toLocaleString("en-GB") : "-";

export const FinanceReviewQueuePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission("Finance.Review", "Finance.Confirm");
  const [items, setItems] = useState<FinanceTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [incomingType, setIncomingType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currency, setCurrency] = useState("");
  const [account, setAccount] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [details, setDetails] = useState<FinanceTransaction | null>(null);

  const activeFilterCount = [type, incomingType, fromDate, toDate, currency, account, minAmount, maxAmount].filter(Boolean).length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyFinanceService.getMyReviewQueue({
        pageNumber: page,
        pageSize,
        search: search || undefined,
        transactionType: type || undefined,
        incomingMoneyType: incomingType || undefined,
        dateFrom: fromDate || undefined,
        dateTo: toDate || undefined,
        currency: currency || undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
        maxAmount: maxAmount ? Number(maxAmount) : undefined,
      });
      setItems(result.data);
      setTotalCount(result.totalCount);
    } catch {
      setError(t("companyFinance.reviewQueue.loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, type, incomingType, fromDate, toDate, currency, minAmount, maxAmount, t]);

  useEffect(() => {
    if (canView) void load();
    else setLoading(false);
  }, [load, canView]);

  useEffect(() => {
    setPage(1);
  }, [search, type, incomingType, fromDate, toDate, currency, minAmount, maxAmount, pageSize]);

  const reset = () => {
    setSearch("");
    setType("");
    setIncomingType("");
    setFromDate("");
    setToDate("");
    setCurrency("");
    setAccount("");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  const pages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, totalCount);

  const typeLabel = (value?: string | null) =>
    value
      ? t(`companyFinance.reviewQueue.types.${value}`, { defaultValue: value })
      : "-";

  const reloadCurrentPage = useCallback(() => {
    void load();
  }, [load]);

  const handleDetailsOpen = useCallback((id: number) => {
    setError(null);
    void companyFinanceService
      .getTransaction(id)
      .then(setDetails)
      .catch(() => setError(t("companyFinance.reviewQueue.detailsError")));
  }, [t]);

  const handleWorkflowUpdated = useCallback((updated: FinanceTransaction) => {
    setDetails(updated);
    reloadCurrentPage();
  }, [reloadCurrentPage]);

  if (!canView) return <FinancePermissionDenied />;
  if (loading && !items.length) return <FinanceLoading />;

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("companyFinance.reviewQueue.title")}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t("companyFinance.reviewQueue.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            dir="ltr"
          >
            {totalCount}
          </span>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3">
          <FinanceError message={error} />
          <button
            type="button"
            onClick={reloadCurrentPage}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={13} />
            {t("companyFinance.reviewQueue.retry")}
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md shadow-slate-950/[0.03] dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <Search
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("companyFinance.reviewQueue.search")}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 ps-9 pe-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowFilters((c) => !c)}
              aria-expanded={showFilters}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <SlidersHorizontal size={14} />
              {t(showFilters ? "companyFinance.reviewQueue.hideFilters" : "companyFinance.reviewQueue.showFilters")}
              {activeFilterCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white" dir="ltr">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-2.5 border-t border-border pt-2.5">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-card dark:text-slate-400"
                >
                  <RotateCcw size={13} />
                  {t("companyFinance.reviewQueue.reset")}
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="">{t("companyFinance.reviewQueue.allTypes")}</option>
                  <option value="MoneyIn">{typeLabel("MoneyIn")}</option>
                  <option value="MoneyOut">{typeLabel("MoneyOut")}</option>
                  <option value="InternalTransfer">{typeLabel("InternalTransfer")}</option>
                  <option value="FounderPaid">{typeLabel("FounderPaid")}</option>
                  <option value="FounderReimbursement">{typeLabel("FounderReimbursement")}</option>
                  <option value="CashAdvance">{typeLabel("CashAdvance")}</option>
                  <option value="SupplierRefund">{typeLabel("SupplierRefund")}</option>
                  <option value="AssetPurchase">{typeLabel("AssetPurchase")}</option>
                </select>
                <input
                  type="text"
                  value={incomingType}
                  onChange={(e) => setIncomingType(e.target.value)}
                  placeholder={t("companyFinance.reviewQueue.incomingMoneyType")}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  dir="ltr"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  dir="ltr"
                />
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder={t("companyFinance.reviewQueue.currency")}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder={t("companyFinance.reviewQueue.minAmount")}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  dir="ltr"
                />
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder={t("companyFinance.reviewQueue.maxAmount")}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </div>

        {loading && items.length > 0 && (
          <div className="flex justify-center border-b border-border py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        )}

        <div className="admin-table-viewport">
          <table className="admin-data-table min-w-[1100px] divide-y dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {[
                  "reference",
                  "date",
                  "type",
                  "description",
                  "maker",
                  "amount",
                  "submittedAt",
                  "actions",
                ].map((x) => (
                  <th key={x}>{t(`companyFinance.reviewQueue.${x}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                >
                  <td
                    className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100"
                    dir="ltr"
                  >
                    {item.referenceNumber}
                  </td>
                  <td className="text-xs" dir="ltr">
                    {dateLabel(item.transactionDate)}
                  </td>
                  <td>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      {typeLabel(item.transactionType)}
                    </span>
                    {item.incomingMoneyType && (
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.incomingMoneyType}
                      </p>
                    )}
                  </td>
                  <td className="max-w-[200px]">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {text(item.description)}
                    </p>
                    {item.sourceName && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.sourceName}
                      </p>
                    )}
                  </td>
                  <td className="text-sm text-slate-700 dark:text-slate-300">
                    {text(item.makerDisplayName)}
                  </td>
                  <td className="text-end" dir="ltr">
                    <p className="whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                      {item.amount.toLocaleString("en-US")} {item.currency}
                    </p>
                  </td>
                  <td className="text-xs text-slate-500" dir="ltr">
                    {dateTimeLabel(item.submittedAt)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDetailsOpen(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-primary/10"
                        aria-label={t("companyFinance.reviewQueue.details")}
                      >
                        <Eye size={16} />
                      </button>
                      <FinanceWorkflowActions
                        compact
                        transaction={item}
                        onUpdated={(updated) => {
                          setItems((current) =>
                            current.map((row) =>
                              row.id === updated.id ? updated : row
                            )
                          );
                          if (details?.id === updated.id) setDetails(updated);
                          reloadCurrentPage();
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !items.length && (
                <tr>
                  <td colSpan={8}>
                    <FinanceEmpty />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 && (
          <footer className="admin-table-footer flex items-center justify-between border-t px-3 py-2.5 text-sm">
            <span dir="ltr">
              {t("companyFinance.reviewQueue.showing", {
                from,
                to,
                total: totalCount,
              })}
            </span>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded border border-border bg-card px-2 py-1 text-xs"
              >
                {pageSizes.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-600 disabled:opacity-30 dark:text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>
              <span dir="ltr" className="text-xs">
                {page}/{pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-600 disabled:opacity-30 dark:text-slate-300"
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {details.referenceNumber}
              </h3>
              <button
                onClick={() => setDetails(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t("common.close")}
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.description")}
              </dt>
              <dd className="text-slate-900 dark:text-white">
                {details.description}
              </dd>

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.transactionType")}
              </dt>
              <dd>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {typeLabel(details.transactionType)}
                </span>
              </dd>

              {details.incomingMoneyType && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.incomingMoneyType")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {details.incomingMoneyType}
                  </dd>
                </>
              )}

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.amount")}
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-white" dir="ltr">
                {details.amount.toLocaleString("en-US")} {details.currency}
              </dd>

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.destinationAccount")}
              </dt>
              <dd className="text-slate-900 dark:text-white">
                {text(details.destinationAccountName)}
              </dd>

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.sourceAccount")}
              </dt>
              <dd className="text-slate-900 dark:text-white">
                {text(details.sourceAccountName)}
              </dd>

              {details.supplierName && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.supplier")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {details.supplierName}
                  </dd>
                </>
              )}

              {details.sourceName && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.source")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {details.sourceName}
                  </dd>
                </>
              )}

              {details.incomeCategoryName && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.category")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {i18n.language === "ar"
                      ? text(details.incomeCategoryNameAr || details.incomeCategoryNameEn || details.incomeCategoryName)
                      : text(details.incomeCategoryNameEn || details.incomeCategoryName || details.incomeCategoryNameAr)}
                  </dd>
                </>
              )}

              {details.expenseCategoryName && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.category")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {i18n.language === "ar"
                      ? text(details.expenseCategoryName)
                      : text(details.expenseCategoryName)}
                  </dd>
                </>
              )}

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.maker")}
              </dt>
              <dd className="text-slate-900 dark:text-white">
                {text(details.makerDisplayName)}
              </dd>

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.checker")}
              </dt>
              <dd className="text-slate-900 dark:text-white">
                {text(details.checkerDisplayName)}
              </dd>

              <dt className="text-slate-500 dark:text-slate-400">
                {t("companyFinance.reviewQueue.documentationStatus")}
              </dt>
              <dd className="text-slate-900 dark:text-white">
                {text(details.documentationStatus)}
              </dd>

              {details.invoiceNumber && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.invoiceNumber")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white" dir="ltr">
                    {details.invoiceNumber}
                  </dd>
                </>
              )}

              {details.externalReference && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.externalReference")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white" dir="ltr">
                    {details.externalReference}
                  </dd>
                </>
              )}

              {details.notes && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.notes")}
                  </dt>
                  <dd className="col-span-1 text-slate-900 dark:text-white sm:col-span-1">
                    {details.notes}
                  </dd>
                </>
              )}

              {details.transactionDate && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.transactionDate")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white" dir="ltr">
                    {dateLabel(details.transactionDate)}
                  </dd>
                </>
              )}

              {details.submittedAt && (
                <>
                  <dt className="text-slate-500 dark:text-slate-400">
                    {t("companyFinance.reviewQueue.submittedAt")}
                  </dt>
                  <dd className="text-slate-900 dark:text-white" dir="ltr">
                    {dateTimeLabel(details.submittedAt)}
                  </dd>
                </>
              )}
            </dl>

            <FinanceTransactionHistory
              transaction={details}
              statusLabel={typeLabel(details.status)}
            />

            <div className="mt-5 border-t border-border pt-4">
              <FinanceWorkflowActions
                transaction={details}
                onUpdated={handleWorkflowUpdated}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
