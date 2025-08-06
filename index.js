const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // 🚨 Permet d'accepter les requêtes depuis ton site web
app.use(bodyParser.json());

// Remplace ce token par ton vrai token long-lived LINE Notify
const LINE_NOTIFY_TOKEN = "TON_TOKEN_LONG_LIVED_ICI";

app.post("/lineWebhook", async (req, res) => {
  const { message } = req.body;

  try {
    await axios.post(
      "https://notify-api.line.me/api/notify",
      new URLSearchParams({ message }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
        },
      }
    );
    res.status(200).send("✅ Message envoyé à LINE.");
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).send("❌ Échec de l'envoi.");
  }
});

app.listen(port, () => {
  console.log(`🚀 Serveur en ligne sur le port ${port}`);
});
