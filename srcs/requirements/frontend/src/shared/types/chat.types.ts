export interface ChatUser {
  id: number;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_online: boolean;
}

export interface LastMessage {
  id: number;
  message: string;
  sender_id: number;
  created_at: string;
}

export interface PrivateConversation {
  id: number;
  user_one: ChatUser;
  user_two: ChatUser;
  last_message: LastMessage | null;
  unread_count: number;
  created_at: string;
}

export interface PrivateMessage {
  id: number;
  conversation: number;
  sender: ChatUser;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  auction: number | null;
  name: string;
  created_at: string;
}

export interface RoomMessage {
  id: number;
  room: number;
  sender: ChatUser;
  message: string;
  is_deleted: boolean;
  created_at: string;
}
