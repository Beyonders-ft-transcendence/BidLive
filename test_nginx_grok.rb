require 'grok-pure'
grok = Grok.new
grok.add_patterns_from_file("/usr/share/logstash/vendor/bundle/jruby/3.1.0/gems/logstash-patterns-core-4.3.4/patterns/legacy/grok-patterns") rescue nil

msg = '172.19.0.1 - - [26/Jul/2026:11:02:19 +0000] "GET / HTTP/1.1" 200 458 "-" "curl/8.18.0"'
pattern = '%{IPORHOST:client_ip} - %{DATA:user} \[%{HTTPDATE:log_timestamp}\] "%{WORD:http_method} %{URIPATHPARAM:request_uri} HTTP/%{NUMBER:http_version}" %{NUMBER:response_code} %{NUMBER:body_bytes_sent} "%{DATA:referrer}" "%{DATA:user_agent}"'
grok.compile(pattern)
puts "Nginx match: #{!grok.match(msg).nil?}"
if grok.match(msg)
  puts "Match captures:"
  puts grok.match(msg).captures.inspect
end
