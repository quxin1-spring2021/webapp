#! /bin/bash
if (process.env.NODE_ENV !== "prod") {
    require('dotenv').config();
}

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const logger = require("./services/applogs/applogs");

logger.log({
    level: 'info',
    message: 'Webapp Started'
});

logger.info({
    message: 'Use a helper method if you want',
    additional: 'properties',
    are: 'passed along'
});

logger.log('info', 'test message %s, %s', 'first', 'second', { number: 123 });
logger.info('Found %s at %s', 'error', new Date());
logger.info('Found %s at %s', 'error', new Error('chill winston'));

logger.warn(new Error('Error passed as info'));
logger.log('error', new Error('Error passed as message'));

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const fileRoutes = require('./routes/files');

// Set Database
const db = require("./models");
//{ force: true }
db.sequelize.sync().then(() => {
    console.log("Re-sync db.");
});


app.get("/", (req, res) => {
    res.json({ message: "Welcome to web application." });
});

app.use('/v1/user', userRoutes);
app.use('/mybooks', bookRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));

