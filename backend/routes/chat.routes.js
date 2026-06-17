const express = require("express");
const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || "http://idfm_ollama:11434";
const MODEL = "mistral";

// Système prompt pour Mistral
const SYSTEM_PROMPT = `Tu es un assistant expert en transports en Île-de-France (IDFM). Tu aides les utilisateurs à trouver le meilleur forfait/abonnement Navigo.

IMPORTANT: Réponds TOUJOURS en JSON valide avec cette structure exacte:
{
  "profil": "étudiant|salarié|senior|junior|retraité|demandeur_emploi|autre|null",
  "frequence": "quotidien|régulier|occasionnel|rare|null",
  "region": "Paris|proche_banlieue|grande_banlieue|null",
  "recommendations": ["Forfait1", "Forfait2"],
  "response": "Message naturel, amical et utile"
}

📋 FORFAITS DÉTAILLÉS:
- Imagine R Etudiant: Pour étudiants (< 26 ans) - Tarif réduit excellent
- Liberté+: Flexibilité maximale, utilisation occasionnelle/variable
- Navigo Annuel: Abonnement annuel pour usage quotidien/régulier (travail, études)
- Imagine R Junior: Pour enfants (< 16 ans)
- Imagine R Scolaire: Pour collégiens/lycéens
- Améthyste: Pour seniors 60+ - Tarif réduit social
- TST: Pour demandeurs d'emploi, allocation sociale

🎯 LOGIQUE DE RECOMMANDATION:
1. Profil + Fréquence → Choisir le forfait principal
2. Si quotidien/régulier → Navigo Annuel ou Imagine R (selon profil)
3. Si occasionnel → Liberté+
4. Toujours personnaliser la réponse au contexte

💡 QUALITÉ DES RÉPONSES:
- Sois concis mais utile
- Explique pourquoi ce forfait
- Propose une action (détails, commander)
- Reste amical et encourageant

EXEMPLE BON JSON:
{
  "profil": "étudiant",
  "frequence": "quotidien",
  "region": "Paris",
  "recommendations": ["Imagine R Etudiant", "Liberté+"],
  "response": "Parfait ! Vous êtes étudiant à Paris avec un usage quotidien. L'Imagine R Etudiant est idéal pour vous avec un tarif réduit. Vous pouvez aussi garder Liberté+ comme backup pour les trajets exceptionnels."
}`;

// Route POST /api/chat
router.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message vide" });
  }

  try {
    // Appel à Ollama
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${SYSTEM_PROMPT}\n\nMessage utilisateur: ${message}`,
        stream: false,
        temperature: 0.7
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama error: ${ollamaResponse.statusText}`);
    }

    const ollamaData = await ollamaResponse.json();
    const responseText = ollamaData.response;

    // Parser la réponse JSON
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found");
      }
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      result = {
        profil: null,
        frequence: null,
        region: null,
        recommendations: [],
        response: "Je n'ai pas bien compris. Pouvez-vous reformuler ?"
      };
    }

    res.json({
      success: true,
      response: result.response || "Désolé, une erreur s'est produite",
      recommendations: result.recommendations || [],
      detectedProfile: result.profil,
      detectedFrequency: result.frequence,
      detectedRegion: result.region,
      suggestedActions: [
        ...(result.recommendations || []).map(f => ({
          text: `📋 ${f}`,
          action: "viewDetails",
          forfait: f
        })),
        {
          text: " Autre question",
          action: "askAnother"
        }
      ]
    });
  } catch (error) {
    console.error("Erreur chat:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
