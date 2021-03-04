const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

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

db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
});


app.get("/", (req, res) => {
    res.json({ message: "Welcome to web application." });
});

app.use('/v1/user', userRoutes);
app.use('/books', bookRoutes);
//app.use('/books/:id/image', fileRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));

