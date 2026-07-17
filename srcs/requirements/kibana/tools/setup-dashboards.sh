#!/bin/sh
# setup-dashboards.sh — Import pre-built dashboards into Kibana
# Runs in background after Kibana starts
set -e

KIBANA_URL="https://localhost:5601/kibana"
DASHBOARDS_DIR="/usr/share/kibana/dashboards"

# Load Elasticsearch password from Secret (line 2 = password)
# Always use 'elastic' superuser for Kibana API operations
if [ -z "$ELASTIC_PASSWORD" ] && [ -f /run/secrets/elasticsearch_credenciais ]; then
    ELASTIC_PASSWORD=$(sed -n '2p' /run/secrets/elasticsearch_credenciais | cut -d'=' -f2 | tr -d '\r')
fi

CURL_OPTS="-sk -u elastic:${ELASTIC_PASSWORD}"
MAX_RETRIES=60
RETRY_INTERVAL=5

echo "[Dashboards] Waiting for Kibana to be fully ready..."
retries=0
while [ $retries -lt $MAX_RETRIES ]; do
    if curl $CURL_OPTS "${KIBANA_URL}/api/status" 2>/dev/null | grep -q '"level":"available"'; then
        echo "[Dashboards] Kibana is ready."
        break
    fi
    retries=$((retries + 1))
    echo "[Dashboards] Kibana not ready yet (attempt $retries/$MAX_RETRIES), retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

if [ $retries -eq $MAX_RETRIES ]; then
    echo "[Dashboards] ❌ Kibana did not become ready after $MAX_RETRIES attempts. Skipping dashboard import."
    exit 0
fi

# Small delay to ensure Kibana is fully initialized
sleep 10

echo "[Dashboards] Importing saved objects..."

# Import all NDJSON files in the dashboards directory
IMPORT_SUCCESS=true
for DASHBOARDS_FILE in "${DASHBOARDS_DIR}"/*.ndjson; do
    if [ -f "$DASHBOARDS_FILE" ]; then
        FILENAME=$(basename "$DASHBOARDS_FILE")
        echo "[Dashboards] Importing ${FILENAME}..."
        RESPONSE=$(curl $CURL_OPTS -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
            -H "kbn-xsrf: true" \
            --form file=@"${DASHBOARDS_FILE}" 2>&1)

        if echo "$RESPONSE" | grep -q '"success":true'; then
            echo "[Dashboards] ✅ ${FILENAME} imported successfully!"
        else
            echo "[Dashboards] ⚠️  ${FILENAME} import response: $RESPONSE"
            IMPORT_SUCCESS=false
        fi
    fi
done

if [ "$IMPORT_SUCCESS" = true ]; then
    echo "[Dashboards] ✅ All dashboards imported successfully!"
else
    echo "[Dashboards] ⚠️  Some dashboards had import issues. Check logs above."
fi
