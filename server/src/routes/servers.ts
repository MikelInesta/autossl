import { getServers } from "../controllers/server";
import express from "express";
import { Server } from "../models/servers";

const serverRouter = express.Router();

serverRouter.get("/", async (req, res) => {
  console.log("GET /servers");
  // Get all servers
  try {
    const servers = await getServers();
    res.status(200).json(servers);
  } catch (e: any) {
    console.log(e);
    res.sendStatus(500);
  }
});

serverRouter.get("/:serverId", async (req, res) => {
  console.log(`GET /servers/${req.params.serverId}`);
  const serverId = req.params.serverId;
  if (!serverId) {
    res.status(400).send("Server ID is required");
    return;
  }
  const server = await Server.findById(serverId);
  if (!server) {
    res.status(404).send("Server not found");
    return;
  }
  res.status(200).json(server);
});

serverRouter.get("/name/:serverName", async (req, res) => {
  console.log(`GET /servers/name/${req.params.serverName}`);
  const serverName = req.params.serverName;
  if (!serverName) {
    res.status(400).send("Server name is required");
    return;
  }
});

export default serverRouter;
