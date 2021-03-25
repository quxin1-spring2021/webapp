const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  benchmark: true,
  logging: false,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.books = require("./book.model.js")(sequelize, Sequelize);
db.files = require("./file.model")(sequelize, Sequelize);

db.books.belongsTo(db.users, {foreignKey: 'user_id'});
db.files.belongsTo(db.books, {foreignKey: 'book_id'});
db.books.hasMany(db.files, {foreignKey: 'book_id'});
db.users.hasMany(db.books, {foreignKey: 'user_id'});

module.exports = db;