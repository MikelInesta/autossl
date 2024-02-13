// Configuration for the database connection
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config(); //load .env

// Create the connection and export it for the server to use
const dbUri =
  process.env.DB_URI ||
  "mongodb+srv://" +
    process.env.DB_USER +
    ":" +
    process.env.DB_PASSWORD +
    "@" +
    process.env.DB_NAME +
    ".5cwn4qk.mongodb.net/?retryWrites=true&w=majority";
const connection = mongoose.connect(dbUri);

export default connection;
