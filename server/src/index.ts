// Entry point for the application,
import express from "express";
import cors from "cors";

import api from "./config/server.js";
import connection from "./config/database.js";

import agentRouter from "./routes/agents.js";
import serverRouter from "./routes/servers.js";
import webServerRouter from "./routes/webServers.js";
import virtualHostRouter from "./routes/virtualHosts.js";
import certificateRouter from "./routes/certificates.js";

import {declareExchange} from "./config/rabbit.js";

const app = express();

// Middleware for every endpoint
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173" ,"http://localhost:5174", "https://autossl.mikelinesta.com"],
  credentials: false,
};
app.use(cors(corsOptions));

//Endpoint to test connectivity
app.all("/api/test", function (request, response) {
  response.send("hello world!");
});

// Api route for communication from the agents
app.use("/api/agents", agentRouter);

// Api route for servers
app.use("/api/servers", serverRouter);

// Api route for web_servers
app.use("/api/web-servers", webServerRouter);

// Api route for virtual_hosts
app.use("/api/virtual-hosts", virtualHostRouter);

// Api route for certificates
app.use("/api/certificates", certificateRouter);



app.listen(api.port, async () => {
  try {
    await connection;
    console.log("Connected to the database");
  } catch (err) {
    console.log(err);
  }

  console.log(`Listening at localhost:${api.port}\nPress Ctrl+C to quit`);

  try{
    await declareExchange("csrExchange", "direct");
    console.log("Declared the CSR exchange"); 
  }catch(e: any){
    console.log(e.message);
  }

});
