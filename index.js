const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/', (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const action = req.body.queryResult.action;

  console.log('Intent :', intentName);
  console.log('Action :', action);

  if (action === 'hello.greeting') {
    return res.json({
      fulfillmentMessages: [
        {
          text: {
            text: ['สวัสดีครับ ! Hello! Welcome to PKJ Thai Massage.']
          }
        }
      ]
    });
  }

  if (intentName === 'TestWebhookBonjour') {
    return res.json({
      fulfillmentMessages: [
        {
          text: {
            text: ['Bonjour ! Comment puis-je vous aider ?']
          }
        }
      ]
    });
  }

  return res.json({
    fulfillmentMessages: [
      {
        text: {
          text: ["Je ne comprends pas encore cette demande. Essayez 'bonjour' ou 'hello'."]
        }
      }
    ]
  });
});

app.listen(port, () => {
  console.log(`✅ Serveur en ligne sur le port ${port}`);
});
