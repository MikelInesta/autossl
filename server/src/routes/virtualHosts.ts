import express from "express";
import { getVirtualHosts } from "../controllers/web_server";
import { requestCsr } from "../controllers/virtual_host";

const virtualHostRouter = express.Router();

virtualHostRouter.get("/getCsr/:virtualHostId", async (req, res) => {
  const virtualHostId = req.params.virtualHostId;
  if (!virtualHostId) {
    res.sendStatus(422);
  }
  const response = await requestCsr(virtualHostId);
  if (!response) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
  }
});

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
