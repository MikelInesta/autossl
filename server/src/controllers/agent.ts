import { Agent, IAgent } from '../models/agent';

// Function to create a new agent
const createNewAgent = async (): Promise<IAgent> => {
	const newAgent = new Agent();
	return newAgent.save();
};

export { createNewAgent };
