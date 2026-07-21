import { api } from '@/shared/http/api';
import type { ApiResponse } from '@/shared/types/auction.types';
import type {
  PublicUser,
  Friendship,
  FriendshipCreatePayload,
  BlockUserPayload,
} from '@/shared/types/social.types';

class SocialService {
  async listFriends(): Promise<ApiResponse<PublicUser[]>> {
    const response = await api.get<ApiResponse<PublicUser[]>>('/social/friendships/');
    return response.data;
  }

  async sendFriendRequest(payload: FriendshipCreatePayload): Promise<ApiResponse<Friendship>> {
    const response = await api.post<ApiResponse<Friendship>>('/social/friendships/', payload);
    return response.data;
  }

  async removeFriend(friendshipId: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/social/friendships/${friendshipId}/`);
    return response.data;
  }

  async acceptFriendRequest(friendshipId: number): Promise<ApiResponse<Friendship>> {
    const response = await api.post<ApiResponse<Friendship>>(`/social/friendships/${friendshipId}/accept/`);
    return response.data;
  }

  async rejectFriendRequest(friendshipId: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.post<ApiResponse<Record<string, never>>>(`/social/friendships/${friendshipId}/reject/`);
    return response.data;
  }

  async listPendingRequestsReceived(): Promise<ApiResponse<Friendship[]>> {
    const response = await api.get<ApiResponse<Friendship[]>>('/social/friendships/requests/received/');
    return response.data;
  }

  async listPendingRequestsSent(): Promise<ApiResponse<Friendship[]>> {
    const response = await api.get<ApiResponse<Friendship[]>>('/social/friendships/requests/sent/');
    return response.data;
  }

  async listOnlineFriends(): Promise<ApiResponse<PublicUser[]>> {
    const response = await api.get<ApiResponse<PublicUser[]>>('/social/friendships/online/');
    return response.data;
  }

  async blockUser(payload: BlockUserPayload): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.post<ApiResponse<Record<string, never>>>('/social/users/block/', payload);
    return response.data;
  }

  async unblockUser(payload: BlockUserPayload): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.post<ApiResponse<Record<string, never>>>('/social/users/unblock/', payload);
    return response.data;
  }

  async listBlockedUsers(): Promise<ApiResponse<PublicUser[]>> {
    const response = await api.get<ApiResponse<PublicUser[]>>('/social/users/blocked/');
    return response.data;
  }

  async searchUsers(query: string): Promise<ApiResponse<{ results: PublicUser[] }>> {
    const response = await api.get<ApiResponse<{ results: PublicUser[] }>>(`/users/?search=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getUserProfile(userId: number): Promise<ApiResponse<PublicUser>> {
    const response = await api.get<ApiResponse<PublicUser>>(`/users/${userId}/`);
    return response.data;
  }
}

const socialService = new SocialService();
export default socialService;
