FROM logstash:8.17.0

USER root

# Install cfssl for TLS certificate generation (project standard)
RUN apt-get update && \
    apt-get install -y --no-install-recommends golang-cfssl curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

# Copy configuration
COPY ./conf/logstash.yml /usr/share/logstash/config/logstash.yml

# Copy pipeline configuration
COPY ./conf/pipeline.conf /usr/share/logstash/pipeline/pipeline.conf

# Copy ILM policy and setup script
COPY ./conf/ilm-policy.json /usr/share/logstash/config/ilm-policy.json
COPY ./tools/setup-ilm.sh /usr/local/bin/setup-ilm.sh
RUN chmod +x /usr/local/bin/setup-ilm.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000 5044 9600 12201/udp

ENTRYPOINT ["/entrypoint.sh"]
