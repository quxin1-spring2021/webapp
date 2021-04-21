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

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');

// Set Database
const db = require("./models");

//{ force: true } is used to erase all records everytime the service re-starts. Revome { force: true } will keep records.
db.sequelize.sync({ force: true }).then(() => {
    console.log("Re-sync db.");
});

// GET request to test connection
app.get("/", (req, res) => {
    res.json({ message: "Welcome to web application." });
});

// Use Router to route different API calls.
app.use('/v1/user', userRoutes);
app.use('/mybooks', bookRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));

