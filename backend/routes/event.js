const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const User = require("../models/user");
const TX = require("../models/transaction");
const Like = require("../models/like");
const Paper = require("../models/paper");
const Record = require("../models/record");
const rename = require("../papers/rename");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");

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

const getContent = async (id) => {
  const path = `./papers/filesInId/${id.slice(0,24)}/${id.slice(24)}.txt`;
  const content = await fs.readFile(path)
    .then((data) => {
      const lines = data.toString().split('\n');
      const outlineReducer = (acc, cur, idx) => {
        return idx === 0 ? cur : acc + '\n' + cur;
      }
      return lines.reduce(outlineReducer, '');
    })
    .catch((err) => {
      return err.message;
    });
  return content;
}

router.get('/paperPage', async (req, res) => {
  if (!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create event failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (!req.query || !req.query.id || !req.user || !req.user.id) {
    res._destroy(400).send("Missing field");
    return;
  }
  console.log(req.query.id);
  const eventId = req.query.id.substring(0, 24);
  const paperId = req.query.id.substring(24);
  const userId = req.user.id;
  const user = await User.findById(userId)
    .then(user => user)
    .catch(_ => false);
  if (!user) {
    res.status(400).send("User does not exist");
    return;
  }
  const event = await Event.findById(eventId)
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
  const papers = [...event.papers];
  if(!paperId in papers) {
    res.status(400).send('Invalid paper id');
    return;
  }
  const content = await getContent(req.query.id);
  res.status(200).send(content);
  return;
});

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
      path: 'papers',
      select: '_id title authors ',
      populate: {
        path: 'paper'
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
  const papers = [...event.papers];

  const likeResponse = (paperId, paperTitle, paperAuthors, userId, likes) => {
    let likeState = 0;
    const totalLikes = likes.reduce((sum, current) => {
      if (current.user == userId) likeState = current.state;
      return (sum + current.state);
    }, 0);
    return { paperId, paperTitle, paperAuthors, likeState, totalLikes };
  };

  const likeResponseAry = await Promise.all(papers.map(paper => {
    const { _id: paperId, authors: paperAuthors, title: paperTitle } = paper;
    return Like.find({ event: event._id, paper: paperId })
      .then( async likes => (
        {
          ...likeResponse(paperId, paperTitle, paperAuthors, userId, likes),
          content: false//await getContent(`${event._id}${paperId}`)
        }
      ))
      .catch(err => errHandler(err, res))
  }))

  if (likeResponseAry.length === papers.length) {
    res.status(200).send(likeResponseAry);
    return;
  }
  else {
    res.status(500).send("Query like state failed");
  }
});

router.get('/', async (req, res) => {
  const userProjection = "_id name email group";
  let timeRange = null;
  if (!req.isLogin) {
    res.status(401).send("Operation not allowed");
    return;
  }
  if (req.query.begin && req.query.end) {
    timeRange = { begin: { $gte: req.query.begin }, end: { $lte: req.query.end } };
  }

  if(req.user.group === 'user') {
    Event.find()
    .populate('participant', null, { user: mongoose.Types.ObjectId(req.user.id) })
    .exec((err, events) => {
      if(err) errHandler(err, res);
      else {
        const filteredEvents = events.filter(event => event.participant && event.participant.length > 0);
        res.status(200).send(filteredEvents);
      }
    })
    return;
  }
  if (req.query.id || req.query.name) {
    let query = null;
    if (req.query.id) query = Event.findById(req.query.id);
    else query = await Event.findOne({ name: req.query.name }).populate({
      path: 'participant',
      populate: { path: 'user', select: userProjection }
    });
    res.status(200).send(query);
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
    .populate(req.query.populate?{
      path: 'participant',
      populate: { path: 'user', select: userProjection }
    }:'')
    .exec((err, events) => {
      if(err) errHandler(err, res);
      else if(req.query.group) {
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
  if (user.group !== 'user') {
    res.status(401).send("Not user type");
    return;
  }
  
  const joined = event.participant.find(record => String(record.user) === userId);
  if(joined) {
    res.status(400).send("Already joined event");
    return;
  }
  let d = now.getTime();
  const newRecord = Record({"user":userId,"usedTime":d});
  await newRecord.save()
  .then(_ => true)
  .catch(err => errHandler(err));
  

  await Event.updateOne({_id: event._id}, {$push: {participant : newRecord}});
  // Give reward to this user
  const newTx = TX({  to: userId, amount: event.reward, timestamp: d })
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
  await Event.updateOne({ _id: event._id }, { $push: { author: author } });
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
    .populate('participant')
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

  let { eventId, paperId, likeState } = req.body;
  if (Math.abs(likeState) > 0) {
    likeState = likeState > 0 ? 1 : -1;
  }
  const userId = req.user.id;
  if (!eventId || !paperId || !userId) {
    res.status(400).send("Missing field!");
    return;
  }

  const filter = {
    user: userId,
    event: eventId,
    paper: paperId,
  };
  const upserted = await Like.updateOne(filter, { state: likeState, timestamp: d.getTime() }, {
    new: true, upsert: true
  })
    .then(doc => doc.upserted)
    .catch(err => errHandler(err));
  if(upserted !== undefined) {
    const newTx = TX({  to: userId, amount: 2, timestamp: d.getTime() })
    await newTx.save()
      .then(_ => true)
      .catch(err => errHandler(err));
  }
  res.status(200).send({ id: userId, event: eventId, paper: paperId, likeState });
})

router.post('/addPaper', async (req, res) => {
  if (!req.isLogin) {
    console.log(`Add paper failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }

  const { eventName, paperId, paperTitle, paperAuthors, paperGroup, paperContent } = req.body;
  if(!eventName || !paperId || !paperTitle || !paperAuthors || !paperContent || !paperGroup) {
    res.status(400).send("Missing field!");
  }
  const event = await Event.findOne({name: eventName})
    .then(event => event ? event : false)
    .catch(err => {
      errHandler(err);
      return false;
    });
  if(!event) {
    res.status(404).send("event not found");
    return;
  }
  // update(or create) paper
  let d = new Date();
  const update = {
    title: paperTitle, 
    event: event, 
    authors: paperAuthors, 
    group: paperGroup,
    timestamp: d.getTime()
  }
  const paperUpdated = await Paper.findOneAndUpdate({ title: paperTitle }, update, {
    new: true,
    upsert: true,
    rawResult: true
  })
    .then( doc => 
      doc.lastErrorObject.updatedExisting ? 
      {upserted: false, id: doc.value._id} : 
      {upserted: true, id: doc.lastErrorObject.upserted}
      // ({upserted}) => upserted ? upserted[0] : true  //format of upserted: [ { index: 0, _id: 5f70ac5d6ffeb69ab66efc0e } ]
    )
    .catch(err => {
      errHandler(err, res);
      return false;
    });
  if(!paperUpdated) return;
  //push the new or the updated paper in the corresponded event
  if(paperUpdated.upserted === true) {
    const paper = await Paper.findById(paperUpdated.id)
      .then(paper => paper ? paper : false)
      .catch(_ => false);
    if(paper) {
      Event.updateOne({_id: event._id}, {$push: {papers : paper}})
        .then()
        .catch(err => {
          errHandler(err, res);
          return;
        });
    } else {
      res.status(404).send("paper not found");
      return;
    }
  }
  //create content file(in name and in id)
  const path = `./papers/filesInId/${event._id}`;
  const createPaperFile = async () => {
    await fs.writeFile(`${path}/${paperUpdated.id}.txt`, `${paperContent}`);  //if paperTitle is unique, paperId can change to paperTitle
    // await fs.writeFile(`./papers/filesInName/${eventName}/${paperTitle.split(' ').join()}.txt`, `${paperContent}`);  //if paperTitle is unique, paperId can change to paperTitle
    res.status(200).send(`Write ${paperTitle}'s content file in ${eventName} success`);
  }
  fs.mkdir(path, { recursive: true })
    .then( async () => {
      try {
        createPaperFile();
      } catch (err) {
        errHandler(err, res);
        return;
      }
    } )
    .catch( async err => {
      if(err.errno === -4075) createPaperFile();
      else  errHandler(err, res);
    })
})

router.post('/rename', async (req, res) => {
  if (!req.isLogin) {
    console.log(`Add author failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }

  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }
  res.status(200).send({failedAry: await rename()});
})

router.get('/thresholds', async (req, res) => {
  if (!req.isLogin) {
    res.status(401).send("Not logged in");
    return;
  }
  let entries = null;
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../config.json'));
    entries = JSON.parse(data);
  }
  catch(err) {
    console.log(err);
    res.status(400).send("Read File Error");
    return;
  }
  if (!entries.Thresholds) {
    res.status(404).send("File Missing Thresholds");
    return;
  }
  if (!entries.Thresholds.CompanyBar || !entries.Thresholds.CourseBar) {
    res.status(404).send("File Missing Thresholds Data");
    return;
  }
  res.status(200).send(entries.Thresholds);
  return;
})

router.post('/lottery', async (req, res) => {
  if (!req.isLogin) {
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("Not authorized");
    return;
  }
  const {course, company} = req.body;
  if( course===null || company===null ) {
    res.status(400).send("Missing field");
    return;
  }
  let entries;
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../config.json'));
    entries = JSON.parse(data);
  }
  catch(err) {
    console.log(err);
    res.status(400).send("Read File Error");
    return;
  }
  entries.Thresholds["CourseBar"] = String(course);
  entries.Thresholds["CompanyBar"] = String(company);
  fs.writeFile( path.resolve(__dirname, '../config.json'), JSON.stringify(entries, null, 2), (err) => {
    if(err){
      console.log(err);
      res.status(400).send("Write File Error");
      return;
    }
  });
  res.status(200).send("Update thresholds success");
})

const errHandler = (err, res) => {
  console.error(err);
  res.status(500).send("Server error");
}

module.exports = router;
