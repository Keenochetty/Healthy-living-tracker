export type AppLockTiming =
  | "immediately"
  | "after_1_minute"
  | "after_5_minutes";

export type AppLockSettings = {
  enabled: boolean;
  timing: AppLockTiming;
};

export type SecurityActivity = {
  createdAt: string;
  id: string;
  title: string;
};

export type TotpEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};
