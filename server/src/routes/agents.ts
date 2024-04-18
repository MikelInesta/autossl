import express from 'express';
import { update } from '../controllers/server';
import { Server } from '../models/servers';
import { createNewAgent } from '../controllers/agent';

const agentRouter = express.Router();

agentRouter.get('/validate/:id', async (req, res) => {
	const id = req.params.id;
	// I'm testing handling async without await here
	Server.findOne({ id: id })
		.then((result) => {
			if (result) {
				res.sendStatus(200);
			} else {
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
