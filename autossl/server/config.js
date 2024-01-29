// Database related configuration is set

require('dotenv').config();

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;

const config = {
  db: {
    host: "localhost:8000",
    user: dbUsername,
    password: dbPassword,
    database: "autossl",
    connectTimeout: 60000
  }
};

module.exports = config;