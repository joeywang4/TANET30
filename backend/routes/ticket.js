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
  let {owner, type, date} = req.body;
  if(!owner || !type || !date) {
    res.status(400).send("Missing field");
    return;
  }
  if(!req.isLogin || (owner !== req.user.id && req.user.group !== "root")) {
    res.status(401).send("Not authorized");
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
  // Check the request ticket time is one day after
  let day = parseInt(date.split('-').pop());
  let d = new Date();
  let nowday = d.getDate();
  let nowhour = d.getHours();
  /* 
    Buggy! 
    These conditions will fail when the date is at the end of the month.
    For example, 30 (or 31) > 1 but it is yesterday.
  */
  if(day < nowday){
    res.status(400).send("Expired date!");
    return;
  }
  else if(
    req.user.group !== "root" && day === nowday && type === 'lunch'
  ){
    res.status(400).send("Too late to request a lunch ticket");
    return;
  }
  else if(
    req.user.group !== "root" && day === nowday && type === 'dinner' && nowhour > 12
  ){
    res.status(400).send("Too late to request a dinner ticket");
    return;
  }
  // Check if ticket already exists
  let tickets = await Ticket.find({owner, type, date})
  .then(ticket => ticket)
  .catch(err => errHandler(err));
  if(tickets.length !== 0){
    res.status(400).send("Ticket already exists!");
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

router.post("/delete", async (req, res) => {
  let {owner, type, date} = req.body;
  if(!owner || !type || !date) {
    res.status(400).send("Missing field");
    return;
  }
  if(!req.isLogin || (owner !== req.user.id && req.user.group !== "root")) {
    res.status(401).send("Not authorized");
    return;
  }

  let tickets = await Ticket.find({owner, type, date})
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
  ticket.deleteOne();
  res.status(200).send("OK");
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
  /* 
    thenable.length() will cause an error. (thenable.length is not a function)
    Note that thenable is an unresolved Promise, and not an array.
    ---
    Update tickets on query is OK, but I would prefer filtering out outdated tickets in the frontend.
    This will reduce some computational effort for both the backend and the DB.
  */
  // Check if available tickets are overdued
  // for(var i = 0; i < thenable.length(); ++i){
  //   const nowday = Date.getDate();
  //   console.log(nowday);
  //   console.log(thenable[i].date.split('-').pop());
  //   if(thenable[i].date.split('-').pop() <= nowday && thenable[i].usedTime==0){
  //     thenable[i].usedTime = 1;
  //   }
  // }
  // await thenable.save();
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
