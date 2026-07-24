import { api } from "@/shared/http/api";
import type { Notification } from "@/shared/types/notification.types";
import type { ApiResponse } from "@/shared/types/auction.types";

class NotificationService {
  async getMyNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await api.get<ApiResponse<Notification[]>>("/notifications/");
    return response.data;
  }

  async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    const response = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read/`);
    return response.data;
  }
}

const notificationService = new NotificationService();
export default notificationService;
