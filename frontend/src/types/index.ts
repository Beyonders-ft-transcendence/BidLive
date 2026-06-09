/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  balance: number;
  status: 'ACTIVE' | 'BANNED';
  bio: string;
  permissions: string[];
}

export type AuctionStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  startPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  minIncrement: number;
  currentBidderId: string | null;
  currentBidderName: string | null;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  views: number;
  watches: number;
  creatorId: string;
  creatorName: string;
  bidsCount: number;
  streamId: string | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderName: string;
  bidderAvatar: string;
  amount: number;
  timestamp: string;
  status: 'SUCCESS' | 'OVERBID' | 'RETRACTED';
}

export interface Stream {
  id: string;
  title: string;
  auctionId: string;
  auctionTitle: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar: string;
  viewersCount: number;
  rtmpKey: string;
  status: 'LIVE' | 'ENDED' | 'SCHEDULED';
  startedAt: string | null;
}

export interface Message {
  id: string;
  roomId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  role?: UserRole;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'BID_WON' | 'OUTBID' | 'LIVE_START' | 'SYSTEM' | 'SECURITY';
  read: boolean;
  timestamp: string;
}

export interface Report {
  id: string;
  auctionId: string;
  auctionTitle: string;
  reporterName: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  timestamp: string;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  module: string;
  message: string;
  details: string;
  timestamp: string;
}
