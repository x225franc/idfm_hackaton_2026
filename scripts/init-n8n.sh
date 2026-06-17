#!/bin/bash

# Attendre que n8n soit prêt
echo "Attente du démarrage de n8n..."
sleep 10

# Vérifier que n8n répond
until curl -s http://localhost:5678/api/v1/workflows > /dev/null; do
  echo "n8n en cours de démarrage..."
  sleep 2
done

echo "✅ n8n est prêt!"

# Importer le workflow
echo "📥 Importation du workflow..."

WORKFLOW=$(cat /app/n8n-workflow-chatbot.json)

# Remplacer la clé API
WORKFLOW="${WORKFLOW//YOUR_GROQ_API_KEY/$GROQ_API_KEY}"

# Importer le workflow via l'API n8n
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"IDFM Chatbot - Groq Intelligence\",
    \"nodes\": [],
    \"connections\": {},
    \"active\": true,
    \"nodes\": $(echo "$WORKFLOW" | jq '.nodes'),
    \"connections\": $(echo "$WORKFLOW" | jq '.connections')
  }"

echo "✅ Workflow importé avec succès!"
