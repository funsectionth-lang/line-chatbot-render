const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { SessionsClient } = require('@google-cloud/dialogflow');

const app = express();
app.use(bodyParser.json());

const dialogflowConfig = {
  projectId: 'pkjbot', // Remplace si ton vrai ID est différent
  location: 'global', // ou asia-southeast1
  agentId: 'TON_AGENT_ID_ICI', // à remplacer
  languageCode: 'th',
  credentials: {
    client_email: 'pkjmassage@pkjbot-466106.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDZV73bFoRYFCWN\nVggCPFXjS2E85lG5xcdU2YSE0wo9zCBQO4rjcVo9AlNiY2wT6LWod6hEEwhWFdse\nmtzbWEoU4v7XqRwKrH5rdr0tliIMBQkdsHedSJ4oOjjIv2tOf4RwvP2ZVV8ieFHz\nZ1eBvsN+c0kuvPy73pOlqHaT0F2x1Pmmws3/MDe25cJmPNUt0ROs7b0euiHuNvV2\nbYYeYeUCkfdLWy9oAQ4K7WXDjGX7R+F6wRSqJGtUyXgFI6pwPgY06a4wxG/Tthr6\n0g1UbXAlml7kdiF8FejQXpctywIcp3whubwkL3s4pA268SYGvq5XAdPXNGXgTi40\ng8I6ldk7AgMBAAECggEATaspUa3ORZuNf+CKpCHjn4JEkXrNIdIn1Y6V6NFyC3ty\n4LkmfPj5AmxeV/6nlMXIhRedrhYPGJRe5aT53/jBII2t/GuWdcoGs2iPWkcYi6sR\nAucZF7/npQCJYlPliPvQ3GjtR2pWwP62aoE3qEn/mqSgNm+a8ZgsszpshY4krXOB\nsrd2cPU164zI5CJbxKkPzRL1FpWVbh4y1XuAXH6PMg2RTnewnx5Deu50AuxDIhEB\nYyumCataIq5izbSPSmrWoEo3z3dQBqMw/QoQjvu81M6y+eu1eid39c9awoC6dbWC\nJIBNKeQA7O+3Aiy+ToLTlMfoFcw4dtz/71ZPKdaNoQKBgQD2in9jBEPJ8JdU1mlc\nZiKgRfD1ZQo+gldD92PaGan8Ic8G7EzewAkA/i5oOOuGOlREoCDhxaX3ILhIbo6s\ntzeHn9yOM2FscaGL0QDlZElrqh18K6ewae/OmwzQZ9Cd/yGpMyze2AyH4p3e+HU5\nIUmEuZInPJQnfXf4t7KAdaB5TwKBgQDhrnYf0LDNbtSFxkUQ53WPzJH79TWBs/pE\nR2VtUboZZ3b0b+wW9FJxQCS/AIwVPt+Mt9q7KelQ2kwnBHc0Y1kewBDXINsgcBSQ\nNc6717I1LybtjvpCT3BHGSAZvWn2YwsM7kLdzFINsN/LT+6E1825HoNXGzZ++bW8\nU5sDPlDOVQKBgFKj+i9mrpJyY0e813RxiAnRaAPZ6qUpa7cMphvlnmU1r//SFbJV\nDK+YhFXLPqevxa97PYpwhkFgZmVhKdIbWDHOFFBWSMHhFRWY6YP7KeE9FMUanQs1\nd3z53EG/it5rNw1QaioIoaqq++BRyHlt/wbObX9Zfw/9rslgSiVlSHVhAoGANDmp\nQEeNAp1JNQPi67yEahiPF91w2mkJ208iW5/0DvjwgDR+T/mOMoMDfefkgu4f0XKi\nfXl/cqRxxv2zkD4FW6Zav03tJ56IQ68P/kw2AzS8L3FM3JeBhhJ8aTh6EvhskDt6\n4dTskBqET4pZyggepV44SqoTfGLQ+ZnnX2LGVFkCgYAqyYsuyOTXyGonrn7MKpSj\nXb8Cgs4c1uOA6M+uUyyZOcs9RWh9bwNJnWuWXCzw27apAqq6beL+W+4eJYKf+868\nHhhAad1AQ+DxGw22RFTvUA4UofEK5HDnqYCjxcSdDlXLoTkoSNzMLp8pFwl/oSQx\nQVrx4qeTKtwkAjWWCfixAQ==\n-----END PRIVATE KEY-----\n'
  }
};

app.post('/lineWebhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('BODY:', JSON.stringify(body, null, 2));

    if (
      body.events &&
      body.events.length > 0 &&
      body.events[0].type === 'message' &&
      body.events[0].message.type === 'text'
    ) {
      const userMessage = body.events[0].message.text;
      const sessionId = uuidv4();

      const sessionClient = new SessionsClient({ credentials: dialogflowConfig.credentials });

      const sessionPath = sessionClient.projectLocationAgentSessionPath(
        dialogflowConfig.projectId,
        dialogflowConfig.location,
        dialogflowConfig.agentId,
        sessionId
      );

      const request = {
        session: sessionPath,
        queryInput: {
          text: { text: userMessage },
          languageCode: dialogflowConfig.languageCode,
        },
      };

      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      console.log('RESPONSE:', result.fulfillmentText);

      res.status(200).send('OK'); // ⚠️ Important : toujours retourner 200 pour LINE
    } else {
      res.status(200).send('Not a text message');
    }
  } catch (error) {
    console.error('Erreur dans le webhook :', error);
    res.status(200).send('Erreur attrapée'); // ⚠️ Retourne quand même 200 pour LINE sinon il renvoie 500
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
