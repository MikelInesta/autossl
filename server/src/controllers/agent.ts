import { Agent, IAgent } from '../models/agent';

// Function to create a new agent
const createNewAgent = async (): Promise<IAgent | false> => {
	try {
		const newAgent = new Agent();
		return newAgent.save();
	} catch (e) {
		return false;
	}
};

export { createNewAgent };
