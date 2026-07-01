"""
Custom logging utilities for sending structured JSON logs to Logstash.

Provides:
- JSONFormatter: Formats log records as JSON with metadata (timestamp, level, logger,
  request_id, user_id, service_name).
- LogstashTCPHandler: Sends JSON-formatted logs to Logstash via TCP socket with
  automatic reconnection on failure.
"""

import json
import logging
import socket
import threading
import time
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """
    Formats log records as JSON objects for structured logging.

    Includes standard fields plus optional context from the log record:
    - request_id: From RequestIDMiddleware
    - user_id: From authentication context
    - path, method, status_code: From request logging
    """

    def format(self, record):
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "service_name": "django-backend",
        }

        # Add optional context fields if present on the log record
        optional_fields = [
            "request_id",
            "user_id",
            "path",
            "method",
            "status_code",
            "ip_address",
            "user_agent",
            "duration_ms",
        ]
        for field in optional_fields:
            value = getattr(record, field, None)
            if value is not None:
                log_entry[field] = value

        # Add exception info if present
        if record.exc_info and record.exc_info[1]:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info),
            }

        return json.dumps(log_entry, default=str)


class LogstashTCPHandler(logging.Handler):
    """
    Sends log records to Logstash via TCP socket.

    Features:
    - Automatic reconnection with exponential backoff
    - Thread-safe socket operations
    - Non-blocking: drops logs silently if Logstash is unreachable
      (logs still go to console via the console handler)
    """

    def __init__(self, host="logstash", port=5000, timeout=5, max_retries=3):
        super().__init__()
        self.host = host
        self.port = port
        self.timeout = timeout
        self.max_retries = max_retries
        self.sock = None
        self._lock = threading.Lock()
        self._last_connect_attempt = 0
        self._backoff_seconds = 5

    def _connect(self):
        """Establish TCP connection to Logstash with backoff."""
        now = time.time()
        # Don't retry too frequently
        if now - self._last_connect_attempt < self._backoff_seconds:
            return False

        self._last_connect_attempt = now

        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(self.timeout)
            self.sock.connect((self.host, self.port))
            self._backoff_seconds = 5  # Reset backoff on success
            return True
        except (socket.error, OSError):
            self.sock = None
            # Increase backoff (max 60 seconds)
            self._backoff_seconds = min(self._backoff_seconds * 2, 60)
            return False

    def _send(self, data):
        """Send data over the TCP socket."""
        if self.sock is None:
            if not self._connect():
                return False

        try:
            self.sock.sendall(data)
            return True
        except (socket.error, OSError):
            # Connection lost, close and try to reconnect once
            self._close()
            if self._connect():
                try:
                    self.sock.sendall(data)
                    return True
                except (socket.error, OSError):
                    self._close()
            return False

    def _close(self):
        """Close the TCP socket."""
        if self.sock:
            try:
                self.sock.close()
            except (socket.error, OSError):
                pass
            self.sock = None

    def emit(self, record):
        """Format and send a log record to Logstash."""
        try:
            msg = self.format(record)
            # Logstash json_lines codec expects newline-delimited JSON
            data = (msg + "\n").encode("utf-8")
            with self._lock:
                self._send(data)
        except Exception:
            # Never let logging errors crash the application
            self.handleError(record)

    def close(self):
        """Clean up the TCP connection."""
        with self._lock:
            self._close()
        super().close()
