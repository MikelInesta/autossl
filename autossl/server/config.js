'use strict';
// Configuration for the database connection

require('dotenv').config();

const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "autossl",
    connectTimeout: 60000
  }
};

module.exports = config;