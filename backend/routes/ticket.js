const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticket");
const User = require("../models/user");
const fs = require('fs');
const path = require("path");

// Load meal boxes data from config.json
let MealBoxes = undefined;
try {
  const data = fs.readFileSync(path.resolve(__dirname, '../config.json'));
  MealBoxes = JSON.parse(data).MealBoxes;
}
catch(err) {
  console.log(err);
  console.log("[!] Load MealBoxes from config.json failed");
}

const re = /(\d{4})-([0-1]\d{1})-([0-3]\d{1})/;
const today = () => {
  const d = new Date();
  const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const [{ value: mm },,{ value: dd },,{ value: yy }] = dtf.formatToParts(d);
  return `${yy}-${mm}-${dd}`;
}
const [EXPIRED, INVALID_DATE, INVALID_LUNCH, INVALID_DINNER, OK] = [1, 2, 3, 4, 5];

function checkTime( postUser, ticketTime, ticketType ){
  const d = new Date();
  const [nowHour, nowDay, nowMonth, nowYear] = [
    d.getHours(), 
    d.getDate(), 
    d.getMonth()+1, 
    d.getFullYear()
  ];
  const [ticketYear, ticketMonth, ticketDay] = ticketTime.split("-",3).map(s => parseInt(s));
  //check the date
  if (
    ticketYear < nowYear || 
    (ticketYear === nowYear && ticketMonth < nowMonth) || 
    (ticketYear === nowYear && ticketMonth === nowMonth && ticketDay < nowDay)
  ) {
    return EXPIRED;
  }
  if (
    ticketYear > nowYear ||
    (ticketYear === nowYear && ticketMonth > nowMonth) ||
    (ticketYear === nowYear && ticketMonth === nowMonth && (ticketDay !== 28 && ticketDay !== 29 && ticketDay !== 30))
  ) {
    return INVALID_DATE;
  }
  //condition for adding meal today
  if (
    postUser !== "root" && // no restrictions for root
    ticketYear === nowYear && ticketMonth === nowMonth && ticketDay === nowDay // is today
  ) {
    if(ticketType === 'lunch' || ticketType === 'lunch(vegan)'){
      return INVALID_LUNCH;
    }
    else if(ticketType === 'dinner' && nowHour > 12){
      return INVALID_DINNER;
    }
  }
  return OK;
}

const leftMeal = async () => {
  const total_m = MealBoxes.Meat;
  const total_v = MealBoxes.Vegan;
  const type = MealBoxes.Type;
  const date = MealBoxes.Date;
  const type_v = type === "lunch" ? "lunch(vegan)" : "dinner(vegan)";

  let tickets = await Ticket.find({type, date})
  .then(ticket => ticket)
  .catch(err => {errHandler(err); return [];});
  let vtickets = await Ticket.find({type: type_v, date})
  .then(ticket => ticket)
  .catch(err => {errHandler(err); return [];});

  let usedTicketCount = tickets.reduce((count, ticket) => count + (ticket.usedTime === 0?0:1), 0);
  let usedVticketCount = vtickets.reduce((count, ticket) => count + (ticket.usedTime === 0?0:1), 0);
  return {"meat": total_m - usedTicketCount, "vegan": total_v - usedVticketCount};
}
const broadcastLeftMeal = async io => {
  const leftData = await leftMeal();
  io.emit("new-meal-count", leftData);
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
  switch(checkTime(req.user.group, date, type)){
    case OK: break;
    default:
    case EXPIRED: res.status(400).send("Expired date!"); return;
    case INVALID_DATE: res.status(400).send("Invalid date!"); return;
    case INVALID_LUNCH: res.status(400).send("Too late to request a lunch ticket"); return;
    case INVALID_DINNER: res.status(400).send("Too late to request a dinner ticket"); return;
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
  let {owner, type} = req.body;
  if(!owner) {
    res.status(400).send("Missing field");
    return;
  }
  if(!type) {
    const d = new Date();
    const h = d.getHours();
    type = h > 15 ? "dinner" : "lunch";
  }
  const date = today();
  let tickets = await Ticket.find({owner, type, date})
  .populate('owner', '_id name email group')
  .then(ticket => ticket)
  .catch(err => errHandler(err));
  if(!tickets || tickets.length === 0) {
    res.status(403).send("No Ticket!");
    return;
  }
  let ticket = tickets.find(ticket => ticket.usedTime === 0);
  if(!ticket) {
    res.status(403).send(`${tickets[0].owner.name} Ticket is used!`);
    return;
  }
  ticket.usedTime = Date.now();
  await ticket.save();
  res.status(200).send(ticket.owner);
  broadcastLeftMeal(req.app.get('io'));
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


router.get("/avail", async (req, res) => {
  if (MealBoxes === undefined) {
    res.status(404).send("File Missing MealBoxes");
    return;
  }
  if (Object.keys(MealBoxes).length !== 4) {
    res.status(404).send("File Missing MealBoxes Data");
    return;
  }

  if (MealBoxes.Date !== today()) {
    res.status(200).send({"meat": "待更新", "vegan": "待更新"});
    return;
  }
  const leftData = await leftMeal();
  res.status(200).send(leftData);
  return;
})


router.get("/", async (req, res) => {
  if(!(req.isLogin)) {
    res.status(401).send("Not authorized");
    return;
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


router.post("/amount", async (req, res) => {
  if(!(req.isLogin) || (req.user.group !== "root" && req.user.group !== "foodStaff")){
    res.status(401).send("Not authorized");
    return;
  }
  let {type, meat, vegan} = req.body;
  if(!type || !meat || !vegan){
    res.status(400).send("Missing field");
    return;
  }
  let entries = null;
  try {
    const data = await fs.promises.readFile(path.resolve(__dirname, '../config.json'));
    entries = JSON.parse(data);
  }
  catch(err) {
    console.log(err);
    res.status(400).send("Read File Error");
    return;
  }
  if (!entries.MealBoxes) {
    res.status(404).send("File Missing MealBoxes");
    return;
  }
  if (Object.keys(entries.MealBoxes).length !== 4) {
    res.status(404).send("File Missing MealBoxes Data");
    return;
  }
  const date = today();
  if( entries.MealBoxes.Date === date && entries.MealBoxes.Type === type && req.user.group !== "root" ){
    res.status(403).send("This meal has already been updated!");
    return;
  }
  entries.MealBoxes.Date = date;
  entries.MealBoxes.Type = type;
  entries.MealBoxes.Meat = meat;
  entries.MealBoxes.Vegan = vegan;
  MealBoxes = entries.MealBoxes;
  await fs.promises.writeFile(path.resolve(__dirname, '../config.json'), JSON.stringify(entries, null, 2));
  res.status(200).send("Update mealboxes amount success");
  broadcastLeftMeal(req.app.get('io'));
  return;
})



const errHandler = (err, res) => {
  console.error(err);
  if(res) res.status(500).send("Server error");
}

module.exports = router;
