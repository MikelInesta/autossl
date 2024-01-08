// Node backend to communicate with the agent and serve the client
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ServerData stored in memory
let serverData = null;

// Test get route to verify reverse proxy
app.get('/test', (req, res) => {
  res.json({ message: 'hello world' });
});

// Post route to receive server data from the python client
app.post('/sendStatus', express.json(), (req, res) => {
  serverData = req.body;
  console.log('received:', req.body);
  res.status(200).send('Data received successfully');
});

// Get route to serve the react client
app.get('/', (req, res) => {
  if (serverData) {
    res.json(serverData);
  } else {
    res.status(404).send('No data available');
  }
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
