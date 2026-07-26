#!/bin/sh
set -e

ES_HOST="https://elasticsearch:9200"
ILM_POLICY_FILE="/usr/share/logstash/config/ilm-policy.json"
POLICY_NAME="bidlive-retention-policy"

# Load Elasticsearch credentials from Secret if not inherited (line 1 = user, line 2 = password)
if [ -z "$ELASTIC_PASSWORD" ] && [ -f /run/secrets/elasticsearch_credenciais ]; then
    ELASTIC_USER=$(sed -n '1p' /run/secrets/elasticsearch_credenciais | cut -d'=' -f2 | tr -d '\r')
    ELASTIC_PASSWORD=$(sed -n '2p' /run/secrets/elasticsearch_credenciais | cut -d'=' -f2 | tr -d '\r')
fi

CURL_OPTS="-s -u ${ELASTIC_USER:-elastic}:${ELASTIC_PASSWORD} --cacert /run/secrets/ca_cert"

echo "🔧 Setting up ILM (Index Lifecycle Management) policy..."

# Check if policy already exists
EXISTING=$(curl $CURL_OPTS -o /dev/null -w "%{http_code}" "${ES_HOST}/_ilm/policy/${POLICY_NAME}")

if [ "$EXISTING" = "200" ]; then
    echo "  ILM policy '${POLICY_NAME}' already exists. Skipping creation."
else
    echo "  Creating ILM policy '${POLICY_NAME}'..."
    curl $CURL_OPTS -X PUT "${ES_HOST}/_ilm/policy/${POLICY_NAME}" \
        -H "Content-Type: application/json" \
        -d @"${ILM_POLICY_FILE}"
    echo ""
    echo "  ✅ ILM policy '${POLICY_NAME}' created successfully."
fi

# Create index template for bidlive-logs
echo "🔧 Setting up index template..."

curl $CURL_OPTS -X PUT "${ES_HOST}/_index_template/bidlive-logs-template" \
    -H "Content-Type: application/json" \
    -d '{
  "index_patterns": ["bidlive-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "'"${POLICY_NAME}"'",
      "index.lifecycle.rollover_alias": "bidlive-logs"
    }
  },
  "priority": 100
}'
echo ""
echo "✅ Index template created successfully."
