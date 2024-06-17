import express from "express";
import { update } from "../controllers/server";
import { Agent } from "../models/agents";
import { createNewAgent } from "../controllers/agent";
import { addCsr } from "../controllers/virtual_host";

const agentRouter = express.Router();

agentRouter.post("/csr", async (req, res) => {
  try {
    console.log("/agents/csr");
    const data = req.body;
    const id = data["virtual_host_id"] || false;
    const csr = data["csr"] || false;
    if (await addCsr(id, csr)) {
      res.sendStatus(200);
    } else {
      throw new Error("Something went wrong adding the csr");
    }
  } catch (e: any) {
    console.log(`Error at '/agents/csr' :${e}`);
    res.sendStatus(500);
  }
});

agentRouter.post("/validate", async (req, res) => {
  console.log("/agents/validate");

  const body = req.body;
  const agentId = body.agentId;

  if (!body || !agentId) {
    res.sendStatus(400);
    return;
  }

  // I'm testing handling async without await here
  Agent.findOne({ _id: agentId })
    .then((result) => {
      if (result) {
        console.log("Found an agent in the db with given id");
        res.sendStatus(200);
      } else {
        console.log("Cant find an agent in the db with given id");
        res.sendStatus(404);
      }
    })
    .catch((e) => {
      console.log(`Error at '/agents/validate' :${e}`);
      res.sendStatus(500);
    });
});

agentRouter.get("/new/:ip", async (req, res) => {
  try {
    const ip = req.params.ip;
    console.log(`/agents/new/${ip}`);

    const newResult = await createNewAgent(ip);
    if (!newResult) {
      throw new Error("Failed to create new agent");
    } else {
      res.json(newResult).status(200);
    }
  } catch (e: any) {
    console.log(`Error at '/agents/new/${req.params.ip}' :${e}`);
    res.sendStatus(500);
  }
});

/*
  This endpoint is used by agents to send their host's data, if the data is
  correctly structured the server handles the update of all the correspoding entities
*/
agentRouter.post("/update", async (req, res) => {
  try {
    const data = req.body;
    console.log("/agents/update");
    await update(data);
    res.sendStatus(200);
  } catch (e: any) {
    console.log(`Error at '/agents/update' :${e}`);
    res.status(500).send({
      error: e.message,
      details: e,
    });
  }
});

export default agentRouter;
