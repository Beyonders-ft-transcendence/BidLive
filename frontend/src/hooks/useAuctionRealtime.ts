import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ENV from "@/utils/env.utils";
import auctionService from "@/services/auction.service";
import type { Auction, Bid } from "@/types/auction.types";

export function useAuctionRealtime(id: number) {
  const router = useRouter();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStream, setActiveStream] = useState<any | null>(null);
  const [isWatchingStream, setIsWatchingStream] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const [bidAmount, setBidAmount] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const hasToken =
          typeof window !== "undefined" &&
          !!window.localStorage.getItem("bidlive.auth.access_token");

        const promises: Promise<any>[] = [
          auctionService.retrieve(id),
          auctionService.listBids(id),
        ];

        if (hasToken) {
          promises.push(auctionService.listStreams(id));
        }

        const results = await Promise.allSettled(promises);
        const auctionResult = results[0];
        const bidsResult = results[1];
        const streamResult = hasToken ? results[2] : null;

        if (
          auctionResult.status === "fulfilled" &&
          auctionResult.value?.success
        ) {
          setAuction(auctionResult.value.data || null);
        } else {
          setError("Não foi possível carregar os detalhes do leilão.");
        }

        if (bidsResult.status === "fulfilled" && bidsResult.value?.success) {
          setBids(bidsResult.value.data?.results || []);
        }

        if (
          streamResult &&
          streamResult.status === "fulfilled" &&
          streamResult.value?.success &&
          streamResult.value.data
        ) {
          const live = streamResult.value.data.find(
            (s: any) => s.status === "LIVE"
          );
          setActiveStream(live || null);
          if (live) {
            setIsWatchingStream(true);
            setViewerCount(live.viewer_count || 1);
          }
        }
      } catch (err) {
        setError("Erro de conexão ao carregar os detalhes do leilão.");
      } finally {
        setLoading(false);
      }
    }

    loadData();

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
            setAuction(data.payload);
            if (data.payload.active_connections !== undefined) {
              setViewerCount(data.payload.active_connections);
            }
          } else if (data.event === "BID_CREATED" && data.payload) {
            if (data.payload.bid) {
              setBids((prev) => [data.payload.bid, ...prev]);
            }
            if (data.payload.auction) {
              setAuction(data.payload.auction);
            }
          } else if (data.event === "TIMER_UPDATED" && data.payload) {
            if (data.payload.auction) {
              setAuction(data.payload.auction);
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

      socket.onerror = (error) => {
        console.error("WebSocket erro:", error);
      };

      socket.onclose = () => {
        ws.current = null;
      };
    } catch (err) {
      console.error("Erro ao inicializar WebSocket:", err);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id]);

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
            const [aRes, bRes] = await Promise.all([
              auctionService.retrieve(id),
              auctionService.listBids(id),
            ]);
            if (aRes.success && aRes.data) setAuction(aRes.data);
            if (bRes.success && bRes.data) setBids(bRes.data.results);
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
    [bidAmount, auction, id, router]
  );

  return {
    auction,
    bids,
    loading,
    error,
    activeStream,
    isWatchingStream,
    viewerCount,
    bidAmount,
    setBidAmount,
    submittingBid,
    placeBid,
  };
}
