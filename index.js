const express = require("express");
const line = require("@line/bot-sdk");
const { SessionsClient } = require("@google-cloud/dialogflow-cx");

["LINE_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_SECRET", "DF_PROJECT", "DF_LOCATION", "DF_AGENT", "GOOGLE_APPLICATION_CREDENTIALS"]
  .forEach(k => { if (!process.env[k]) throw new Error(`Missing env ${k}`); });

process.on("unhandledRejection", e => console.error("UnhandledRejection:", e));

const app = express();
app.use(express.json());

// LINE creds via variables d'env
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const lineClient = new line.Client(lineConfig);

// DF CX client (région obligatoire, ex: asia-southeast1)
const dfClient = new SessionsClient({
  apiEndpoint: `${process.env.DF_LOCATION}-dialogflow.googleapis.com`,
});

// Détection langue simple par script
function detectLang(t = "") {
  if (/[ก-๙]/.test(t)) return "th";
  if (/[\uAC00-\uD7AF]/.test(t)) return "ko";
  if (/[\u4E00-\u9FFF]/.test(t)) return "zh";
  if (/[\u0600-\u06FF]/.test(t)) return "ar";
  return "en";
}

app.get("/", (_, res) => res.send("OK")); // healthcheck Render
// Endpoint pour le bouton "Verify" de LINE (retourne 200)
app.get("/webhook", (_, res) => res.status(200).send("OK"));

// Webhook LINE
app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    await Promise.all((req.body.events || []).map(handleEvent));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return lineClient.replyMessage(event.replyToken, { type: "text", text: "Text only." });
  }

  const text = (event.message.text || "").trim();
  const lang = detectLang(text);

  // ⚠️ Correction ici : sessionPath prend 4 arguments seulement
  const sessionPath = dfClient.projectLocationAgentSessionPath(
    process.env.DF_PROJECT,
    process.env.DF_LOCATION,
    process.env.DF_AGENT,
    event.source.userId || `anon-${Date.now()}`
  );

  try {
    const [resp] = await dfClient.detectIntent({
      session: sessionPath,
      queryInput: { text: { text }, languageCode: lang },
      queryParams: { timeZone: "Asia/Bangkok" },
    });

    const outs = (resp.queryResult.responseMessages || [])
      .flatMap(m => (m.text && m.text.text) ? m.text.text : []);

    const messages = (outs.length ? outs : ["ขอบคุณครับ / Thanks!"])
      .slice(0, 5)
      .map(t => ({ type: "text", text: t.substring(0, 990) }));

    return lineClient.replyMessage(event.replyToken, messages);
  } catch (err) {
    console.error("DF error:", err);
    return lineClient.replyMessage(event.replyToken, [
      { type: "text", text: "Temporary error." }
    ]);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("🚀 Listening on", port));
