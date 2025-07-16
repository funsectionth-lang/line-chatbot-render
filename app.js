
const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const app = express();
app.use(middleware(config));

const client = new Client(config);

app.post('/webhook', (req, res) => {
  Promise
    .all(req.body.events.map(event => handleEvent(event)))
    .then(result => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `คุณพิมพ์ว่า: ${event.message.text}`
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
