import express from "express";
import { getWebServers } from "../controllers/server";

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

export default webServerRouter;
