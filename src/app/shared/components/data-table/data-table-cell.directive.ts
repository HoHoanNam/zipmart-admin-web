import { Directive, TemplateRef, input } from '@angular/core';

/**
 * Marks an `<ng-template>` projected into `<app-data-table>` as the custom
 * cell renderer for one column, e.g.
 * `<ng-template appDataTableCell="status" let-row>...</ng-template>`.
 * Columns without a matching template fall back to plain `row[column.key]`
 * interpolation.
 */
@Directive({
  selector: '[appDataTableCell]',
})
export class DataTableCellDirective {
  readonly columnKey = input.required<string>({ alias: 'appDataTableCell' });

  constructor(readonly templateRef: TemplateRef<{ $implicit: unknown; row: unknown }>) {}
}
