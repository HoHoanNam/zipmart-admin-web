import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, contentChildren, input, output } from '@angular/core';
import { DataTableCellDirective } from './data-table-cell.directive';
import type { DataTableColumn } from './data-table.model';

/**
 * Generic admin table: columns/rows/loading/pagination as plain inputs,
 * custom per-column rendering via projected `<ng-template appDataTableCell="key" let-row>`
 * (falls back to `row[column.key]` when no template is projected for a column).
 * Every new admin feature (Infra G consumers) should reach for this instead
 * of hand-rolling `<table>` markup.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.html',
})
export class DataTable<T = Record<string, unknown>> {
  readonly columns = input.required<DataTableColumn[]>();
  readonly rows = input<T[]>([]);
  readonly loading = input(false);
  readonly emptyMessage = input('Không có dữ liệu');
  readonly trackByKey = input<string>('id');

  /** Pagination is optional — omit `total`/`pageSize` to render a plain (unpaginated) table. */
  readonly page = input(1);
  readonly pageSize = input<number | null>(null);
  readonly total = input<number | null>(null);
  readonly pageChange = output<number>();

  readonly cellTemplates = contentChildren(DataTableCellDirective);

  readonly showPagination = computed(() => this.pageSize() !== null && this.total() !== null);
  readonly totalPages = computed(() => {
    const size = this.pageSize();
    const total = this.total();
    if (!size || !total) return 1;
    return Math.max(1, Math.ceil(total / size));
  });

  templateFor(columnKey: string) {
    return this.cellTemplates().find((tpl) => tpl.columnKey() === columnKey)?.templateRef;
  }

  cellValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  trackValue(row: T): unknown {
    return (row as Record<string, unknown>)[this.trackByKey()] ?? row;
  }

  goToPage(next: number): void {
    if (next < 1 || next > this.totalPages() || next === this.page()) return;
    this.pageChange.emit(next);
  }
}
