import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

/**
 * Shared system-wide currency display pipe. All symbol/name/decimal-digit/formatting
 * resolution is delegated to the Currency Master via CurrencyService. Prefer this
 * over the built-in CurrencyPipe for money shown on Investa screens.
 *
 * Usage: {{ amount | currencyDisplay: 'SAR' }}
 */
@Pipe({ name: 'currencyDisplay', standalone: true })
export class CurrencyDisplayPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number | string | null | undefined, code?: string | null): string {
    const num = typeof value === 'string' ? Number(value) : (value as number);
    return this.currencyService.format(num, code);
  }
}
