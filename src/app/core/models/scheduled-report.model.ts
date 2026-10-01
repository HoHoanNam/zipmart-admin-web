export type ScheduledReportFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ScheduledReportFrequency;
  /** Emails to receive the report — sent via Infra F (nodemailer). */
  recipients: string[];
  reportType: string;
  active: boolean;
  createdAt: string;
  lastRunAt: string | null;
}

export interface CreateScheduledReportInput {
  name: string;
  frequency: ScheduledReportFrequency;
  recipients: string[];
  reportType: string;
  active?: boolean;
}

export type UpdateScheduledReportInput = Partial<CreateScheduledReportInput>;
