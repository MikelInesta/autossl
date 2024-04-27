import express from 'express';
import { update } from '../controllers/server';
import { Agent } from '../models/agent';
import { createNewAgent } from '../controllers/agent';

const agentRouter = express.Router();

agentRouter.post("/csr/:csrData", async (req, res) => {
  const data = req.body;
  console.log(data);
  res.sendStatus(200);
});

agentRouter.get('/validate/:id', async (req, res) => {
  const id = req.params.id;
  console.log('validating with id: ', id);
  // I'm testing handling async without await here
  Agent.findOne({ _id: id })
    .then((result) => {
      if (result) {
        console.log('Found an agent in the db with given id');
        res.sendStatus(200);
      } else {
        console.log('Cant find an agent in the db with given id');
        res.sendStatus(404);
      }
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(500);
    });
});

agentRouter.get('/new', async (req, res) => {
  try {
    const newResult = await createNewAgent();
    if (!newResult) {
      throw new Error('Failed to create new agent');
    } else {
      res.json(newResult).status(200);
    }
  } catch (e: any) {
    console.log(e.message);
    res.sendStatus(500);
  }
});

// Endpoint for agents to update web servers
agentRouter.post('/update', async (req, res) => {
  try {
    //Receive the json data from the agent
    const data = req.body;
    console.log(data);
    const updateResult = await update(data);
    if (!updateResult) {
      throw new Error('Failed to update');
    }
    res.sendStatus(200);
  } catch (e: any) {
    console.log(e.message);
    res.sendStatus(500);
  }
});

export default agentRouter;
