const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/', (req, res) => {
    const event = req.body.originalDetectIntentRequest.payload.data;
    const userText = event.message?.text || "";
    let reply = {
        type: "text",
        text: "ขออภัย ฉันไม่เข้าใจ กรุณาเลือกจากเมนู"
    };

    if (/จอง|book|예약|预订/.test(userText)) {
        reply = {
            type: "template",
            altText: "คลิกปุ่มเพื่อจอง",
            template: {
                type: "buttons",
                title: "Booking / จอง / 예약 / 预订",
                text: "Click the button below",
                actions: [
                    {
                        type: "uri",
                        label: "จองเลย / Book Now",
                        uri: "https://www.pkjthaimassage.com/booking"
                    }
                ]
            }
        };
    }

    res.json({
        fulfillmentMessages: [
            {
                payload: {
                    line: {
                        type: "flex",
                        altText: "Welcome to PKJ Thai Massage!",
                        contents: {
                            type: "bubble",
                            hero: {
                                type: "image",
                                url: "https://www.pkjthaimassage.com/images/salon-pkj.jpg",
                                size: "full",
                                aspectRatio: "20:13",
                                aspectMode: "cover"
                            },
                            body: {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                    {
                                        type: "text",
                                        text: "Welcome to PKJ Thai Massage",
                                        weight: "bold",
                                        size: "md",
                                        wrap: true
                                    },
                                    {
                                        type: "text",
                                        text: "กรุณาเลือกบริการที่คุณต้องการ / Please select the service",
                                        size: "sm",
                                        wrap: true,
                                        margin: "md"
                                    }
                                ]
                            },
                            footer: {
                                type: "box",
                                layout: "vertical",
                                spacing: "sm",
                                contents: [
                                    {
                                        type: "button",
                                        style: "primary",
                                        action: {
                                            type: "uri",
                                            label: "จองเลย / Book Now",
                                            uri: "https://www.pkjthaimassage.com/booking"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});