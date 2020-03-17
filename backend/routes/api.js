const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const TX = require("../models/transaction");
const User = require("../models/user");

const getBalance = (id, TXs) => {
  let balance = 0;
  for(let TX of TXs) {
    if(TX.from === id) balance -= parseInt(TX.amount);
    else balance += parseInt(TX.amount);
  }
  return balance;
}

router.get('/TX', (req, res) => {
  if(req.query.id) {
    const id = req.query.id;
    TX.find({$or: [{'from': id}, {'to': id}]}, (err, TXs) => {
      if(err) return errHandler(err, res);
      else res.status(200).send(TXs);
    })
  }
  else if(req.query.from) {
    TX.find({'from': req.query.from}, (err, TXs) => {
      if(err) return errHandler(err, res);
      else res.status(200).send(TXs);
    })
  }
  else if(req.query.to) {
    TX.find({'to': req.query.to}, (err, TXs) => {
      if(err) return errHandler(err, res);
      else res.status(200).send(TXs);
    })
  }
  else res.status(400).send("Missing query field");
})

router.post('/TX', async (req, res) => {
  let d = new Date();
  if(!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create transaction failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  const { to, amount } = req.body;
  if(!to || !amount) {
    res.status(400).send("Missing receiver or amount");
    return;
  }
  const from = req.user.id;
  const timestamp = d.getTime();
  const TXs = await TX.find({$or: [{'from': from}, {'to': from}]}, (err, TXs) => {
    if(err) return errHandler(err, res);
    else return TXs;
  });
  console.log(getBalance(from, TXs), amount);
  if(getBalance(from, TXs) < amount) {
    res.status(400).send("Not enough balance");
    return;
  }
  const newTX = TX({ from, to, amount, timestamp });
  const done = newTX.save()
  .then(_ => true)
  .catch(err => errHandler(err, res));

  if(done) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create TX success: \$${amount} from ${from} to ${to}`);
    res.status(200).send("Create transaction success");
  }
  else res.status(400).send("Create transaction failed");
  return;
})

router.post('/event', async (req, res) => {
  let d = new Date();
  if(!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  const { name, begin, end, password } = req.body;
  const admin = req.user.id;
  if(!name || !begin || !end || !admin) {
    res.status(400).send("Missing field");
    return;
  }
  if(req.user.group === 'user') {
    res.status(403).send("Operation not allowed");
    return;
  }

  const exists = await Event.findOne({name}, (err, event) => {
    if(event) return true;
    else if(err) {
      errHandler(err, res);
      return true;
    }
    return false;
  })
  if(exists) {
    res.status(400).send("Event name already exists");
    return;
  }

  const newEvent = Event({admin, name, begin, end, participant: [], password});
  const done = newEvent.save()
  .then(_ => true)
  .catch(err => errHandler(err, res));

  if(done) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create Event success: ${name} by ${req.user.name}`);
    res.status(200).send("Create event success");
  }
  else res.status(500).send("Create event failed");
  return;
})

router.get('/event', (req, res) => {
  const projection = "_id admin name begin end participant";
  const userProjection = "_id name email";
  if(req.query.id) {
    Event.findById(req.query.id)
    .populate({
      path: 'participant',
      select: userProjection,
      populate: { 
        path: 'participant'
      }
    })
    .exec((err, event) => {
      if(err) errHandler(err, res);
      else if(!event) res.status(404).send("Not found");
      else {
        if(req.user && req.user.id === String(event.admin)) {
          res.status(200).send(event.toObject());
        }
        else {
          res.status(200).send({...event.toObject(), password: ""});
        }
      }
    })
  }
  else if(req.query.name) {
    Event.findOne({name: req.query.name}, projection)
    .populate({
      path: 'participant',
      select: userProjection,
      populate: { 
        path: 'participant'
      }
    })
    .exec((err, event) => {
      if(err) errHandler(err, res);
      else if(!event) res.status(404).send("Not found");
      else res.status(200).send(event.toObject());
    })
  }
  else if(req.query.admin) {
    Event.find({admin: req.query.admin}, projection)
    .populate({
      path: 'participant',
      select: userProjection,
      populate: { 
        path: 'participant'
      }
    })
    .exec((err, events) => {
      if(err) errHandler(err, res);
      else res.status(200).send(events);
    })
  }
  else {
    Event.find({}, projection)
    .populate({
      path: 'participant',
      select: userProjection,
      populate: { 
        path: 'participant'
      }
    })
    .exec((err, events) => {
      if(err) errHandler(err, res);
      else res.status(200).send(events);
    })
  }
})

const participate = async (res, now, event, userId) => {
  const beginDate = new Date(event.begin);
  if(
    beginDate.getFullYear() !== now.getFullYear() || 
    beginDate.getMonth() !== now.getMonth() || 
    beginDate.getDate() !== now.getDate()
  ) {
    res.status(400).send("Event is ended or is not started yet");
    return;
  }
  const user = await User.findById(userId)
  .then(user => {
    if(user) return user;
    else return false;
  })
  .catch(_ => false);
  if(user === false) {
    res.status(400).send("User does not exist");
    return;
  }
  const joined = event.participant.find(_user => String(_user) === String(userId));
  if(joined) {
    res.status(400).send("Already joined event");
    return;
  }

  await Event.updateOne({_id: event._id}, {$push: {participant: userId}});
  res.status(200).send({id: user._id, name: user.name});
}

router.post('/join', async (req, res) => {
  let d = new Date();
  if(!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Join event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }

  const { eventId, password } = req.body;
  const event = await Event.findById(eventId)
  .then(event => event)
  .catch(_ => false);
  if(!event) {
    res.status(400).send("Event does not exist")
    return;
  }
  if(password !== event.password) {
    res.status(401).send("Not allowed to join");
    return;
  }

  participate(res, d, event, req.user.id);
})

router.post('/addParticipant', async (req, res) => {
  let d = new Date();
  if(!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Add participant failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }

  const { eventId, userId } = req.body;
  if(!eventId || !userId) {
    res.status(400).send("Missing field!");
    return;
  }
  const event = await Event.findById(eventId, (err, event) => {
    if(event) return event;
    else if(err) {
      errHandler(err, res);
      return false;
    }
    else return false;
  })
  if(!event) {
    res.status(400).send("Event does not exist")
    return;
  }
  if(req.user.id !== String(event.admin)) {
    res.status(401).send("You are not admin");
    return;
  }

  participate(res, d, event, userId);
})

router.get('/user', (req, res) => {
  const findUser = _id => {
    User.findById(_id, (err, user) => {
      if(user) res.status(200).send({id: user._id, name: user.name, email: user.email})
      else res.status(400).send("Invalid ID");
    })
  }

  if(req.query.id) {
    findUser(req.query.id);
  }
  else if(req.isLogin) {
    findUser(req.user.id);
  }
  else res.send(400).send("Missing ID");
})

const errHandler = (err, res) => {
  console.error(err);
  res.status(500).send("Server error");
}

module.exports = router;