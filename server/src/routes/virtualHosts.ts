import express from "express";
import { getVirtualHosts } from "../controllers/web_server";

const virtualHostRouter = express.Router();

virtualHostRouter.get("/webserverid/:webserverid", async (req, res) => {
  const webServerId = req.params.webserverid;
  if (!webServerId) {
    res.status(400).send("Web Server ID is required");
    return;
  }
  try {
    const virtualHosts = await getVirtualHosts(webServerId);
    res.status(200).json(virtualHosts);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

export default virtualHostRouter;
