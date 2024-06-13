import express from "express";
import { getWebServers } from "../controllers/server";
import { WebServer } from "../models/web_servers";

const webServerRouter = express.Router();

webServerRouter.get("/serverid/:serverid", async (req, res) => {
  const serverId = req.params.serverid;
  if (!serverId) {
    res.status(400).send("Web Server ID is required");
    return;
  } else {
    try {
      const webServers = await getWebServers(serverId);
      res.status(200).send(webServers);
    } catch (e: any) {
      res.sendStatus(500);
      return;
    }
  }
});

webServerRouter.get("/:webServerId", async (req, res) => {
  try {
    const webServerId = req.params.webServerId;
    if (!webServerId) {
      res.sendStatus(404);
      return;
    }
    const webServer = await WebServer.findById(webServerId);
    if (!webServer) {
      res.sendStatus(404);
      return;
    }
    res.status(200).send(webServer);
  } catch (e: any) {
    console.log(`Something went wrong trying to retrieve a web server: ${e}`);
    res.sendStatus(500);
  }
});

export default webServerRouter;
