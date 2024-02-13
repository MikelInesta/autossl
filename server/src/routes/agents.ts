import express from "express";
import { updateWebServers } from "../controllers/agent";

const agentRouter = express.Router();

agentRouter.get("/test", (req, res) => {
  res.send("Hello world!");
});

// Endpoint for agents to update web servers
agentRouter.post("/update/web-servers", async (req, res) => {
  // Get the list of web servers from the agent
  const webServers = req.body.servers;
  const ip = req.body.ip;

  try {
    await updateWebServers(ip, webServers);
    res.status(200).send("Web servers updated succesfully!");
    console.log("Web servers updated succesfully!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

agentRouter.get("/update/servers", (req, res) => {});

// Endpoint for agents to update web servers
agentRouter.get("/update/web-servers", async (req, res) => {});

agentRouter.get("/update/virtual-hosts", async (req, res) => {});

agentRouter.get("update/certificates", async (req, res) => {});

export default agentRouter;
