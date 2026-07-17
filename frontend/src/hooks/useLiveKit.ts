import { useQuery } from "@tanstack/react-query";
import auctionService from "@/services/auction.service";
import type { LiveKitTokenRequest } from "@/shared/types/auction.types";

export type LiveKitRole = NonNullable<LiveKitTokenRequest["role"]>;

interface HttpErrorLike {
  response?: { status?: number; data?: { message?: string } };
}

/** Extrai o status HTTP de um erro estilo axios. */
export function getHttpStatus(error: unknown): number | undefined {
  return (error as HttpErrorLike | undefined)?.response?.status;
}

/** Extrai a mensagem de erro enviada pelo backend, quando existir. */
export function getBackendErrorMessage(error: unknown): string | undefined {
  return (error as HttpErrorLike | undefined)?.response?.data?.message;
}

// O backend emite tokens com TTL padrão de 60min; mantemos o cache abaixo disso.
const TOKEN_STALE_TIME_MS = 50 * 60 * 1000;

/**
 * Solicita as credenciais de acesso à sala LiveKit de um stream.
 * Backend: POST /auctions/:id/streams/:pk/livekit-token/
 *
 * Regras do backend:
 * - role "viewer": só é emitido quando o stream está LIVE (somente assinatura);
 * - role "broadcaster": emitido enquanto o stream não estiver ENDED/CANCELLED,
 *   apenas para o vendedor/streamer/admin (permite publicar).
 */
export function useLiveKitTokenQuery(
  auctionId: number | undefined,
  streamId: number | undefined,
  role: LiveKitRole,
  enabled = true,
) {
  return useQuery({
    queryKey: ["livekitToken", auctionId, streamId, role],
    queryFn: async () => {
      const res = await auctionService.getLiveKitToken(auctionId!, streamId!, { role });
      if (!res.success || !res.data) {
        throw new Error(res.message || "Falha ao obter acesso à transmissão.");
      }
      return res.data;
    },
    enabled: !!auctionId && !isNaN(auctionId) && !!streamId && enabled,
    staleTime: TOKEN_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      const status = getHttpStatus(error);
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Contagem e lista de espectadores registrados no stream, com polling.
 * Backend: GET /auctions/:id/streams/:pk/viewers/
 */
export function useStreamViewersQuery(
  auctionId: number | undefined,
  streamId: number | undefined,
  enabled = true,
  refetchIntervalMs: number | false = 5000,
) {
  return useQuery({
    queryKey: ["streamViewers", auctionId, streamId],
    queryFn: async () => {
      const res = await auctionService.listStreamViewers(auctionId!, streamId!);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Falha ao obter espectadores.");
      }
      return res.data;
    },
    enabled: !!auctionId && !isNaN(auctionId) && !!streamId && enabled,
    refetchInterval: refetchIntervalMs,
    retry: false,
  });
}
