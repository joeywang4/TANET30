const express = require("express");
const router = express.Router();
const Rank = require("../rank/Rank");
const PaperRank = require("../rank/PaperRank");
const RichRank = require("../rank/RichRank");

class BotManager {
  update = () => {
    this.bots.map(bot => bot.update());
  }

  stop = () => {
    clearInterval(this.handle);
  }

  start = () => {
    this.handle = setInterval(this.update, this.interval);
  }

  constructor(bots, interval) {
    this.bots = bots;
    this.interval = interval;
    this.update();
    this.start();
  }
}

const paperBot = new PaperRank();
const richBot = new RichRank();
const mgr = new BotManager([paperBot, richBot], 60 * 1000);

router.get("/rich", (req, res) => {
  const result = richBot.get();
  res.status(200).send(result);
})

router.get("/paper", (req, res) => {
  const result = paperBot.get();
  res.status(200).send(result);
})

const setSocketIO = (io) => {
  Rank.io = io;
}

module.exports = {rankRoute: router, setSocketIO};