// Node backend to serve the client with data obtained through the agent
const express = require("express");
const app = express();
const port = 8080;
app.use(express.json());


app.post('/update', function(request, response){

  // A json containing the server ip and web servers found in obtained

  // New data is saved to the database

  // Success message is returned to the agent

});

app.post('/status', function(request, response){

  // User data is received and authenticated

  // Server/Domain requested is looked up in the database

  // Requested data is returned to the frontend

});

app.listen(port, () => {
  console.log(`Listening at localhost:${port}`);
});
