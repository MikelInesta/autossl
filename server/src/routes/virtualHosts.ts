import express from "express";
import { getVirtualHosts } from "../controllers/web_server";
import { requestCsr } from "../controllers/virtual_host";
import { publishMessage } from "../config/rabbit";

const virtualHostRouter = express.Router();

virtualHostRouter.get("/testCsr/:agentId", async (req, res) => {
  try {
    const agentId = req.params.agentId;
    if (!agentId) {
      console.log("No agent ID was providad for /testCsr");
      res.sendStatus(422);
    }
    publishMessage("csrExchange", agentId, "Message from backend")
      .then(() => {
        res.sendStatus(200);
      })
      .catch((e: any) => {
        console.log(
          "something went wrong publishing a message to exchange: ",
          e,
        );
      });
  } catch (e: any) {
    console.log("Something went wrong.");
    res.sendStatus(500);
  }
});

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
