// Entry point for the application,
import express from "express";
import cors from "cors";

import api from "./config/server.js";
import connection from "./config/database.js";

import agentRouter from "./routes/agents.js";
import frontendRouter from "./routes/frontend.js";

const app = express();

// Middleware for every endpoint
app.use(express.json());
app.use(cors());

//Endpoint to test connectivity
app.all("/api/test", function (request, response) {
  response.send("hello world!");
});

// Api route for communication from the agents
app.use("/api/agents", agentRouter);

// Api route to serve the front-end
app.use("/api/front-end", frontendRouter);

app.listen(api.port, async () => {
  try {
    await connection;
    console.log("Connected to the database");
  } catch (err) {
    console.log(err);
  }

  console.log(`Listening at localhost:${api.port}\nPress Ctrl+C to quit`);
});
