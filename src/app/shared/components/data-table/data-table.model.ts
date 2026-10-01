export interface DataTableColumn {
  /** Property key on the row (dotted paths not supported — use a cell template for derived values). */
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  /** Extra classes appended to both the `<th>` and every `<td>` in this column. */
  cellClass?: string;
}
