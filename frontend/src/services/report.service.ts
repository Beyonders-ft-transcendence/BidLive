import { api } from "@/shared/http/api";
import type { Report, ReportCreatePayload } from "@/shared/types/report.types";
import type { ApiResponse } from "@/shared/types/auction.types";

class ReportService {
  async createReport(payload: ReportCreatePayload): Promise<ApiResponse<Report>> {
    const response = await api.post<ApiResponse<Report>>("/reports/", payload);
    return response.data;
  }

  async getMyReports(): Promise<ApiResponse<Report[]>> {
    const response = await api.get<ApiResponse<Report[]>>("/reports/mine/");
    return response.data;
  }
}

const reportService = new ReportService();
export default reportService;
