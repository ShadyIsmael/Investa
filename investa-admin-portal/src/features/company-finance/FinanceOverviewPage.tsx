import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/context/AuthContext";
import { companyFinanceService } from "@/services/companyFinanceService";
import type {
  FinanceAccount,
  FinanceOverview,
  FinanceRecentActivity,
  FinanceTransaction,
} from "./types";
import { FinanceEmpty, FinancePermissionDenied } from "./CompanyFinanceStates";
import { FinanceTransactionHistory } from "./FinanceTransactionHistory";
import { FinanceWorkflowActions } from "./FinanceWorkflowActions";

const ACCOUNT_PAGE_SIZE = 5;
const safeText = (value?: string | null) => value?.trim() || "-";
const localDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};
const defaultPeriod = () => {
  const today = new Date();
  return {
    dateFrom: localDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    dateTo: localDate(today),
  };
};
const amountText = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const percentText = (value: number) =>
  `${value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;

const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4" aria-hidden="true">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-28 rounded-lg bg-slate-200/70 dark:bg-slate-800"
        />
      ))}
    </div>
    <div className="h-80 rounded-lg bg-slate-200/70 dark:bg-slate-800" />
    <div className="grid gap-3 xl:grid-cols-2">
      <div className="h-72 rounded-lg bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-72 rounded-lg bg-slate-200/70 dark:bg-slate-800" />
    </div>
  </div>
);

const ChangeIndicator: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => {
  const positive = value > 0;
  const negative = value < 0;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const color = positive
    ? "text-emerald-600 dark:text-emerald-400"
    : negative
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-500 dark:text-slate-400";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}
      dir="ltr"
    >
      <Icon size={14} />
      {percentText(value)}{" "}
      <span
        className="font-normal text-slate-500 dark:text-slate-400"
        dir="auto"
      >
        {label}
      </span>
    </span>
  );
};

interface KpiCardProps {
  title: string;
  value: string;
  currencyLabel: string;
  change?: number;
  changeLabel: string;
  tone: "positive" | "negative" | "neutral";
  children?: React.ReactNode;
}
const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  currencyLabel,
  change,
  changeLabel,
  tone,
  children,
}) => {
  const accent =
    tone === "positive"
      ? "border-s-emerald-500"
      : tone === "negative"
        ? "border-s-rose-500"
        : "border-s-slate-400";
  return (
    <article
      className={`rounded-lg border border-border border-s-4 bg-card p-4 shadow-sm ${accent}`}
    >
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p
        className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        dir="ltr"
      >
        {value}
      </p>
      <div className="mt-1 min-h-5 text-xs text-slate-500 dark:text-slate-400">
        {currencyLabel}
      </div>
      <div className="mt-2 min-h-5">
        {change !== undefined ? (
          <ChangeIndicator value={change} label={changeLabel} />
        ) : (
          children
        )}
      </div>
    </article>
  );
};

export const FinanceOverviewPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission("Finance.View");
  const initialPeriod = useMemo(defaultPeriod, []);
  const today = useMemo(() => localDate(new Date()), []);
  const [dateFrom, setDateFrom] = useState(initialPeriod.dateFrom);
  const [dateTo, setDateTo] = useState(initialPeriod.dateTo);
  const [accountId, setAccountId] = useState("");
  const [currency, setCurrency] = useState("");
  const [masterAccounts, setMasterAccounts] = useState<FinanceAccount[]>([]);
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountPage, setAccountPage] = useState(1);
  const [details, setDetails] = useState<FinanceTransaction | null>(null);
  const [detailsError, setDetailsError] = useState("");
  const requestId = useRef(0);
  const isArabic = i18n.language === "ar";
  const baseCurrencyLabel = t("companyFinance.overview.baseCurrency");
  const controlClass =
    "h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  useEffect(() => {
    if (!canView) return;
    void companyFinanceService
      .getAccounts()
      .then((items) => setMasterAccounts(items.filter((item) => item.isActive)))
      .catch(() => undefined);
  }, [canView]);

  const load = useCallback(async () => {
    if (!canView) return;
    if (!dateFrom || !dateTo || dateFrom > dateTo) {
      setFilterError(t("companyFinance.overview.validation.dateOrder"));
      setLoading(false);
      return;
    }
    if (dateTo > today) {
      setFilterError(t("companyFinance.overview.validation.futureDate"));
      setLoading(false);
      return;
    }
    setFilterError("");
    setError("");
    setLoading(true);
    const currentRequest = ++requestId.current;
    try {
      const response = await companyFinanceService.getOverview({
        dateFrom,
        dateTo,
        ...(accountId ? { accountId: Number(accountId) } : {}),
        ...(currency ? { currency } : {}),
      });
      if (currentRequest === requestId.current) setOverview(response);
    } catch {
      if (currentRequest === requestId.current) {
        setOverview(null);
        setError(t("companyFinance.overview.loadError"));
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [accountId, canView, currency, dateFrom, dateTo, retryKey, t, today]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetPeriod = () => {
    const period = defaultPeriod();
    setDateFrom(period.dateFrom);
    setDateTo(period.dateTo);
    setAccountId("");
    setCurrency("");
  };

  const accountCurrencies = [
    ...new Set(
      masterAccounts.map((account) => account.currency).filter(Boolean),
    ),
  ];
  const filteredAccounts = useMemo(() => {
    const query = accountSearch.trim().toLocaleLowerCase();
    return (overview?.accounts ?? []).filter(
      (account) =>
        (!query ||
          [account.accountCode, account.accountName, account.currency]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query)) &&
        (!accountType || account.accountType === accountType),
    );
  }, [accountSearch, accountType, overview]);
  const accountTypes = [
    ...new Set(
      (overview?.accounts ?? []).map((account) => account.accountType),
    ),
  ];
  const accountPageCount = Math.max(
    1,
    Math.ceil(filteredAccounts.length / ACCOUNT_PAGE_SIZE),
  );
  const currentAccountPage = Math.min(accountPage, accountPageCount);
  const accountRows = filteredAccounts.slice(
    (currentAccountPage - 1) * ACCOUNT_PAGE_SIZE,
    currentAccountPage * ACCOUNT_PAGE_SIZE,
  );
  useEffect(() => setAccountPage(1), [accountSearch, accountType, overview]);

  const pendingCount = overview
    ? overview.pending.draftCount +
      overview.pending.pendingReviewCount +
      overview.pending.approvedNotConfirmedCount +
      overview.pending.rejectedCount
    : 0;
  const enumLabel = (group: string, value?: string | null) =>
    value
      ? t(`companyFinance.overview.${group}.${value}`, { defaultValue: "-" })
      : "-";
  const accountTypeLabel = (value: string) =>
    t(`companyFinance.accounts.types.${value}`, { defaultValue: "-" });
  const categoryLabel = (row: FinanceOverview["moneyOutBreakdown"][number]) =>
    isArabic
      ? row.categoryNameAr || row.categoryNameEn || row.categoryCode || "-"
      : row.categoryNameEn || row.categoryNameAr || row.categoryCode || "-";
  const recentTypeLabel = (item: FinanceRecentActivity) =>
    item.transactionType === "MoneyIn" && item.incomingMoneyType
      ? enumLabel("incomingTypes", item.incomingMoneyType)
      : enumLabel("transactionTypes", item.transactionType);
  const openDetails = (id: number) => {
    setDetailsError("");
    void companyFinanceService
      .getTransaction(id)
      .then(setDetails)
      .catch(() => setDetailsError(t("companyFinance.overview.detailsError")));
  };

  if (!canView) return <FinancePermissionDenied />;

  return (
    <div className="space-y-4">
      <header className="space-y-3 border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("companyFinance.overview.title")}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t("companyFinance.overview.subtitle")}
          </p>
        </div>
        <div className="grid items-end gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(145px,0.8fr)_minmax(145px,0.8fr)_minmax(190px,1.2fr)_minmax(130px,0.7fr)_auto]">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("companyFinance.overview.dateFrom")}
            <input
              type="date"
              value={dateFrom}
              max={dateTo || today}
              onChange={(event) => setDateFrom(event.target.value)}
              className={controlClass}
              dir="ltr"
            />
          </label>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("companyFinance.overview.dateTo")}
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={today}
              onChange={(event) => setDateTo(event.target.value)}
              className={controlClass}
              dir="ltr"
            />
          </label>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("companyFinance.overview.account")}
            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className={controlClass}
            >
              <option value="">
                {t("companyFinance.overview.allAccounts")}
              </option>
              {masterAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("companyFinance.overview.currency")}
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={controlClass}
              dir="ltr"
            >
              <option value="">
                {t("companyFinance.overview.allCurrencies")}
              </option>
              {accountCurrencies.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={resetPeriod}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            {t("companyFinance.overview.reset")}
          </button>
        </div>
        {filterError && (
          <p className="text-xs text-rose-600 dark:text-rose-400">
            {filterError}
          </p>
        )}
      </header>

      {loading && <DashboardSkeleton />}
      {!loading && error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-current px-3 text-xs font-semibold"
          >
            <RefreshCw size={14} />
            {t("companyFinance.overview.retry")}
          </button>
        </div>
      )}
      {!loading && !error && overview && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title={t("companyFinance.overview.totalMoneyIn")}
              value={amountText(overview.totalMoneyIn)}
              currencyLabel={baseCurrencyLabel}
              change={overview.periodComparison.moneyInChangePercentage}
              changeLabel={t("companyFinance.overview.vsPrevious")}
              tone="positive"
            />
            <KpiCard
              title={t("companyFinance.overview.totalMoneyOut")}
              value={amountText(overview.totalMoneyOut)}
              currencyLabel={baseCurrencyLabel}
              change={overview.periodComparison.moneyOutChangePercentage}
              changeLabel={t("companyFinance.overview.vsPrevious")}
              tone="negative"
            />
            <KpiCard
              title={t("companyFinance.overview.netCashFlow")}
              value={amountText(overview.netCashFlow)}
              currencyLabel={baseCurrencyLabel}
              change={overview.periodComparison.netCashFlowChangePercentage}
              changeLabel={t("companyFinance.overview.vsPrevious")}
              tone={
                overview.netCashFlow > 0
                  ? "positive"
                  : overview.netCashFlow < 0
                    ? "negative"
                    : "neutral"
              }
            />
            <KpiCard
              title={t("companyFinance.overview.pendingTransactions")}
              value={pendingCount.toLocaleString("en-US")}
              currencyLabel={t("companyFinance.overview.workflowItems")}
              changeLabel=""
              tone="neutral"
            >
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t("companyFinance.overview.pendingCardDetail", {
                  draft: overview.pending.draftCount,
                  review: overview.pending.pendingReviewCount,
                  approved: overview.pending.approvedNotConfirmedCount,
                  rejected: overview.pending.rejectedCount,
                })}
              </span>
            </KpiCard>
          </section>

          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("companyFinance.overview.accountBalances")}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t("companyFinance.overview.accountBalancesHint")}
                </p>
              </div>
              <div className="flex gap-2">
                <label className="relative min-w-0 flex-1 sm:w-64">
                  <Search
                    size={14}
                    className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={accountSearch}
                    onChange={(event) => setAccountSearch(event.target.value)}
                    placeholder={t("companyFinance.overview.searchAccounts")}
                    className="h-8 w-full rounded-md border border-border bg-card pe-2.5 ps-8 text-xs text-foreground outline-none"
                  />
                </label>
                <select
                  value={accountType}
                  onChange={(event) => setAccountType(event.target.value)}
                  className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground"
                >
                  <option value="">
                    {t("companyFinance.overview.allAccountTypes")}
                  </option>
                  {accountTypes.map((value) => (
                    <option key={value} value={value}>
                      {accountTypeLabel(value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-table-viewport h-[350px]">
              <table className="admin-data-table min-w-[1280px] divide-y dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {[
                      "accountName",
                      "accountType",
                      "currency",
                      "openingBalance",
                      "confirmedIn",
                      "confirmedOut",
                      "transfersIn",
                      "transfersOut",
                      "currentBalance",
                      "pendingIn",
                      "pendingOut",
                    ].map((column) => (
                      <th
                        key={column}
                        className={
                          column === "accountName" ||
                          column === "accountType" ||
                          column === "currency"
                            ? ""
                            : "text-end"
                        }
                      >
                        {t(`companyFinance.overview.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accountRows.map((account) => (
                    <tr
                      key={account.accountId}
                      className="h-14 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {account.accountName}
                        </p>
                        <p className="text-[11px] text-slate-500" dir="ltr">
                          {account.accountCode}
                        </p>
                      </td>
                      <td>{accountTypeLabel(account.accountType)}</td>
                      <td dir="ltr">{account.currency}</td>
                      {[
                        account.openingBalance,
                        account.confirmedMoneyIn,
                        account.confirmedMoneyOut,
                        account.internalTransfersIn,
                        account.internalTransfersOut,
                        account.currentBalance,
                        account.pendingIn,
                        account.pendingOut,
                      ].map((value, index) => (
                        <td
                          key={index}
                          className={`whitespace-nowrap text-end font-mono text-xs tabular-nums ${index === 5 ? "font-bold text-slate-900 dark:text-white" : ""}`}
                          dir="ltr"
                        >
                          {amountText(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!filteredAccounts.length && (
                    <tr>
                      <td colSpan={11}>
                        <FinanceEmpty />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="flex min-h-10 items-center justify-between border-t border-border px-3 text-xs text-slate-500 dark:text-slate-400">
              <span dir="ltr">
                {t("companyFinance.overview.accountCount", {
                  count: filteredAccounts.length,
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentAccountPage === 1}
                  onClick={() => setAccountPage(currentAccountPage - 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40"
                  aria-label={t("companyFinance.overview.previous")}
                >
                  <ChevronLeft size={15} />
                </button>
                <span dir="ltr">
                  {currentAccountPage}/{accountPageCount}
                </span>
                <button
                  type="button"
                  disabled={currentAccountPage === accountPageCount}
                  onClick={() => setAccountPage(currentAccountPage + 1)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40"
                  aria-label={t("companyFinance.overview.next")}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </footer>
          </section>

          <div className="grid gap-3 xl:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("companyFinance.overview.moneyInBreakdown")}
              </h3>
              <div className="mt-3 space-y-3">
                {overview.moneyInBreakdown.map((row) => (
                  <div key={row.type}>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {enumLabel("incomingTypes", row.type)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {t("companyFinance.overview.transactionCount", {
                            count: row.transactionCount,
                          })}
                        </p>
                      </div>
                      <div className="text-end">
                        <p
                          className="font-mono text-sm font-semibold tabular-nums"
                          dir="ltr"
                        >
                          {amountText(row.amount)}
                        </p>
                        <p className="text-[11px] text-slate-500" dir="ltr">
                          {percentText(row.percentageOfTotalMoneyIn)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${row.percentageOfTotalMoneyIn}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!overview.moneyInBreakdown.length && <FinanceEmpty />}
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("companyFinance.overview.moneyOutBreakdown")}
              </h3>
              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pe-1">
                {overview.moneyOutBreakdown.map((row, index) => (
                  <div key={row.categoryId ?? row.categoryCode ?? index}>
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {categoryLabel(row)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {t("companyFinance.overview.transactionCount", {
                            count: row.transactionCount,
                          })}
                        </p>
                      </div>
                      <div className="text-end">
                        <p
                          className="font-mono text-sm font-semibold tabular-nums"
                          dir="ltr"
                        >
                          {amountText(row.amount)}
                        </p>
                        <p className="text-[11px] text-slate-500" dir="ltr">
                          {percentText(row.percentageOfTotalMoneyOut)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${row.percentageOfTotalMoneyOut}%` }}
                      />
                    </div>
                  </div>
                ))}
                {!overview.moneyOutBreakdown.length && <FinanceEmpty />}
              </div>
            </section>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("companyFinance.overview.documentationSummary")}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                {[
                  ["documented", overview.documentation.documentedCount],
                  [
                    "partiallyDocumented",
                    overview.documentation.partiallyDocumentedCount,
                  ],
                  ["undocumented", overview.documentation.undocumentedCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`rounded-md border p-3 ${label === "undocumented" ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20" : "border-border bg-slate-50/50 dark:bg-slate-900/30"}`}
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t(`companyFinance.overview.${label}`)}
                    </p>
                    <p className="mt-1 text-xl font-bold" dir="ltr">
                      {Number(value).toLocaleString("en-US")}
                    </p>
                  </div>
                ))}
                <div className="rounded-md border border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("companyFinance.overview.undocumentedAmount")}
                  </p>
                  <p
                    className="mt-1 font-mono text-lg font-bold tabular-nums"
                    dir="ltr"
                  >
                    {amountText(overview.documentation.undocumentedAmount)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {baseCurrencyLabel}
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("companyFinance.overview.pendingWorkflow")}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["draft", overview.pending.draftCount],
                  ["pendingReview", overview.pending.pendingReviewCount],
                  [
                    "approvedNotConfirmed",
                    overview.pending.approvedNotConfirmedCount,
                  ],
                  ["rejected", overview.pending.rejectedCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border bg-slate-50/50 p-3 dark:bg-slate-900/30"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t(`companyFinance.overview.${label}`)}
                    </p>
                    <p className="mt-1 text-xl font-bold" dir="ltr">
                      {Number(value).toLocaleString("en-US")}
                    </p>
                  </div>
                ))}
                {[
                  [
                    "pendingMoneyInAmount",
                    overview.pending.pendingMoneyInAmount,
                  ],
                  [
                    "pendingMoneyOutAmount",
                    overview.pending.pendingMoneyOutAmount,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border bg-slate-50/50 p-3 dark:bg-slate-900/30"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t(`companyFinance.overview.${label}`)}
                    </p>
                    <p
                      className="mt-1 font-mono text-base font-bold tabular-nums"
                      dir="ltr"
                    >
                      {amountText(Number(value))}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {baseCurrencyLabel}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("companyFinance.overview.recentActivity")}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t("companyFinance.overview.recentActivityHint")}
              </p>
            </div>
            {detailsError && (
              <p className="border-b border-border px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                {detailsError}
              </p>
            )}
            <div className="admin-table-viewport">
              <table className="admin-data-table min-w-[1050px] divide-y dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    {[
                      "reference",
                      "date",
                      "type",
                      "description",
                      "amount",
                      "status",
                      "accountMovement",
                      "createdBy",
                    ].map((column) => (
                      <th
                        key={column}
                        className={column === "amount" ? "text-end" : ""}
                      >
                        {t(`companyFinance.overview.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overview.recentActivity.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      onClick={() => openDetails(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") openDetails(item.id);
                      }}
                      className="h-14 cursor-pointer hover:bg-slate-50/70 focus:bg-primary/5 focus:outline-none dark:hover:bg-slate-800/40"
                    >
                      <td className="font-mono text-xs font-semibold" dir="ltr">
                        {safeText(item.reference)}
                      </td>
                      <td className="whitespace-nowrap text-xs" dir="ltr">
                        {new Date(item.transactionDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>
                      <td>{recentTypeLabel(item)}</td>
                      <td>
                        <p className="max-w-xs truncate">
                          {safeText(item.description)}
                        </p>
                      </td>
                      <td
                        className="whitespace-nowrap text-end font-mono text-xs font-semibold tabular-nums"
                        dir="ltr"
                      >
                        {amountText(item.amount)} {item.currency}
                      </td>
                      <td>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {enumLabel("statuses", item.status)}
                        </span>
                      </td>
                      <td>
                        <p className="max-w-48 truncate text-xs">
                          {safeText(item.sourceAccountName)}{" "}
                          <span className="text-slate-400">→</span>{" "}
                          {safeText(item.destinationAccountName)}
                        </p>
                      </td>
                      <td>{safeText(item.createdByDisplayName)}</td>
                    </tr>
                  ))}
                  {!overview.recentActivity.length && (
                    <tr>
                      <td colSpan={8}>
                        <FinanceEmpty />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {details && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="overview-details-title"
        >
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-5 text-foreground shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 id="overview-details-title" className="font-bold" dir="ltr">
                {details.referenceNumber}
              </h3>
              <button type="button" onClick={() => setDetails(null)}>
                {t("common.close")}
              </button>
            </div>
            <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
              <dt className="text-slate-500">
                {t("companyFinance.overview.description")}
              </dt>
              <dd>{safeText(details.description)}</dd>
              <dt className="text-slate-500">
                {t("companyFinance.overview.amount")}
              </dt>
              <dd dir="ltr">
                {amountText(details.amount)} {details.currency}
              </dd>
              <dt className="text-slate-500">
                {t("companyFinance.overview.status")}
              </dt>
              <dd>{enumLabel("statuses", details.status)}</dd>
              <dt className="text-slate-500">
                {t("companyFinance.overview.accountMovement")}
              </dt>
              <dd>
                {safeText(details.sourceAccountName)} →{" "}
                {safeText(details.destinationAccountName)}
              </dd>
              <dt className="text-slate-500">
                {t("companyFinance.overview.notes")}
              </dt>
              <dd>{safeText(details.notes)}</dd>
            </dl>
            <FinanceTransactionHistory
              transaction={details}
              statusLabel={enumLabel("statuses", details.status)}
            />
            <div className="mt-5 border-t border-border pt-4">
              <FinanceWorkflowActions
                transaction={details}
                onEdit={() => navigate(details.transactionType === "MoneyOut" ? `/admin/company-finance/money-out/${details.id}/edit` : `/admin/company-finance/money-in/${details.id}/edit`)}
                onUpdated={(updated) => {
                  setDetails(updated);
                  void load();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
