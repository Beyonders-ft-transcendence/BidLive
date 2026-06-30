import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ENV from "@/shared/utils/env.utils";
import { useAuthStore } from "@/shared/stores/auth.store";
import {
  useAuctionQuery,
  useAuctionBidsQuery,
  useAuctionStreamsQuery,
  usePlaceBidMutation,
  useBuyNowMutation,
} from "./useAuction";

export function useAuctionRealtime(id: number) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated);
  const accessToken = useAuthStore((s: any) => s.accessToken);

  const [isWatchingStream, setIsWatchingStream] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);

  // React Query Queries
  const { data: auction, isLoading: loadingAuction, error: auctionQueryError } = useAuctionQuery(id);
  const { data: bidsData, isLoading: loadingBids } = useAuctionBidsQuery(id);
  const { data: streamsData } = useAuctionStreamsQuery(id, isAuthenticated);

  const placeBidMutation = usePlaceBidMutation();
  const buyNowMutation = useBuyNowMutation();

  const bids = bidsData?.results || [];
  const activeStream = streamsData?.find((s: any) => s.status === "LIVE") || null;

  const loading = loadingAuction || loadingBids;

  const [hasInitializedStream, setHasInitializedStream] = useState(false);

  // Initialize stream view state
  useEffect(() => {
    if (activeStream && !hasInitializedStream) {
      setIsWatchingStream(true);
      setViewerCount(activeStream.viewer_count || 1);
      setHasInitializedStream(true);
    }
  }, [activeStream, hasInitializedStream]);

  useEffect(() => {
    if (!id || isNaN(id) || !accessToken) return;

    // Setup WebSocket for Real-time Updates and Bidding
    const token = accessToken;

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
            queryClient.setQueryData(["auction", id], (prev: any) => {
              if (!prev) {
                return {
                  id: data.payload.auction_id,
                  status: data.payload.status,
                  start_time: data.payload.start_time,
                  end_time: data.payload.end_time,
                  reserve_met: data.payload.reserve_met,
                  item: {
                    id: data.payload.auction_id,
                    current_price: data.payload.current_price,
                    starting_price: data.payload.current_price,
                  }
                };
              }
              return {
                ...prev,
                status: data.payload.status !== undefined ? data.payload.status : prev.status,
                start_time: data.payload.start_time !== undefined ? data.payload.start_time : prev.start_time,
                end_time: data.payload.end_time !== undefined ? data.payload.end_time : prev.end_time,
                reserve_met: data.payload.reserve_met !== undefined ? data.payload.reserve_met : prev.reserve_met,
                winner: data.payload.winner_id !== undefined ? data.payload.winner_id : prev.winner,
                item: prev.item ? {
                  ...prev.item,
                  current_price: data.payload.current_price !== undefined ? data.payload.current_price : prev.item.current_price,
                } : {
                  current_price: data.payload.current_price,
                  starting_price: data.payload.current_price,
                },
              };
            });
            if (data.payload.active_connections !== undefined) {
              setViewerCount(data.payload.active_connections);
            }
          } else if (data.event === "new_bid" && data.payload) {
            const newBid = {
              id: data.payload.bid_id,
              auction: data.payload.auction_id,
              auction_id: data.payload.auction_id,
              bidder: data.payload.bidder,
              bidder_id: data.payload.bidder ? data.payload.bidder.id : 0,
              amount: data.payload.bid_amount,
              is_buy_now: !!data.payload.is_buy_now,
              ip_address: "",
              metadata: data.payload.metadata || null,
              timestamp: data.payload.timestamp,
              created_at: data.payload.timestamp,
            };

            queryClient.setQueriesData({ queryKey: ["auctionBids", id] }, (prev: any) => {
              if (!prev) return { results: [newBid] };
              const results = prev.results || [];
              if (results.some((b: any) => b.id === newBid.id)) return prev;
              return {
                ...prev,
                results: [newBid, ...results],
              };
            });

            queryClient.setQueryData(["auction", id], (prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                item: prev.item ? {
                  ...prev.item,
                  current_price: data.payload.current_price || prev.item.current_price,
                } : undefined,
              };
            });
          } else if (
            (data.event === "timer_update" ||
              data.event === "auction_started" ||
              data.event === "auction_ended" ||
              data.event === "auction_cancelled" ||
              data.event === "auction_updated") &&
            data.payload
          ) {
            queryClient.setQueryData(["auction", id], (prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                status: data.payload.status || prev.status,
                end_time: data.payload.end_time || prev.end_time,
                winner: data.payload.winner_id !== undefined ? data.payload.winner_id : prev.winner,
              };
            });
          } else if (
            (data.event === "user_joined" || data.event === "user_left") &&
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

  // Clean up auction queries from cache when navigating away (unmounting)
  useEffect(() => {
    return () => {
      if (id && !isNaN(id)) {
        queryClient.removeQueries({ queryKey: ["auction", id] });
        queryClient.removeQueries({ queryKey: ["auctionBids", id] });
        queryClient.removeQueries({ queryKey: ["auctionStreams", id] });
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
    async (amountOrEvent?: string | React.FormEvent) => {
      let amount = bidAmount;
      if (amountOrEvent) {
        if (typeof amountOrEvent === "string") {
          amount = amountOrEvent;
        } else {
          amountOrEvent.preventDefault();
        }
      }

      if (!amount || !auction) return;

      if (!isAuthenticated) {
        navigate("/signin");
        return;
      }

      setSubmittingBid(true);
      setError(null);

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({ action: "place_bid", amount })
        );
      } else {
        // Fallback HTTP using placeBidMutation
        try {
          const res = await placeBidMutation.mutateAsync({ id, payload: { amount } });
          if (res.success) {
            setBidAmount("");
          } else {
            if (res.errors) {
              setError(Object.values(res.errors).flat().join(" "));
            } else {
              setError(res.message || "Erro ao registrar lance.");
            }
          }
        } catch (err: any) {
          if (err.response?.status === 401) {
            navigate("/signin");
          } else if (err.response?.status === 403) {
            setError(err.response?.data?.message || "Permissão negada. Faça logout e login novamente.");
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
    [bidAmount, auction, id, navigate, placeBidMutation]
  );

  const buyNow = useCallback(
    async () => {
      if (!isAuthenticated) {
        navigate("/signin");
        return { success: false, message: "Não autenticado" };
      }
      try {
        const res = await buyNowMutation.mutateAsync(id);
        return res;
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate("/signin");
        }
        const msg = err.response?.data?.message || err.message || "Erro ao realizar compra imediata.";
        return { success: false, message: msg };
      }
    },
    [id, navigate, buyNowMutation, isAuthenticated]
  );

  return {
    auction,
    bids,
    loading,
    auctionError: auctionQueryError ? "Não foi possível carregar os detalhes do leilão." : null,
    bidError: error,
    activeStream,
    isWatchingStream,
    setIsWatchingStream,
    viewerCount,
    bidAmount,
    setBidAmount,
    submittingBid: submittingBid || placeBidMutation.isPending,
    placeBid,
    buyNow,
    submittingBuyNow: buyNowMutation.isPending,
  };
}

export function useGlobalAuctionRealtime() {
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `${ENV.WS_BASE_URL}/ws/auctions/global/`;

    try {
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "GLOBAL_BID_CREATED" && data.payload) {
            queryClient.setQueryData(["auctionActivities"], (oldData: any) => {
              const currentActivities = oldData || [];
              // Add new activity at the beginning and keep only top 10
              return [data.payload, ...currentActivities].slice(0, 10);
            });
          }
        } catch (err) {
          console.error("Failed to parse global websocket message", err);
        }
      };

      socket.onclose = () => {
        console.log("Global WebSocket disconnected.");
      };

      socket.onerror = (err) => {
        console.error("Global WebSocket error:", err);
      };
    } catch (err) {
      console.error("Failed to connect to Global WebSocket", err);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [queryClient]);
}
