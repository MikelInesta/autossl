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
			response.sendStatus(422); // Unprocessable Content
			return;
		}

		const ip = jsonData.ip;
		const servers = jsonData.servers;

		if(!ip || !servers){
			response.sendStatus(422); // Unprocessable Content
			let notFound = ip ? "Couldnt find servers in POST request" : "Couldnt find IP in POST request";
			return;
		}

		//add a name property to every server
		for(let i in servers){
			servers[i]["name"]=servers[i].substr(servers[i].lastIndexOf("/") + 1);
		}

		//main function call
		update(ip, servers)
			.then(()=>{
				console.log("updated...");
			})
			.catch((err)=>{
				console.log('error: ',err);
				//throw err; // Maybe keep it here idk
			})
		
		// Success message is returned to the agent
		response.sendStatus(200);
		return;

	}catch(err){
		console.log('Error: ',err);
		response.sendStatus(500); // Unprocessable Content
		return;
	}

	async function update(ip, servers){
		const c = await mysql.createConnection(config.db);

		var server_id;

		// See if the server is already logged in the database
		var sql = 'SELECT * FROM `server` WHERE `ip` = ?';
		var values = [ip];
	
		var [rows, fields] = await c.execute(sql, values);

		if(!rows){
			// Add a new server with the given ip
			sql = 'INSERT INTO `server` (`user_id`, `ip`, `server_name`)\
							VALUES (?, ?, ?)';
			values = [1, ip, 'test']; // user_id=1 and 'test' are dumm values for testing

			[rows, fields] = await c.execute(sql, values);

			// Get the server_id for the newly added server
			sql = 'SELECT * FROM `server` WHERE server_id = ?';
			values = [ip];

			[rows, fields] = await c.execute(sql, values);

			server_id = rows['server_id'];
		}else{
			server_id = rows['server_id'];
		}

		// Add an entry for every web_server in servers
		for (let i in servers) {
			sql = 'INSERT INTO `web_server` (`server_id`, `web_server_name`, `configuration_path`) \
			values (?, ?, ?)';
			values = [server_id, servers[i].name , servers[i]];

			[rows, fields] = await c.execute(sql, values);
		}
	}
});

app.listen(port, () => {
	console.log(`Listening at localhost:${port}\nPress Ctrl+C to quit`);
});
