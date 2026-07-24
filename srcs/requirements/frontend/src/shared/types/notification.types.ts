export const NotificationType = {
  NEW_BID: "NEW_BID",
  OUTBID: "OUTBID",
  MESSAGE: "MESSAGE",
  FRIEND_REQUEST: "FRIEND_REQUEST",
  STREAM_STARTED: "STREAM_STARTED",
  STREAM_ENDED: "STREAM_ENDED",
  STREAM_CANCELLED: "STREAM_CANCELLED",
  FEATURED_STREAM: "FEATURED_STREAM",
  AUCTION_ENDED: "AUCTION_ENDED",
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: number;
  user: number;
  type: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
