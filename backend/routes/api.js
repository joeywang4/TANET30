const express = require("express");
const router = express.Router();
const TX = require("../models/transaction");
const User = require("../models/user");
const fs = require("fs").promises;
const path = require("path");

const getBalance = (id, TXs) => {
  let balance = 0;
  for(let TX of TXs) {
    if(String(TX.to._id) === id) balance += parseInt(TX.amount);
    else balance -= parseInt(TX.amount);
  }
  return balance;
}

router.get('/TX', (req, res) => {
  if(req.query.id) {
    const id = req.query.id;
    TX.find({$or: [{'from': id}, {'to': id}]})
    .populate('from to', "_id name email group")
    .exec((err, TXs) => {
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

router.post('/purchase', async (req, res) => {
  let d = new Date();
  if(!req.isLogin) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create transaction failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== 'cashier') {
    res.status(401).send("Not authorized");
    return;
  }
  const { from, prize } = req.body;
  if(!from || !prize) {
    res.status(400).send("Missing receiver or prize");
    return;
  }
  const { item, price } = prize;
  const to = req.user.id;
  const timestamp = d.getTime();
  const tx = await TX.findOne({ from, item }, (err, tx) => {
    if(err) return errHandler(err, res);
    else return tx
  });
  if(tx) {
    res.status(400).send("This prize had already been purchased by this user!");
    return;
  }
  const TXs = await TX.find({$or: [{'from': from}, {'to': from}]}, (err, TXs) => {
    if(err) return errHandler(err, res);
    else return TXs;
  });
  
  if(getBalance(from, TXs) < price) {
    res.status(400).send("Not enough balance");
    return;
  }
  const newTX = TX({ from, to, info: `Buy ${item}`, item, amount: price, timestamp });
  const done = newTX.save()
  .then(_ => true)
  .catch(err => errHandler(err, res));

  if(done) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Create TX success: buy ${item} with \$${price} from ${from} to ${to}`);
    res.status(200).send("Create transaction success");
  }
  else res.status(400).send("Create transaction failed");
  return;
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
    if(req.user && req.user.group === 'root') {
      if(req.query.group) {
        User.find({'group': req.query.group}, (err, users) => {
          if(users) res.status(200).send(users);
          else if(err) errHandler(err, res);
          else res.status(400).send("Query Error");
        })
      }
      else {
        User.find((err, users) => {
          if(users) res.status(200).send(users);
          else if(err) errHandler(err, res);
          else res.status(400).send("Query Error");
        })
      }
    }
    else findUser(req.user.id);
  }
  else res.status(400).send("Missing Query Info");
})

router.get('/prize', async (req, res) => {
  if(!req.isLogin) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Get prize failed: Not login`);
    res.status(401).send("Not logged in");
    return;
  }
  if (req.user.group !== 'cashier') {
    res.status(401).send("Not authorized");
    return;
  }
  const path = './prizes/PriceTable.json'
  const priceTable = await fs.readFile(path)
  .then( pt => JSON.parse(pt))
  .catch(err => errHandler(err, res));
  
  res.status(200).send(priceTable)
});

router.post('/changeUser', async (req, res) => {

  if(!req.isLogin) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Change user failed: Not login`);
    res.status(401).send("Not logged in");
  }
  if(req.user.group !== 'root') {
    res.status(401).send("Not authorized");
    return;
  }
  const { email, name, unit } = req.body;

  const filter = { email };
  let update = name ? { name } : {};
  update = unit ? {...update, sector:unit} : update;
  if(await User.countDocuments(filter) !== 1) {
    res.status(400).send('bad request(please check user email!)');
    return;
  }

  const user = await User.findOneAndUpdate(filter, update, {
    new: true,
    upsert: false
  })
  .then( doc => doc)
  .catch( err => {
    errHandler(err, res);
    return false;
  })
  // console.log(user);
  res.status(200).send(`${user.name} (unit: ${user.sector}) update success`);
});

const errHandler = (err, res) => {
  console.error(err);
  if(res) res.status(500).send("Server error");
}

module.exports = router;