const express = require("express");
const router = express.Router();
const Event = require("../models/event");
const User = require("../models/user");
const TX = require("../models/transaction");
const Like = require("../models/like");
const Paper = require("../models/paper");
const Record = require("../models/record");
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
  const { name, period, date, begin, end, password, reward } = req.body;
  let admin = req.user.id;
  if (!name || !period || !date || !begin || !end || !admin || !reward) {
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

  const newEvent = Event({ admin, name, date, begin, end, participant: [], reward, password, period });
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
    .populate('participant', null, { user: mongoose.Types.ObjectId(userId) })
    .then(event => event ? event : false)
    .catch(_ => false);
  if (!event) {
    res.status(404).send("Event not found");
    return;
  }
  if (!(event.participant && event.participant.length > 0)) {
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
  const userProjection = "_id name email group sector";
  let timeRange = null;
  if (!req.isLogin) {
    res.status(401).send("Operation not allowed");
    return;
  }
  if (req.query.begin && req.query.end) {
    timeRange = { begin: { $gte: req.query.begin }, end: { $lte: req.query.end } };
  }

  if( !( ['root', 'foodStaff', 'seminarStaff', 'company'].includes(req.user.group) ) ) {
    Event.find()
    .populate('admin', userProjection)
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
    if (req.query.id) query = await Event.findById(req.query.id);
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

router.post('/addPrize', async (req, res) => {
  if (!req.isLogin) {
    console.log(`Add author failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }
  
  const { itemName: item, price: price } = req.body;
  if(!item || !price) {
    res.status(400).send('missing feild');
    return;
  }
  prize = { item, price };
  itemFileName = item.split(' ').join('');
  fs.writeFile(`./prizes/${itemFileName}.json`, JSON.stringify(prize))
  .then( _ => res.status(200).send('success') )
  .catch( err => errHandler(err, res) );
});

router.post('/createPriceTable', async (req, res) => {
  if (!req.isLogin) {
    console.log(`Add author failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("You are not authorized");
    return;
  }

  const path = './prizes'
  const dir = await fs.opendir(path);
  let priceTable = [];
  for await (const dirent of dir) {
    // console.log(dirent);
    if(dirent.name.slice(-5) === '.json' && dirent.name !== 'PriceTable.json') {
      const prize = await fs.readFile(`${path}/${dirent.name}`)
        .then( jsonStr => JSON.parse(jsonStr))
        .catch( err => console.log('parsing error!', err));
      priceTable.push(prize);
    }
  } 
  priceTable.sort((a, b) =>  Number(a.price) - Number(b.price))
  // console.log(priceTable);
  fs.writeFile(`${path}/PriceTable.json`, JSON.stringify(priceTable))
  .then( () => res.status(200).send('create prize table completed'))
  .catch( err => errHandler(err, res));
  
})

const participate = async (res, now, event, userId) => {
  const beginDate = new Date(event.begin);
  if (
    beginDate.getFullYear() !== now.getFullYear() ||
    beginDate.getMonth() !== now.getMonth() ||
    beginDate.getDate() !== now.getDate()
  ) {
    res.status(403).send("Event is ended or is not started yet");
    return;
  }
  const user = await User.findById(userId)
    .then(user => {
      if (user) return user;
      else return false;
    })
    .catch(_ => false);
  if (user === false) {
    res.status(422).send("User does not exist");
    return;
  }
  if (user.group !== 'user') {
    res.status(422).send("Not user type");
    return;
  }
  
  const joined = event.participant.find(record => String(record.user) === userId);
  if(joined) {
    res.status(403).send(`${user.name} had already joined the event!`);
    return;
  }
  let d = now.getTime();
  
  let samePeriod = false;
  if(event.period > 0) {
    samePeriod = await Record.findOne({ user: userId, date: event.date, period: event.period }, (err, rec) => {
      if (rec) return true;
      else if (err) {
        errHandler(err, res);
        return false;
      }
      return false;
    });

  }
  // Give reward to this user
  const info = samePeriod ? `No reward for ${event.name} (period-overlapping)` : `Attended ${event.name}`
  const newTx = TX({ to: userId, info, amount: (samePeriod? 0 : event.reward), timestamp: d })
  await newTx.save()
  .then(_ => true)
  .catch(err => errHandler(err));
  // console.log(samePeriod);
  
  const newRecord = Record({ user: userId, usedTime: d, date: event.date, period: event.period });
  await newRecord.save()
  .then(_ => true)
  .catch(err => errHandler(err));
  
  await Event.updateOne({_id: event._id}, {$push: {participant : newRecord}});

  res.status(200).send({ id: user._id, name: user.name, sharing: user.sharing, reward: !samePeriod });
}

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
    res.status(404).send("Event does not exist")
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
  if (likeState > 3) {
    likeState = 3;
  }
  else if (likeState < 0) {
    likeState = 0;
  }
  const userId = req.user.id;
  if (!eventId || !paperId || !userId) {
    res.status(400).send("Missing field!");
    return;
  }

  const userProjection = "_id name email group"

  const event = await Event.findById(eventId)
    .populate({
      path: 'participant',
      populate: { path: 'user', select: userProjection }
    })
    .then(event => event ? event : false)
    .catch(err => {
      errHandler(err);
      return false;
    });
  if(!event) {
    res.status(400).send("Event not found!");
    return;
  }


  const p = await Paper.findById(paperId)
    .then(p => p?p:false)
    .catch(err => {
      errHandler(err);
      return false;
    })
  if(!p) {
    res.status(400).send('Paper not found!');
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
    const newTx = TX({  to: userId, info: `Rated paper: ${p.title}`, amount: 2, timestamp: d.getTime() })
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

  const { eventName, paperGroup, paperId, paperTitle, paperAuthors, paperContent } = req.body;
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
    event: event, 
    group: paperGroup,
    title: paperTitle, 
    authors: paperAuthors, 
    timestamp: d.getTime()
  }
  const paperUpdated = await Paper.findOneAndUpdate({ ID: paperId, title:paperTitle }, update, {
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

router.post('/lotteryList', async (req, res) => {
  if (!req.isLogin) {
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("Not authorized");
    return;
  }
  const {name, sector, index} = req.body;
  if( name===null || sector===null ) {
    res.status(400).send("Missing field");
    return;
  }
  let entries;
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../lotteryList.json'));
    entries = JSON.parse(data);
  }
  catch(err) {
    console.log(err);
    res.status(400).send("Read File Error");
    return;
  }
  entries.Users[index] = { 'name':name, 'sector':sector };
  fs.writeFile( path.resolve(__dirname, '../lotteryList.json'), JSON.stringify(entries, null, 2), (err) => {
    if(err){
      console.log(err);
      res.status(400).send("Write File Error");
      return;
    }
  });
  res.status(200).send("Update lottery list success");
})

router.post('/clearList', async (req, res) => {
  let d = new Date();
  if (!req.isLogin) {
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== "root") {
    res.status(401).send("Not authorized");
    return;
  }
  let entries;
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../lotteryList.json'));
    entries = JSON.parse(data);
  }
  catch(err) {
    console.log(err);
    res.status(400).send("Read File Error");
    return;
  }
  entries.Date = `${d.toLocaleDateString()}, ${d.toLocaleTimeString()}`;
  entries.Users = [];
  fs.writeFile( path.resolve(__dirname, '../lotteryList.json'), JSON.stringify(entries, null, 2), (err) => {
    if(err){
      console.log(err);
      res.status(400).send("Write File Error");
      return;
    }
  });
  res.status(200).send("Reset lottery list success");
})

router.get("/namelist", async (req, res) => {
  let entries;
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../lotteryList.json'));
    entries = JSON.parse(data);
  }
  catch(err) {
    console.log(err);
    res.status(400).send("Read File Error");
    return;
  }
  res.status(200).send(entries);
})


const errHandler = (err, res) => {
  console.error(err);
  if(res) res.status(500).send("Server error");
}

module.exports = router;
