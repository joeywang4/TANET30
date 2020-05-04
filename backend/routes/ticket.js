const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket");
const User = require("../models/user");

const re = /(\d{4})-([0-1]\d{1})-([0-3]\d{1})/;
const today = () => {
  const d = new Date();
  const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [{ value: mm },,{ value: dd },,{ value: yy }] = dtf.formatToParts(d);
  return `${yy}-${mm}-${dd}`;
}

router.post("/give", async (req, res) => {
  if(!req.isLogin || req.user.group !== "root") {
    res.status(401).send("Not authorized");
    return;
  }
  let {owner, type, date } = req.body;
  if(!owner || !type || !date) {
    res.status(400).send("Missing field");
    return;
  }
  let handler = (err, user) => {
    if(user) return user._id;
    else if(err) {
      errHandler(err, res);
      return null;
    }
    return null;
  }
  if(owner.indexOf("@") !== -1) {
    owner = await User.findOne({email: owner}, handler);
  }
  else {
    owner = await User.findById(owner, handler);
  }
  if(owner === null) {
    res.status(400).send("Owner does not exist");
    return;
  }
  if(date.length !== 10 || !re.test(date)) {
    res.status(400).send("Invalid Date");
    return;
  }
  const newTicket = new Ticket({owner, type, date, usedTime: 0});
  const done = await newTicket.save()
  .then(_ => true)
  .catch(err => errHandler(err, res))

  if(done) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create Ticket success by ${req.user.name}`);
    res.status(200).send("Create ticket success");
  }
  else return;
})

router.post("/use", async (req, res) => {
  if(!req.isLogin || req.user.group !== "foodStaff") {
    res.status(401).send("Not authorized");
    return;
  }
  const {owner, type} = req.body;
  if(!owner || !type) {
    res.status(400).send("Missing field");
    return;
  }
  const date = today();
  let tickets = await Ticket.find({owner, type, date})
  .populate('owner', '_id name email group')
  .then(ticket => ticket)
  .catch(err => errHandler(err));
  if(!tickets || tickets.length === 0) {
    res.status(401).send("No Ticket!");
    return;
  }
  let ticket = tickets.find(ticket => ticket.usedTime === 0);
  if(!ticket) {
    res.status(401).send("Ticket is used!");
    return;
  }
  ticket.usedTime = Date.now();
  await ticket.save();
  res.status(200).send(ticket.owner);
  return;
})

router.get("/", async (req, res) => {
  if(!(req.isLogin)) {
    res.status(401).send("Not authorized");
  }
  let query = {...req.query};
  let populate = req.query.populate;
  delete query['populate'];
  if(!(["root", "foodStaff"].includes(req.user.group))) {
    query = {owner: req.user.id};
    populate = false
  }
  let thenable = Ticket.find(query);
  if(populate) thenable = thenable.populate('owner', '_id name email group');
  const tickets = await thenable
  .then(tickets => tickets)
  .catch(err => errHandler(err));
  if(tickets) res.status(200).send(tickets);
  else res.status(400).send("No Ticket Found");
  return;
})

const errHandler = (err, res) => {
  console.error(err);
  res.status(500).send("Server error");
}

module.exports = router;