import { json } from "stream/consumers";
import { getServers } from "../controllers/server";
import express from "express";

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

serverRouter.get("/name/:serverName", async (req, res) => {
  console.log(`GET /servers/name/${req.params.serverName}`);
  const serverName = req.params.serverName;
  if (!serverName) {
    res.status(400).send("Server name is required");
    return;
  }
});

export default serverRouter;
