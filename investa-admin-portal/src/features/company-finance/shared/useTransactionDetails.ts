/**
 * Shared transaction-details dialog state for finance list pages.
 * Replaces the per-page `details/detailsError/openDetails` trio
 * (identical in Overview / ReviewQueue / MoneyIn).
 */
import { useCallback, useState } from 'react';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { FinanceTransaction } from '../types';

export interface UseTransactionDetails {
  details: FinanceTransaction | null;
  detailsError: string;
  openDetails: (id: number, errorMessage: string) => void;
  closeDetails: () => void;
  replaceDetails: (updated: FinanceTransaction) => void;
}

export function useTransactionDetails(): UseTransactionDetails {
  const [details, setDetails] = useState<FinanceTransaction | null>(null);
  const [detailsError, setDetailsError] = useState('');

  const openDetails = useCallback((id: number, errorMessage: string) => {
    setDetailsError('');
    void companyFinanceService
      .getTransaction(id)
      .then(setDetails)
      .catch(() => setDetailsError(errorMessage));
  }, []);

  const closeDetails = useCallback(() => setDetails(null), []);

  const replaceDetails = useCallback((updated: FinanceTransaction) => {
    setDetails(updated);
  }, []);

  return { details, detailsError, openDetails, closeDetails, replaceDetails };
}
