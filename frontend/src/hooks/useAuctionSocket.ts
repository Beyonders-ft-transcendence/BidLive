/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

const WS_BASE = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000').replace(/\/$/, '');

export function useAuctionSocket(
  auctionId: string | null,
  onEvent: (type: string, data: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!auctionId) return;

    function connect() {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

      const token = localStorage.getItem('bidlive_access') || '';
      const url = `${WS_BASE}/ws/auctions/${auctionId}/?token=${encodeURIComponent(token)}`;

      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const type = payload.event || payload.type || payload.action || 'message';
          const data = payload.payload ?? payload.data ?? payload;
          onEventRef.current(type, data);
        } catch (err) {
          console.error('[WS] Error parsing message:', err, event.data);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 4000);
      };

      ws.onerror = () => {
        // onclose handles reconnect
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [auctionId]);

  const placeBidViaSocket = (amount: number) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'place_bid',
          amount: amount.toFixed(2),
        })
      );
      return true;
    }
    return false;
  };

  const ping = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'ping' }));
    }
  };

  return { isConnected, placeBidViaSocket, ping };
}
