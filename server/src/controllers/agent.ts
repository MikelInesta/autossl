import { Agent, IAgent } from "../models/agents";

// Function to create a new agent
const createNewAgent = async (ip: string): Promise<IAgent | false> => {
  try {
    const newAgent = new Agent({
      server_ip: ip,
    });
    return newAgent.save();
  } catch (e) {
    return false;
  }
};

export { createNewAgent };
