const express = require("express");
const router = express.Router();

// Route POST /api/chat
router.post("/api/chat", async (req, res) => {
  const { message, userId } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: "Message vide" });
  }

  try {
    // Appel à n8n webhook (utilise le nom du service Docker)
    const n8nUrl = process.env.N8N_URL || "http://idfm_n8n:5678";
    const n8nResponse = await fetch(`${n8nUrl}/webhook/idfm-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n error: ${n8nResponse.statusText}`);
    }

    const result = await n8nResponse.json();

    res.json({
      success: true,
      response: result.response || "Désolé, une erreur s'est produite",
      recommendations: result.recommendations || [],
      detectedProfile: result.detectedProfile,
      detectedFrequency: result.detectedFrequency,
      detectedRegion: result.detectedRegion,
      suggestedActions: result.suggestedActions || []
    });
  } catch (error) {
    console.error("Erreur chat:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
