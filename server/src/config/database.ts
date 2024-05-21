// Configuration for the database connection
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config(); //load .env

// Create the connection and export it for the server to use
const dbUri =
	process.env.DB_URI ||
	'mongodb+srv://autossl:' +
		process.env.DB_PASSWORD +
		'%@autossl.5cwn4qk.mongodb.net/?retryWrites=true&w=majority&appName=autossl';

const connection = mongoose.connect(dbUri);
export default connection;
