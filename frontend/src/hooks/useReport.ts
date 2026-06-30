import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import reportService from "@/services/report.service";
import type { ReportCreatePayload } from "@/shared/types/report.types";

export function useCreateReport() {
  return useMutation({
    mutationFn: (payload: ReportCreatePayload) => reportService.createReport(payload),
    onSuccess: () => {
      toast.success("Denúncia submetida com sucesso! A nossa equipa irá analisar brevemente.");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.errors?.detail || "Ocorreu um erro ao submeter a denúncia.";
      toast.error(errorMessage);
    },
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: ["my-reports"],
    queryFn: () => reportService.getMyReports(),
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
}
