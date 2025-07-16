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
