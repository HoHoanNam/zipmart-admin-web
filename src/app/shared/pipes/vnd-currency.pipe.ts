import { Pipe, type PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

@Pipe({ name: 'vndCurrency' })
export class VndCurrencyPipe implements PipeTransform {
  transform(value: string | number): string {
    return formatter.format(Number(value));
  }
}
