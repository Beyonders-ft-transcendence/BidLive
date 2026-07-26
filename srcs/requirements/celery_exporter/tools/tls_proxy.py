import http.server
import ssl
import urllib.request
import urllib.error

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Prevent spamming logs with standard scrape requests
        pass

    def do_GET(self):
        url = "http://127.0.0.1:9809" + self.path
        try:
            req = urllib.request.Request(url)
            # Forward headers from client to local server (excluding Host)
            for header in self.headers:
                if header.lower() != 'host':
                    req.add_header(header, self.headers[header])
            
            with urllib.request.urlopen(req) as response:
                self.send_response(response.status)
                for header, value in response.getheaders():
                    if header.lower() not in ('connection', 'transfer-encoding'):
                        self.send_header(header, value)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for header, value in e.headers.items():
                if header.lower() not in ('connection', 'transfer-encoding'):
                    self.send_header(header, value)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

# Setup HTTPS server with certificates
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='/etc/ssl/certs/server.crt', keyfile='/etc/ssl/private/server.key')

server = http.server.HTTPServer(('0.0.0.0', 9808), ProxyHandler)
server.socket = context.wrap_socket(server.socket, server_side=True)
print("Proxy serving on HTTPS port 9808...")
server.serve_forever()
