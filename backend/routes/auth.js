const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require('../models/user.js');
const TX = require("../models/transaction");
const { userGroupEnum } = require('../const');

router.post('/login', async (req, res) => {
  let d = new Date();
  const _email = req.body.email;
  const _pwd  = req.body.pwd;
  if(!_email || !_pwd){
    res.status(400).send("Missing field");
    return;
  }

  // Check user existence
  const user = await User.findOne({email: _email})
  .then(userResponse => {
    if(!userResponse) {
      console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Login failed: ${_email} user not found`);
      res.status(401).send("Login failed");
      return;
    }
    else return userResponse
  })
  .catch(err => errHandler(err));
  
  if(!user) return;
  const same = await bcrypt.compare(_pwd, user.pwdHash)
  .then(same => same)
  .catch(err => errHandler(err));
  if(!same) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Login failed:`, user.email, "wrong password");
    res.status(401).send("Login failed");
    return;
  }

  const sessionInfo = {id: user._id, name: user.name, email: user.email, group: user.group};
  const token = await jwt.sign(sessionInfo, process.env.JWT_SECRET, { expiresIn: '1d'});

  if(token) {
    let d = new Date();
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Login success: ${user.name} ${_email}`);
    res.status(200).json({'token': token, 'name': user.name, 'email': user.email, 'id': user._id, 'group': user.group});
  }
  else res.status(500).send("Login failed");

  return;
})

router.post('/register', async (req, res) => {
  const d = new Date();
  const _email = req.body.email;
  const _pwd  = req.body.pwd;
  const _name = req.body.name;
  const _group = req.body.group;
  if(!(req.user) || req.user.group !== 'root') {
    res.status(401).send("Operation not allowed");
    return;
  }
  if(!_name || !_email || !_pwd || !_group){
    res.status(400).send("Missing field");
    return;
  }
  if(!userGroupEnum.includes(_group)) {
    res.status(400).send("Invalid group");
    return;
  }

  // Check existence of same email and name
  const pass = await User.find({$or: [{'email': _email}]})
  .then(_user => {
    if(_user.length > 0) res.status(400).send("Email already used");
    else return true;
  })
  .catch(err => errHandler(err, res, "Check existence error"));

  if(!pass) return;

  const _pwdHash = await bcrypt.hash(_pwd, 10)
  .then(_hash => _hash)
  .catch(err => errHandler(err, res, "Create hash error"));

  const newUser = User({name: _name, pwdHash: _pwdHash, email: _email, group: _group});
  const done = await newUser.save()
  .then(_ => true)
  .catch(err => errHandler(err));
  
  // Give 1000 to the new user
  const newTx = TX({ to: newUser._id, amount: 1000, timestamp: d.getTime() })
  await newTx.save()
  .then(_ => true)
  .catch(err => errHandler(err));

  if(done) {
    console.log(`[${d.toLocaleDateString()}, ${d.toLocaleTimeString()}] Register success: ${_name} ${_email}`);
    res.status(200).send("Register success");
  }
  else res.status(400).send("Register failed");

  return;
})

const verifyToken = (req, _, next) => {
  try {
    const _user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    req.user = _user;
    req.isLogin = true;
    next();
  }
  catch {
    req.isLogin = false;
    next();
  }
};

module.exports = {authRoute: router, verifyToken};

/*********
 * Utils *
 *********/

const errHandler = (err, res = null, msg = null) => {
    if(err) console.error(err);
    if(msg) console.error(msg);
    if(res) res.status(500).send("Server Error.");
    return;
}