export const ReportTargetType = {
  USER: "USER",
  MESSAGE: "MESSAGE",
  PRIVATE_MESSAGE: "PRIVATE_MESSAGE",
  AUCTION: "AUCTION",
  AUCTION_ITEM: "AUCTION_ITEM",
  BID: "BID",
  STREAM: "STREAM",
  FILE: "FILE",
} as const;

export type ReportTargetType = typeof ReportTargetType[keyof typeof ReportTargetType];

export const ReportReason = {
  SPAM: "SPAM",
  HARASSMENT: "HARASSMENT",
  SCAM: "SCAM",
  HATE_SPEECH: "HATE_SPEECH",
  FRAUD: "FRAUD",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",
  COPYRIGHT: "COPYRIGHT",
  OTHER: "OTHER",
} as const;

export type ReportReason = typeof ReportReason[keyof typeof ReportReason];

export const ReportStatus = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
  IGNORED: "IGNORED",
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export interface ReportReporter {
  id: number;
  username: string;
  full_name: string;
  avatar_url?: string;
}

export interface Report {
  id: number;
  reporter: ReportReporter;
  target_type: ReportTargetType | string;
  target_id: number;
  reason: ReportReason | string;
  description: string;
  status: ReportStatus | string;
  created_at: string;
  updated_at: string;
}

export interface ReportCreatePayload {
  target_type: ReportTargetType | string;
  target_id: number;
  reason: ReportReason | string;
  description?: string;
}
