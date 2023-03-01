require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const { TOKEN, SERVER_URL } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const app = express();

const subscribed = [];

app.use(bodyParser.json());

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

const addSubscribe = (chatId) => {
  subscribed.push({ chatId });

  console.log(subscribed);
};

app.post(URI, async (req, res) => {
  console.log(req.body);

  const chatId = req.body.message.chat.id;
  const chatMessage = req.body.message.text;

  if (chatMessage === '/subscribe') {
    addSubscribe(chatId);

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: 'Succesfully subscribed ',
    });
  } else {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: 'cahyo emang ganteng banget ' + chatMessage,
    });
  }

  return res.send();
});

app.post('/api/send', async (req, res) => {
  console.log(req.body);
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: req.body.chatId,
    text: req.body.message,
  });

  return res.send();
});

app.post('/api/broadcast', async (req, res) => {
  console.log(req.body);
  for (const item of subscribed) {
    axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: item.chatId,
      text: req.body.message,
    });
  }

  return res.send();
});

app.listen(process.env.PORT || 5000, async () => {
  console.log(`App running in port ${process.env.PORT || 5000} successfully`);
  await init();
});
