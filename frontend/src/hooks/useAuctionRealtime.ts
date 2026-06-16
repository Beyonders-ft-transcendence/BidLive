import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ENV from "@/utils/env.utils";
import auctionService from "@/services/auction.service";
import type { Auction, Bid } from "@/types/auction.types";
import {
  useAuctionQuery,
  useAuctionBidsQuery,
  useAuctionStreamsQuery,
} from "./useAuction";

export function useAuctionRealtime(id: number) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isWatchingStream, setIsWatchingStream] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);

  const hasToken =
    typeof window !== "undefined" &&
    !!window.localStorage.getItem("bidlive.auth.access_token");

  // React Query Queries
  const { data: auction, isLoading: loadingAuction, error: auctionQueryError } = useAuctionQuery(id);
  const { data: bidsData, isLoading: loadingBids } = useAuctionBidsQuery(id);
  const { data: streamsData } = useAuctionStreamsQuery(id, hasToken);

  const bids = bidsData?.results || [];
  const activeStream = streamsData?.find((s: any) => s.status === "LIVE") || null;

  const loading = loadingAuction || loadingBids;

  // Initialize stream view state
  useEffect(() => {
    if (activeStream) {
      setIsWatchingStream(true);
      setViewerCount(activeStream.viewer_count || 1);
    }
  }, [activeStream]);

  // Handle errors
  useEffect(() => {
    if (auctionQueryError) {
      setError("Não foi possível carregar os detalhes do leilão.");
    }
  }, [auctionQueryError]);

  useEffect(() => {
    if (!id || isNaN(id)) return;

    // Setup WebSocket for Real-time Updates and Bidding
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("bidlive.auth.access_token")
        : null;

    const wsUrl = `${ENV.WS_BASE_URL}/ws/auctions/${id}/${
      token ? `?token=${token}` : ""
    }`;

    try {
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "auction_snapshot" && data.payload) {
            queryClient.setQueryData(["auction", id], data.payload);
            if (data.payload.active_connections !== undefined) {
              setViewerCount(data.payload.active_connections);
            }
          } else if (data.event === "BID_CREATED" && data.payload) {
            if (data.payload.bid) {
              queryClient.setQueryData(["auctionBids", id], (prev: any) => {
                if (!prev) return { results: [data.payload.bid] };
                return {
                  ...prev,
                  results: [data.payload.bid, ...(prev.results || [])],
                };
              });
            }
            if (data.payload.auction) {
              queryClient.setQueryData(["auction", id], data.payload.auction);
            }
          } else if (data.event === "TIMER_UPDATED" && data.payload) {
            if (data.payload.auction) {
              queryClient.setQueryData(["auction", id], data.payload.auction);
            }
          } else if (
            (data.event === "USER_JOINED" || data.event === "USER_LEFT") &&
            data.payload
          ) {
            if (data.payload.active_connections !== undefined) {
              setViewerCount(data.payload.active_connections);
            }
          } else if (data.event === "bid_accepted") {
            setBidAmount("");
            setSubmittingBid(false);
          } else if (data.event === "bid_error") {
            let errorMsg = "Erro ao processar o lance.";
            if (data.payload?.errors && data.payload.errors.length > 0) {
              const firstErr = data.payload.errors[0];
              if (typeof firstErr === "object") {
                errorMsg = Object.values(firstErr).flat().join(" ");
              } else if (typeof firstErr === "string") {
                errorMsg = firstErr;
              }
            }
            setError(errorMsg);
            setSubmittingBid(false);
          }
        } catch (err) {
          console.error("Erro ao processar mensagem do WebSocket:", err);
        }
      };

      socket.onerror = (event) => {
        if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
          console.error("Erro na conexão WebSocket:", event);
        }
      };

      socket.onclose = () => {
        ws.current = null;
      };
    } catch (err) {
      console.error("Erro ao inicializar WebSocket:", err);
    }

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.onerror = null;
        ws.current.close();
      }
    };
  }, [id, queryClient]);

  useEffect(() => {
    if (auction) {
      const cPrice = Number(
        auction.item.current_price || auction.item.starting_price
      );
      const inc = Number(auction.item.minimum_increment || 1);
      const newMinBid = cPrice + inc;

      setBidAmount((prev) => {
        if (!prev || Number(prev) < newMinBid) {
          return String(newMinBid);
        }
        return prev;
      });
    }
  }, [
    auction?.item?.current_price,
    auction?.item?.starting_price,
    auction?.item?.minimum_increment,
  ]);

  const placeBid = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!bidAmount || !auction) return;

      if (
        typeof window !== "undefined" &&
        !localStorage.getItem("bidlive.auth.access_token")
      ) {
        router.push("/signin");
        return;
      }

      setSubmittingBid(true);
      setError(null);

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({ action: "place_bid", amount: bidAmount })
        );
      } else {
        // Fallback HTTP
        try {
          const res = await auctionService.placeBid(id, { amount: bidAmount });
          if (res.success && res.data) {
            setBidAmount("");
            queryClient.invalidateQueries({ queryKey: ["auction", id] });
            queryClient.invalidateQueries({ queryKey: ["auctionBids", id] });
          } else {
            if (res.errors) {
              setError(Object.values(res.errors).flat().join(" "));
            } else {
              setError(res.message || "Erro ao registrar lance.");
            }
          }
        } catch (err: any) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            router.push("/signin");
          } else if (err.response?.data) {
            const errorData = err.response.data;
            if (errorData.errors) {
              setError(Object.values(errorData.errors).flat().join(" "));
            } else {
              setError(
                errorData.message || "Valor inválido. Verifique o seu lance."
              );
            }
          } else {
            setError("Erro de conexão. Não foi possível registrar o lance.");
          }
        } finally {
          setSubmittingBid(false);
        }
      }
    },
    [bidAmount, auction, id, router, queryClient]
  );

  return {
    auction,
    bids,
    loading,
    error,
    activeStream,
    isWatchingStream,
    setIsWatchingStream,
    viewerCount,
    bidAmount,
    setBidAmount,
    submittingBid,
    placeBid,
  };
}
