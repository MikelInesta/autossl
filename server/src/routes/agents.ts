import express from "express";
import { update } from "../controllers/server";

const agentRouter = express.Router();

// Endpoint for agents to update web servers
agentRouter.post("/update", async (req, res) => {
  try {
    //Receive the json data from the agent
    const data = req.body;
    console.log(data);
    const updateResult = await update(data);
    if (!updateResult) {
      throw new Error("Failed to update");
    }
    res.sendStatus(200);
  } catch (e: any) {
    console.log(e.message);
    res.sendStatus(500);
  }
});

export default agentRouter;
