import express from "express";
import { getWebServersByName } from "../controllers/web_server";

const frontendRouter = express.Router();

frontendRouter.get("/web-servers/:serverName", async (req, res) => {
  const serverName = req.params.serverName;
  if (!serverName) {
    res.status(400).send("Server name is required");
    return;
  }

  try {
    // Send the web servers array as json
    res.setHeader("Content-Type", "application/json");
    const webServers = await getWebServersByName(serverName);
    res.json(webServers);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
    return;
  }
});

export default frontendRouter;
