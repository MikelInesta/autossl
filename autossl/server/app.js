// Entry point for the application, 
// right now im cramming the entire routing, bussiness and data logic here :)
const express = require("express");
const mysql = require('mysql2/promise');
const config = require('./config'); // Database configuration

const app = express();
const port = 8001;

app.use(express.json());

//Endpoint to test connectivity
app.all('/backend/test', function (request, response) {
	response.send('hello world!');
})

//Endpoint that receives web server data from an agent
app.post('/backend/update', function (request, response) {

	try{

		const jsonData = request.body;
		if(!jsonData){
			throw 'The request did not contain a json value.';
		}

		const ip = jsonData.ip;
		const servers = jsonData.servers;

		if(!ip || !servers){
			let notFound = ip ? "Couldnt find servers in POST request" : "Couldnt find IP in POST request";
			throw notFound;
		}

		//main function call
		update(ip, servers)
			.then(()=>{
				console.log("updated...");
				// Success message is returned to the agent
				response.sendStatus(200);
				return;
			})
			.catch((err)=>{
				console.log('error: ',err);
				throw err; // Maybe keep it here idk
			})

	}catch(err){
		console.log('Error: ',err);
		response.sendStatus(500); // Unprocessable Content
	}

	async function update(ip, servers){
		const c = await mysql.createConnection(config.db);

		var server_id;

		// See if the server is already logged in the database
		var sql = 'SELECT * FROM `server` WHERE `ip` = ?';
		var values = [ip];
	
		var [rows, fields] = await c.execute(sql, values);

		if(rows.length == 0){
			// Add a new server with the given ip
			sql = 'INSERT INTO `server` (`user_id`, `ip`, `server_name`)\
							VALUES (?, ?, ?)';
			values = [1, ip, 'test']; // user_id=1 and 'test' are dumm values for testing

			[rows, fields] = await c.execute(sql, values);
			console.log('Saved a new server with user_id: %d, name: %s and ip: %s: ', 1, 'test', ip);

			// Get the server_id for the newly added server
			sql = 'SELECT * FROM `server` WHERE ip = ?';
			values = [ip];

			[rows, fields] = await c.execute(sql, values);
			console.log('second select: ', rows);

			server_id = rows[0].server_id;
		}else{
			console.log('Found server with ip %s already in the database.', ip);
			server_id = rows[0].server_id;
		}
	
		// Add an entry for every web_server in servers
		for (let i in servers) {

			//Check the database to find if the given server already has this web server path registered
			sql = 'SELECT * FROM `web_server` WHERE `server_id` = ? AND `configuration_path` = ?';
			values = [
				server_id,  
				servers[i]
			];
			
			[rows, fields] = await c.execute(sql, values);

			if(rows.length == 0){
				//Save the web server to the database
				sql = 'INSERT INTO `web_server` (`server_id`, `web_server_name`, `configuration_path`) \
				values (?, ?, ?)';
				values = [
					server_id, 
					servers[i].substr(servers[i].lastIndexOf("/") + 1), // the last string in the path is taken as name 
					servers[i]
				];

				[rows, fields] = await c.execute(sql, values);
				console.log('Saved web server with path %s related to the server with id %d',
										servers[i], server_id);
			}else{
				console.log('Web server with path %s already saved for this server, ingoring', servers[i]);
			}

		}
	}
});

app.listen(port, () => {
	console.log(`Listening at localhost:${port}\nPress Ctrl+C to quit`);
});
