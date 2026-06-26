bind = "0.0.0.0:8000"
workers = 3
threads = 2
timeout = 60
worker_class = "uvicorn.workers.UvicornWorker"
loglevel = "info"
accesslog = "-"
errorlog = "-"

# certfile = "/etc/ssl/certs/server.crt"
# keyfile = "/etc/ssl/private/server.key"

