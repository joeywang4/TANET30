const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const User = require("../models/user");
const TX = require("../models/transaction");
const Like = require("../models/like");

router.post('/', async (req, res) => {
  let d = new Date();
  if (!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  const { name, begin, end, password, reward } = req.body;
  let admin = req.user.id;
  if (!name || !begin || !end || !admin || !reward) {
    res.status(400).send("Missing field");
    return;
  }
  if (req.user.group === 'user') {
    res.status(401).send("Operation not allowed");
    return;
  }
  if (req.user.group === 'root' && req.body.admin) {
    admin = req.body.admin;
    let handler = (err, user) => {
      if (user) return user._id;
      else if (err) {
        errHandler(err, res);
        return null;
      }
      return null;
    }
    if (admin.indexOf("@") !== -1) {
      admin = await User.findOne({ email: admin }, handler);
    }
    else {
      admin = await User.findById(admin, handler);
    }
    if (admin === null) {
      res.status(400).send("Admin does not exist");
      return;
    }
  }

  const exists = await Event.findOne({ name }, (err, event) => {
    if (event) return true;
    else if (err) {
      errHandler(err, res);
      return true;
    }
    return false;
  })
  if (exists) {
    res.status(400).send("Event name already exists");
    return;
  }

  const newEvent = Event({ admin, name, begin, end, participant: [], author: [], reward, password });
  const done = newEvent.save()
    .then(_ => true)
    .catch(err => errHandler(err, res));

  if (done) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create Event success: ${name} by ${req.user.name}`);
    res.status(200).send("Create event success");
  }
  else return;
})

router.get('/page', async (req, res) => {
  if (!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (!req.query || !req.query.id || !req.user || !req.user.id) {
    res._destroy(400).send("Missing field");
    return;
  }
  const eventId = req.query.id;
  const userId = req.user.id;
  const user = await User.findById(userId)
    .then(user => user)
    .catch(_ => false);
  if (!user) {
    res.status(400).send("User does not exist");
    return;
  }
  const event = await Event.findById(eventId)
    .populate({
      path: 'author',
      select: '_id name',
      populate: {
        path: 'author'
      }
    })
    .then(event => event ? event : false)
    .catch(_ => false);
  if (!event) {
    res.status(404).send("Event not found");
    return;
  }
  if (!userId in event.participant) {
    res.status(401).send('Unauthorized');
    return;
  }
  const authors = [...event.author];

  const likeResponse = (authorId, authorName, userId, likes) => {
    let likeState = 0;
    const totalLikes = likes.reduce((sum, current) => {
      if (current.user == userId) likeState = current.state;
      return (sum + current.state);
    }, 0);
    return { authorId, authorName, likeState, totalLikes };
  };

  const likeResponseAry = await Promise.all(authors.map(author => {
    const { _id: authorId, name: authorName } = author;
    return Like.find({ event: event._id, author: authorId })
      .then(likes => likeResponse(authorId, authorName, userId, likes))
      .catch(err => errHandler(err, res))
  }))

  if (likeResponseAry.length === authors.length) {
    res.status(200).send(likeResponseAry);
    return;
  }
  else {
    res.status(500).send("Query like state failed");
  }
});

router.get('/', (req, res) => {
  const userProjection = "_id name email group";
  let timeRange = null;
  if (!req.isLogin) {
    res.status(401).send("Operation not allowed");
    return;
  }
  if (req.query.begin && req.query.end) {
    timeRange = { begin: { $gte: req.query.begin }, end: { $lte: req.query.end } };
  }

  if (req.user.group === 'user') {
    Event.find({ participant: req.user.id }, (err, events) => {
      if (err) errHandler(err, res);
      else res.status(200).send(events);
    })
    return;
  }
  if (req.user.group === 'root') {
    Event.find({}, (err, events) => {
      if (err) errHandler(err, res);
      else res.status(200).send(events.map((event) => ({ _id: event._id, name: event.name })));
    })
    return;
  }
  if (req.query.id || req.query.name) {
    let query = null;
    if (req.query.id) query = Event.findById(req.query.id);
    else query = Event.findOne({ name: req.query.name });
    query
      .populate('admin', userProjection)
      .populate({
        path: 'participant',
        select: userProjection,
        populate: {
          path: 'participant'
        }
      })
      .exec((err, event) => {
        if (err) errHandler(err, res);
        else if (!event) res.status(404).send("Not found");
        else res.status(200).send(event.toObject());
      })
    return;
  }
  else {
    let queryObj = {};
    if (timeRange) queryObj = { ...queryObj, ...timeRange };
    if (req.query.admin) {
      if (req.query.admin !== req.user.id && req.user.group !== 'root') {
        res.status(401).send("Operation not allowed");
        return;
      }
      else {
        queryObj = { ...queryObj, admin: req.query.admin };
      }
    }
    else if (req.query.group && req.query.group !== req.user.group && req.user.group !== 'root') {
      res.status(401).send("Operation not allowd");
      return;
    }
    Event.find(queryObj)
      .populate('admin', userProjection)
      .populate(req.query.populate ? {
        path: 'participant',
        select: userProjection,
        populate: {
          path: 'participant'
        }
      } : '')
      .exec((err, events) => {
        if (err) errHandler(err, res);
        else if (req.query.group) {
          res.status(200).send(events.filter(event => event.admin.group === req.query.group));
        }
        else res.status(200).send(events);
      })
    return;
  }
})

const participate = async (res, now, event, userId) => {
  const beginDate = new Date(event.begin);
  if (
    beginDate.getFullYear() !== now.getFullYear() ||
    beginDate.getMonth() !== now.getMonth() ||
    beginDate.getDate() !== now.getDate()
  ) {
    res.status(400).send("Event is ended or is not started yet");
    return;
  }
  const user = await User.findById(userId)
    .then(user => {
      if (user) return user;
      else return false;
    })
    .catch(_ => false);
  if (user === false) {
    res.status(400).send("User does not exist");
    return;
  }
  const joined = event.participant.find(_user => String(_user) === String(userId));
  if (joined) {
    res.status(400).send("Already joined event");
    return;
  }

  await Event.updateOne({ _id: event._id }, { $push: { participant: userId } });
  // Give reward to this user
  let d = new Date();
  const newTx = TX({ to: userId, amount: event.reward, timestamp: d.getTime() })
  await newTx.save()
    .then(_ => true)
    .catch(err => errHandler(err));
  res.status(200).send({ id: user._id, name: user.name });
}

router.post('/join', async (req, res) => {
  let d = new Date();
  if (!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Join event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  res.status(401).send("Join event with password is currently not allowed");
  return;
})

router.post('/clearEvent', async (req, res) => {
  if (!req.isLogin) {
    console.log(`Clear Event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }
  const del = await Event.deleteMany({});
  // May be buggy
  // not all transactions are came from events
  const delTx = await TX.deleteMany({});
  res.status(200).send(`${del.deletedCount + delTx.deletedCount}`);
})

router.post('/clearLike', async (req, res) => {
  if (!req.isLogin) {
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }
  del = await Like.deleteMany({});
  res.status(200).send(`${del.deletedCount}`);
})

router.post('/addAuthor', async (req, res) => {
  if (!req.isLogin) {
    console.log(`Add author failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }

  const { eventId, eventName, authorIds } = req.body;
  if ((!eventId && !eventName) || !authorIds) {
    res.status(400).send("Missing field!");
    return;
  }

  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }

  let event = null;
  if (eventId) {
    event = await Event.findById(eventId)
    .then(event => event ? event : false)
    .catch(err => {
      errHandler(err);
      return false;
    });
  }
  else {
    event = await Event.findOne({name: eventName})
    .then(event => event ? event : false)
    .catch(err => {
      errHandler(err);
      return false;
    });
  }
  if (!event) {
    res.status(400).send("Event does not exist")
    return;
  }
  
  const checkAuthor = async (author) => {
    if (author.indexOf("@") !== -1) {
      author = await User.findOne({ email: author })
        .then(user => {
          if (user) return user._id;
          else return null;
        })
        .catch(_ => false);
    }
    else {
      author = await User.findById(author)
        .then(user => {
          if (user) return user;
          else return null;
        })
        .catch(_ => false);
    }
    return author;
  }

  if(Array.isArray(authorIds)) {
    const checkedAuthorIds = await Promise.all(authorIds.map( authorEmail => checkAuthor(authorEmail)))
    const errorIndex = checkedAuthorIds.findIndex(element => element === null);
    if(errorIndex !== -1) {
      res.status(400).send(`Please check author email, index: ${errorIndex}`);
      return;
    }
    await Event.updateOne({ _id: event._id }, { author: checkedAuthorIds });
    res.status(200).send({ eventName: event.name, authorIds: checkedAuthorIds });
    return;
  }
  const authorId = authorIds;
  const author = await checkAuthor(authorId);
  if(!author) {
    res.status(400).send("Author does not exist");
    return;
  }
  const joined = event.author.find(_user => String(_user._id) === authorId);
  if (joined) {
    res.status(400).send("Already been author");
    return;
  }
  await Event.updateOne({ _id: event._id }, { $push: { author: authorId } });
  res.status(200).send({ eventName: event.name, authorName: author.name });
})

router.post('/addParticipant', async (req, res) => {
  let d = new Date();
  if (!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Add participant failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }

  const { eventId, userId } = req.body;
  if (!eventId || !userId) {
    res.status(400).send("Missing field!");
    return;
  }
  const userProjection = "_id name email group";
  const event = await Event.findById(eventId).populate('admin', userProjection)
    .then(event => event ? event : false)
    .catch(err => {
      errHandler(err);
      return false;
    });

  if (!event) {
    res.status(400).send("Event does not exist")
    return;
  }
  if (req.user.id !== String(event.admin._id) && req.user.group !== 'root') {
    if (event.admin.group === "seminarStaff") {
      if (req.user.group !== "seminarStaff") {
        res.status(401).send("You are not a seminar staff");
        return;
      }
    }
    else if (event.admin.group === "foodStaff") {
      if (req.user.group !== "foodStaff") {
        res.status(401).send("You are not a food staff");
        return;
      }
    }
    else {
      res.status(401).send("You are not admin");
      return;
    }
  }

  participate(res, d, event, userId);
})

router.post('/like', async (req, res) => {
  let d = new Date();
  if (!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Like or dislike failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }

  let { eventId, authorId, likeState } = req.body;
  if (Math.abs(likeState) > 0) {
    likeState = likeState > 0 ? 1 : -1;
  }
  const userId = req.user.id;
  if (!eventId || !authorId || !userId) {
    res.status(400).send("Missing field!");
    return;
  }

  const filter = {
    user: userId,
    event: eventId,
    author: authorId,
  };
  await Like.updateOne(filter, { state: likeState, timestamp: d.getTime() }, {
    new: true, upsert: true
  })
    .then(_ => true)
    .catch(err => errHandler(err));
  res.status(200).send({ id: userId, event: eventId, author: authorId, likeState });
})


const errHandler = (err, res) => {
  console.error(err);
  res.status(500).send("Server error");
}

module.exports = router;