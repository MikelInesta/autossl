import express from "express";
import { update } from "../controllers/server";
import { Agent } from "../models/agents";
import { createNewAgent } from "../controllers/agent";
import { addCsr } from "../controllers/virtual_host";

const agentRouter = express.Router();

agentRouter.post("/csr", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const id = data["virtual_host_id"] || false;
    const csr = data["csr"] || false;
    if (await addCsr(id, csr)) {
      res.sendStatus(200);
    } else {
      throw new Error("Something went wrong adding the csr");
    }
  } catch (e: any) {
    res.sendStatus(500);
  }
});

// maybe hide the agent id

agentRouter.get("/validate/:id", async (req, res) => {
  const id = req.params.id;
  console.log("validating with id: ", id);
  // I'm testing handling async without await here
  Agent.findOne({ _id: id })
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
      console.log(e);
      res.sendStatus(500);
    });
});

agentRouter.get("/new/:ip", async (req, res) => {
  try {
    const ip = req.params.ip;
    const newResult = await createNewAgent(ip);
    if (!newResult) {
      throw new Error("Failed to create new agent");
    } else {
      res.json(newResult).status(200);
    }
  } catch (e: any) {
    console.log(e.message);
    res.sendStatus(500);
  }
});

// Endpoint for agents to update web servers
agentRouter.post("/update", async (req, res) => {
  try {
    //Receive the json data from the agent
    const data = req.body;
    //console.log(data);
    const updateResult = await update(data);
    if (!updateResult) {
      throw new Error("Failed to update");
    }
    console.log("Updated received succesfully");
    res.sendStatus(200);
  } catch (e: any) {
    console.log(e.message);
    res.sendStatus(500);
  }
});

export default agentRouter;
