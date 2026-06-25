import { api } from '@/shared/http/api';
import type { ApiResponse } from '@/shared/types/auction.types';
import type {
  PrivateConversation,
  PrivateMessage,
  ChatRoom,
  RoomMessage,
} from '@/shared/types/chat.types';

class ChatService {
  // --- Private Conversations ---
  
  // GET /api/chat/conversations/
  async listConversations(): Promise<ApiResponse<PrivateConversation[]>> {
    const response = await api.get<ApiResponse<PrivateConversation[]>>('/chat/conversations/');
    return response.data;
  }

  // GET /api/chat/conversations/{id}/messages/
  async listPrivateMessages(conversationId: number): Promise<ApiResponse<PrivateMessage[]>> {
    const response = await api.get<ApiResponse<PrivateMessage[]>>(`/chat/conversations/${conversationId}/messages/`);
    return response.data;
  }

  // POST /api/chat/conversations/send/
  async sendPrivateMessage(recipientId: number, message: string): Promise<ApiResponse<PrivateMessage>> {
    const response = await api.post<ApiResponse<PrivateMessage>>('/chat/conversations/send/', {
      recipient_id: recipientId,
      message,
    });
    return response.data;
  }

  // POST /api/chat/conversations/{id}/read/
  async markAsRead(conversationId: number): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>(`/chat/conversations/${conversationId}/read/`);
    return response.data;
  }

  // DELETE /api/chat/conversations/messages/{messageId}/
  async deletePrivateMessage(messageId: number): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/chat/conversations/messages/${messageId}/`);
    return response.data;
  }

  // --- Auction Chat Rooms ---

  // GET /api/chat/auctions/{auctionId}/room/
  async getAuctionRoom(auctionId: number): Promise<ApiResponse<ChatRoom>> {
    const response = await api.get<ApiResponse<ChatRoom>>(`/chat/auctions/${auctionId}/room/`);
    return response.data;
  }

  // GET /api/chat/auctions/{auctionId}/messages/
  async listAuctionMessages(auctionId: number): Promise<ApiResponse<RoomMessage[]>> {
    const response = await api.get<ApiResponse<RoomMessage[]>>(`/chat/auctions/${auctionId}/messages/`);
    return response.data;
  }

  // POST /api/chat/auctions/{auctionId}/send/
  async sendAuctionMessage(auctionId: number, message: string): Promise<ApiResponse<RoomMessage>> {
    const response = await api.post<ApiResponse<RoomMessage>>(`/chat/auctions/${auctionId}/send/`, {
      message,
    });
    return response.data;
  }

  // DELETE /api/chat/auctions/messages/{messageId}/
  async deleteAuctionMessage(messageId: number): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/chat/auctions/messages/${messageId}/`);
    return response.data;
  }
}

const chatService = new ChatService();
export default chatService;
