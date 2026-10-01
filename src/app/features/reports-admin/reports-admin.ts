import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/components/data-table/data-table';
import { DataTableCellDirective } from '../../shared/components/data-table/data-table-cell.directive';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { Modal } from '../../shared/components/modal/modal';
import type { RevenueReport, TopSellingProduct } from '../../core/models/analytics.model';
import type {
  CreateScheduledReportInput,
  ScheduledReport,
  ScheduledReportFrequency,
} from '../../core/models/scheduled-report.model';
import { AnalyticsService } from '../analytics/analytics.service';
import { ScheduledReportsService } from './scheduled-reports.service';

const SCHEDULED_COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Tên báo cáo' },
  { key: 'reportType', label: 'Loại' },
  { key: 'frequency', label: 'Tần suất' },
  { key: 'recipients', label: 'Người nhận' },
  { key: 'active', label: 'Trạng thái' },
  { key: 'lastRunAt', label: 'Lần chạy gần nhất' },
  { key: 'actions', label: '', align: 'right' },
];

const FREQUENCY_LABELS: Record<ScheduledReportFrequency, string> = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
};

const EMPTY_SCHEDULED_FORM: CreateScheduledReportInput = {
  name: '',
  frequency: 'weekly',
  recipients: [],
  reportType: 'revenue',
  active: true,
};

@Component({
  selector: 'app-reports-admin',
  imports: [FormsModule, DatePipe, DecimalPipe, DataTable, DataTableCellDirective, Modal],
  templateUrl: './reports-admin.html',
})
export class ReportsAdmin {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly scheduledReportsService = inject(ScheduledReportsService);

  readonly tab = signal<'revenue' | 'scheduled'>('revenue');

  readonly report = signal<RevenueReport | null>(null);
  readonly topProducts = signal<TopSellingProduct[]>([]);
  readonly loading = signal(true);
  readonly exporting = signal(false);

  /** Empty = let the backend default to the trailing 30 days. */
  from = '';
  to = '';

  readonly scheduledColumns = SCHEDULED_COLUMNS;
  readonly frequencyLabels = FREQUENCY_LABELS;
  readonly scheduledReports = signal<ScheduledReport[]>([]);
  readonly scheduledLoading = signal(true);
  readonly scheduledSaving = signal(false);
  readonly scheduledError = signal<string | null>(null);
  readonly editingScheduledId = signal<string | null>(null);
  scheduledForm = { ...EMPTY_SCHEDULED_FORM };
  recipientsText = '';

  readonly maxDayRevenue = computed(() =>
    Math.max(1, ...(this.report()?.days.map((day) => day.revenue) ?? [])),
  );

  constructor() {
    void this.load();
    void this.loadScheduled();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const range = { from: this.from || undefined, to: this.to || undefined };
      const [report, topProducts] = await Promise.all([
        this.analyticsService.getRevenueReport(range),
        this.analyticsService.getTopProducts(range),
      ]);
      this.report.set(report);
      this.topProducts.set(topProducts);
    } finally {
      this.loading.set(false);
    }
  }

  async exportCsv(): Promise<void> {
    this.exporting.set(true);
    try {
      const range = { from: this.from || undefined, to: this.to || undefined };
      const { filename, csv } = await this.analyticsService.getOrdersCsvExport(range);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exporting.set(false);
    }
  }

  private async loadScheduled(): Promise<void> {
    this.scheduledLoading.set(true);
    try {
      this.scheduledReports.set(await this.scheduledReportsService.findAll());
    } finally {
      this.scheduledLoading.set(false);
    }
  }

  frequencyLabel(frequency: string): string {
    return FREQUENCY_LABELS[frequency as ScheduledReportFrequency] ?? frequency;
  }

  startCreateScheduled(): void {
    this.scheduledError.set(null);
    this.scheduledForm = { ...EMPTY_SCHEDULED_FORM };
    this.recipientsText = '';
    this.editingScheduledId.set('new');
  }

  startEditScheduled(report: ScheduledReport): void {
    this.scheduledError.set(null);
    this.scheduledForm = {
      name: report.name,
      frequency: report.frequency,
      recipients: report.recipients,
      reportType: report.reportType,
      active: report.active,
    };
    this.recipientsText = report.recipients.join(', ');
    this.editingScheduledId.set(report.id);
  }

  closeScheduledForm(): void {
    this.editingScheduledId.set(null);
  }

  async saveScheduled(): Promise<void> {
    const recipients = this.recipientsText
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
    if (!this.scheduledForm.name.trim() || recipients.length === 0) {
      this.scheduledError.set('Nhập tên báo cáo và ít nhất 1 email người nhận.');
      return;
    }

    this.scheduledSaving.set(true);
    this.scheduledError.set(null);
    try {
      const id = this.editingScheduledId();
      const payload = { ...this.scheduledForm, recipients };
      if (id && id !== 'new') {
        await this.scheduledReportsService.update(id, payload);
      } else {
        await this.scheduledReportsService.create(payload);
      }
      this.editingScheduledId.set(null);
      await this.loadScheduled();
    } catch (err) {
      this.scheduledError.set(this.extractErrorMessage(err));
    } finally {
      this.scheduledSaving.set(false);
    }
  }

  async toggleScheduledActive(report: ScheduledReport): Promise<void> {
    await this.scheduledReportsService.update(report.id, { active: !report.active });
    await this.loadScheduled();
  }

  async removeScheduled(report: ScheduledReport): Promise<void> {
    if (!confirm(`Xoá lịch báo cáo "${report.name}"?`)) return;
    await this.scheduledReportsService.remove(report.id);
    await this.loadScheduled();
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const flattened = this.flattenMessage((err.error as { message?: unknown } | undefined)?.message);
      if (flattened) return flattened;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  private flattenMessage(message: unknown): string | null {
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('; ');
    if (message && typeof message === 'object' && 'message' in message) {
      return this.flattenMessage((message as { message?: unknown }).message);
    }
    return null;
  }
}
