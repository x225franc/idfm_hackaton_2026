#!/usr/bin/env node

const fs = require('fs');
const http = require('http');

const N8N_HOST = 'http://idfm_n8n:5678';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const WORKFLOW_PATH = '/app/workflow.json';

console.log('🚀 Initialisation n8n...');

// Attendre que n8n soit prêt
async function waitForN8n() {
  let retries = 30;
  while (retries > 0) {
    try {
      const response = await fetch(`${N8N_HOST}/api/v1/workflows`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        console.log('✅ n8n est prêt!');
        return true;
      }
    } catch (e) {
      console.log(`⏳ Attente de n8n... (${retries} tentatives restantes)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    }
  }
  throw new Error('n8n n\'a pas répondu à temps');
}

// Charger et configurer le workflow
async function importWorkflow() {
  console.log('📥 Chargement du workflow...');

  let workflow = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf8'));

  // Remplacer la clé API dans tous les nodes
  workflow.nodes = workflow.nodes.map(node => {
    if (node.name === 'Appel Groq API') {
      node.parameters.headerParameters.parameters[0].value = `Bearer ${GROQ_API_KEY}`;
    }
    return node;
  });

  console.log('🔑 Clé Groq configurée');
  console.log('📤 Envoi du workflow à n8n...');

  const response = await fetch(`${N8N_HOST}/api/v1/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Erreur lors de l\'import:', error);
    throw new Error(`Import failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('✅ Workflow importé avec succès!');
  console.log(`📌 Workflow ID: ${result.id}`);

  // Activer le workflow
  console.log('🟢 Activation du workflow...');
  const activateResponse = await fetch(`${N8N_HOST}/api/v1/workflows/${result.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: true })
  });

  if (activateResponse.ok) {
    console.log('✅ Workflow activé!');
  }
}

// Exécution principale
(async () => {
  try {
    await waitForN8n();
    await importWorkflow();
    console.log('\n🎉 n8n initialisé avec succès!');
    console.log(`📍 Accède à http://localhost:5678`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();
