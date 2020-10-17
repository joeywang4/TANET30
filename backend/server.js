const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { authRoute, verifyToken } = require('./routes/auth');

const apiRoute = require('./routes/api');
const eventRoute = require('./routes/event');
const ticketRoute = require('./routes/ticket');
const pushRoute = require('./routes/push');
const rankRoute = require('./routes/rank');

// Create server to serve index.html
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 3001;

// Connect to mongo
const mongoUrl = process.env.DB_URL;
mongoose.set("useUnifiedTopology", true);
mongoose.connect(mongoUrl, {useNewUrlParser: true});
db = mongoose.connection;
db.on('error', error => {
  console.log(error);
})
db.once('open', () => {
  console.log('MongoDB connected!');
})

// Routing
app.use(cors());
app.use(bodyParser.json());
app.use(verifyToken);
app.use('/auth', authRoute);
app.use('/event', eventRoute);
app.use('/push', pushRoute);
app.use('/ticket', ticketRoute);
app.use('/rank', rankRoute);
app.use('/', apiRoute);

// Start server listening process.
http.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});