const express = require("express");
const router = express.Router();
// const User = require("../models/user");
const webPush = require('web-push');
const { url } = require("../const");

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
    "environment variables. You can use the following ones:");
  console.log(webPush.generateVAPIDKeys());
  return;
}

// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  url,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const payloads = {};

router.get('/vapidPublicKey', (_, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});

router.post('/register', (req, res) => {
  // A real world application would store the subscription info.
  console.log(req.body.subscription);
  res.sendStatus(201);
});

router.post('/sendNotification', (req, res) => {
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  const options = {
    TTL: req.body.ttl
  };

  setTimeout(() => {
    payloads[req.body.subscription.endpoint] = payload;
    webPush.sendNotification(subscription, null, options)
      .then(() => {
        res.sendStatus(201);
      })
      .catch((error) => {
        res.sendStatus(500);
        console.log(error);
      });
  }, req.body.delay * 1000);
});

router.get('/getPayload', (req, res) => {
  res.send(payloads[req.query.endpoint]);
});

module.exports = router;