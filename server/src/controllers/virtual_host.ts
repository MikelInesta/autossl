import { Types } from "mongoose";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";
import { Agent } from "../models/agents";
import { publishMessage } from "../config/rabbit";
import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";

const getAgentId = async (virtualHostId: string): Promise<string> => {
  try {
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost)
      throw new Error("Could not find a virtual host with the given Id");
    const parentWebServer = await WebServer.findById(virtualHost.web_server_id);
    if (!parentWebServer)
      throw new Error("Could not get the domains parent web server");
    const parentServer = await Server.findById(parentWebServer.server_id);
    if (!parentServer)
      throw new Error("Could not get the parent server for the web server");
    const agent = await Agent.findOne({
      server_ip: parentServer.server_ip,
    });
    if (!agent) throw new Error("Could not get the agent for the server");
    else return agent._id.toString();
  } catch (e) {
    console.log("Something went wrong in getAgentId function: " + e);
    return "";
  }
};

const requestCsr = async (virtualHostId: string): Promise<boolean> => {
  try {
    // I need the agent Id for the server hosting this domain (virtual host)
    const agentId = await getAgentId(virtualHostId);
    if (!agentId)
      throw new Error(
        "Could not find the agent Id related to the given domain",
      );
    // I need the virtual host data to send to the agent for it to know what to generate
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost)
      throw new Error("No virtual host was found with the given Id");
    const dataString = JSON.stringify(virtualHost);
    publishMessage("csrExchange", agentId, dataString);
    return true;
  } catch (e: any) {
    console.log("Error in request csr");
    return false;
  }
};

const setOldVirtualHosts = async (
  updatedVirtualHostsIds: Types.ObjectId[],
): Promise<Boolean> => {
  try {
    const oldVirtualHosts = await VirtualHost.find({
      _id: { $nin: updatedVirtualHostsIds },
    });
    if (oldVirtualHosts.length === 0) console.log("No old virtual hosts");
    for (const oldVirtualHost of oldVirtualHosts) {
      oldVirtualHost.old = true;
      await oldVirtualHost.save();
    }
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

const updateVirtualHost = async (
  virtualHostData: IVirtualHost,
  webServerId: Types.ObjectId,
  certificateId: Types.ObjectId | undefined,
): Promise<IVirtualHost> => {
  const virtualHost = await VirtualHost.findOneAndUpdate(
    {
      vh_ips: virtualHostData.vh_ips,
      domain_names: virtualHostData.domain_names,
    },
    {
      enabled: virtualHostData.enabled,
      web_server_id: webServerId,
      certificate_id: certificateId,
    },
    { upsert: true, new: true },
  );
  return virtualHost;
};

export { updateVirtualHost, setOldVirtualHosts, requestCsr, getAgentId };
