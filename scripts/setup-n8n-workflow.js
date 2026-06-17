#!/usr/bin/env node
/**
 * Script d'initialisation automatique du workflow n8n
 * Crée le workflow IDFM Chatbot avec Groq API
 */

const http = require('http');
const https = require('https');

const N8N_HOST = process.env.N8N_URL || 'http://idfm_n8n:5678';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY non définie');
  process.exit(1);
}

console.log('🚀 Initialisation du workflow n8n...');
console.log(`📍 N8N: ${N8N_HOST}`);

// Fonction pour faire des appels HTTP
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_HOST);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Attendre que n8n soit prêt
async function waitForN8n() {
  let retries = 60;
  while (retries > 0) {
    try {
      console.log(`⏳ Vérification de n8n... (${retries} tentatives)`);
      const response = await makeRequest('GET', '/api/v1/workflows');
      if (response.status === 200) {
        console.log('✅ n8n est prêt!');
        return true;
      }
    } catch (e) {
      // Continuer
    }
    await new Promise(r => setTimeout(r, 2000));
    retries--;
  }
  throw new Error('n8n n\'a pas répondu à temps');
}

// Créer le workflow
async function createWorkflow() {
  console.log('📝 Création du workflow...');

  const workflow = {
    name: 'IDFM Chatbot - Groq Intelligence',
    active: true,
    nodes: [
      {
        id: '1',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: 'idfm-chat',
          responseMode: 'onReceived',
          method: 'POST'
        }
      },
      {
        id: '2',
        name: 'Groq API',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: [550, 300],
        parameters: {
          url: 'https://api.groq.com/openai/v1/chat/completions',
          method: 'POST',
          headerParameters: {
            parameters: [
              {
                name: 'Authorization',
                value: `Bearer ${GROQ_API_KEY}`
              }
            ]
          },
          bodyParameters: {
            parameters: [
              {
                name: 'model',
                value: 'mixtral-8x7b-32768'
              },
              {
                name: 'messages',
                value: JSON.stringify([
                  {
                    role: 'system',
                    content: `Tu es un assistant expert en transports en Île-de-France. Analyse le message et réponds TOUJOURS en JSON valide avec cette structure:
{
  "profil": "étudiant|salarié|senior|junior|autre|null",
  "frequence": "quotidien|régulier|occasionnel|rare|null",
  "region": "Paris|proche_banlieue|grande_banlieue|null",
  "recommendations": ["forfait1", "forfait2"],
  "response": "Réponse naturelle et amicale"
}

Forfaits: Imagine R Etudiant, Liberté+, Navigo Annuel, Imagine R Junior, Imagine R Scolaire, Améthyste, TST`
                  },
                  {
                    role: 'user',
                    content: '={{ $json.body.message }}'
                  }
                ])
              },
              {
                name: 'temperature',
                value: '0.7'
              },
              {
                name: 'max_tokens',
                value: '500'
              }
            ]
          }
        }
      },
      {
        id: '3',
        name: 'Parse Réponse',
        type: 'n8n-nodes-base.code',
        typeVersion: 1,
        position: [850, 300],
        parameters: {
          jsCode: `const response = $input.first().json;
const content = response.choices[0].message.content;

try {
  const jsonMatch = content.match(/\\{[\\s\\S]*\\}/);
  if (!jsonMatch) {
    return { error: 'Impossible de parser la réponse' };
  }
  const result = JSON.parse(jsonMatch[0]);

  return {
    success: true,
    response: result.response || 'Réponse',
    recommendations: result.recommendations || [],
    detectedProfile: result.profil || null,
    detectedFrequency: result.frequence || null,
    detectedRegion: result.region || null,
    suggestedActions: (result.recommendations || []).map(f => ({
      text: 'Voir détails',
      action: 'viewDetails',
      forfait: f
    }))
  };
} catch (e) {
  return { error: 'Erreur parsing: ' + e.message };
}`
        }
      },
      {
        id: '4',
        name: 'Webhook Response',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [1100, 300],
        parameters: {
          responseBody: '={{ $json }}'
        }
      }
    ],
    connections: {
      '1': {
        main: [[{ node: '2', type: 'main', index: 0 }]]
      },
      '2': {
        main: [[{ node: '3', type: 'main', index: 0 }]]
      },
      '3': {
        main: [[{ node: '4', type: 'main', index: 0 }]]
      }
    }
  };

  try {
    const response = await makeRequest('POST', '/api/v1/workflows', workflow);

    if (response.status === 201) {
      console.log('✅ Workflow créé avec succès!');
      console.log(`📌 Workflow ID: ${response.body.id}`);
      return response.body.id;
    } else {
      throw new Error(`Erreur ${response.status}: ${JSON.stringify(response.body)}`);
    }
  } catch (e) {
    console.error('❌ Erreur création workflow:', e.message);
    throw e;
  }
}

// Activer le workflow
async function activateWorkflow(workflowId) {
  console.log(`🔄 Activation du workflow ${workflowId}...`);

  try {
    const response = await makeRequest('PATCH', `/api/v1/workflows/${workflowId}`, {
      active: true
    });

    if (response.status === 200) {
      console.log('✅ Workflow activé!');
      return true;
    } else {
      throw new Error(`Erreur ${response.status}`);
    }
  } catch (e) {
    console.error('⚠️  Erreur activation:', e.message);
    // Ne pas bloquer si l'activation échoue
    return false;
  }
}

// Exécution
(async () => {
  try {
    await waitForN8n();
    const workflowId = await createWorkflow();
    await activateWorkflow(workflowId);

    console.log('\n🎉 Setup n8n complété avec succès!');
    console.log(`🌐 Accède à ${N8N_HOST}`);
    console.log('💬 Le chatbot est prêt!');
  } catch (error) {
    console.error('\n❌ Erreur setup:', error.message);
    process.exit(1);
  }
})();
