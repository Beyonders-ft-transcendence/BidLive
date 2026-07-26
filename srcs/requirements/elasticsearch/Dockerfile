FROM elasticsearch:8.17.0

USER root

# Install cfssl for TLS certificate generation (project standard)
RUN apt-get update && \
    apt-get install -y --no-install-recommends golang-cfssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

# Copy configuration
COPY ./conf/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9200 9300

ENTRYPOINT ["/entrypoint.sh"]
