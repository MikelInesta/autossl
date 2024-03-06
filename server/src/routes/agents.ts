import express from "express";
import { Server, IServer } from "../models/servers";
import { WebServer, IWebServer } from "../models/web_servers";
import { VirtualHost, IVirtualHost } from "../models/virtual_hosts";
import { Certificate, ICertificate } from "../models/certificates";

const agentRouter = express.Router();

// Endpoint for agents to update web servers
agentRouter.post("/update", async (req, res) => {
  //Receive the json data from the agent
  const data = req.body;
  console.log(data);

  res.sendStatus(200);
});

export default agentRouter;
