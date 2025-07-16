const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/', (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

  if (intentName === 'TestWebhookBonjour') {
    res.json({
      fulfillmentMessages: [
        {
          text: {
            text: ['Bonjour ! Comment puis-je vous aider ?'],
          },
        },
      ],
    });
  } else {
    res.json({
      fulfillmentMessages: [
        {
          text: {
            text: ['Désolé, je ne comprends pas cette demande.'],
          },
        },
      ],
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});