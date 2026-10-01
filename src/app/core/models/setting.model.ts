/** Key-value system config (Infra B.4). Value shape varies per key — known keys are typed loosely as `unknown` and interpreted by the UI; unrecognized keys still round-trip via the generic JSON editor. */
export interface Setting {
  key: string;
  value: unknown;
  updatedAt: string;
}

export type SettingsMap = Record<string, Setting>;

/** Seeded keys per the plan doc (§B.4) — `payment_gateway_enabled` only reflects configured/not-configured status, secrets are never stored in this table. */
export const KNOWN_SETTING_KEYS = ['shipping_fee', 'vat_rate', 'payment_gateway_enabled'] as const;
