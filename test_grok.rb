require 'grok-pure'

grok = Grok.new
grok.add_patterns_from_file("/usr/share/logstash/vendor/bundle/jruby/3.1.0/gems/logstash-patterns-core-4.3.4/patterns/legacy/grok-patterns") rescue nil

# Django
msg1 = '172.19.0.14:35952 - "GET /metrics/ HTTP/1.1" 200'
pattern1 = '%{IPORHOST:client_ip}:%{NUMBER:client_port} - "%{WORD:http_method} %{URIPATHPARAM:request_uri} HTTP/%{NUMBER:http_version}" %{NUMBER:status_code}'
grok.compile(pattern1)
puts "Django match: #{!grok.match(msg1).nil?}"

# Celery
msg2 = '[2026-07-26 10:59:45,061: INFO/MainProcess] Task common.tasks.test_task'
pattern2 = '\[%{DATA:log_timestamp}: %{LOGLEVEL:log_level_parsed}/%{DATA:process_name}\] %{GREEDYDATA:log_message}'
grok.compile(pattern2)
puts "Celery match: #{!grok.match(msg2).nil?}"
