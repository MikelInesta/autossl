import express from "express";
import { getVirtualHosts } from "../controllers/web_server";
import { requestCsr } from "../controllers/virtual_host";
import { publishMessage } from "../config/rabbit";
import { getCsr } from "../controllers/virtual_host";
import { VirtualHost } from "../models/virtual_hosts";

const virtualHostRouter = express.Router();

virtualHostRouter.get("/:virtualHostId", async (req, res) => {
  const virtualHostId = req.params.virtualHostId;
  if (!virtualHostId) {
    res.status(400).send("Virtual Host ID is required");
    return;
  }
  try {
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost) {
      res.status(404).send("Virtual Host not found");
      return;
    }
    res.status(200).json(virtualHost);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

virtualHostRouter.get("/viewCsr/:id", async (req, res) => {
  console.log("trying to viewCsr");
  try {
    const virtualHostId = req.params.id;
    if (!virtualHostId) {
      res.sendStatus(422);
    }
    const csr = await getCsr(virtualHostId);
    if (!csr) {
      res.sendStatus(404);
      return;
    }
    const csrJson = JSON.stringify({
      csr: csr,
    });
    console.log(`Sending ${csrJson}`);
    res.status(200).send(csrJson);
  } catch {
    res.sendStatus(500);
  }
});

virtualHostRouter.get("/testRabbit/:key", async (req, res) => {
  try {
    const key = req.params.key;
    if (!key) {
      console.log("No agent ID was providad for /testCsr");
      res.sendStatus(422);
    }
    publishMessage("csrExchange", key, "Message from backend")
      .then(() => {
        res.sendStatus(200);
      })
      .catch((e: any) => {
        console.log(
          "something went wrong publishing a message to exchange: ",
          e
        );
      });
  } catch (e: any) {
    console.log("Something went wrong.");
    res.sendStatus(500);
  }
});

virtualHostRouter.post("/getCsr/:virtualHostId", async (req, res) => {
  const formData = req.body;
  const virtualHostId = req.params.virtualHostId;
  if (!virtualHostId) {
    res.sendStatus(422);
  }
  const response = await requestCsr(virtualHostId, formData);
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
