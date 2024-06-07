import { Types } from "mongoose";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";
import { Agent } from "../models/agents";
import { publishMessage } from "../config/rabbit";
import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";

const installCertificate = async (id: string, data: object) => {
  try {
    // I need the agent Id for the server hosting this domain (virtual host)
    const agentId = await getAgentId(id);
    if (!agentId)
      throw new Error(
        "Could not find the agent Id related to the given domain"
      );
    // I need the virtual host data to send to the agent for it to know what to generate
    const virtualHost = await VirtualHost.findById(id);
    if (!virtualHost)
      throw new Error("No virtual host was found with the given Id");

    // Join the form data with the virtual host data from the db
    const jsonData = JSON.stringify({
      request: "install",
      ...virtualHost.toObject(),
      ...data,
    });
    publishMessage("csrExchange", agentId, jsonData);
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

const getCsr = async (id: string) => {
  try {
    console.log("getting csr");
    const vh = await VirtualHost.findById(id);
    if (vh) {
      console.log(
        "controllers.virtual_hosts.getCsr: Found virtual host, looking for csr..."
      );
      console.log(vh.toString());
      const csr = vh?.csr;
      if (csr) {
        console.log(`csr: ${csr}`);
      }
      return csr;
    }
  } catch (e: any) {
    throw new Error(
      `controllers.virtual_hosts.getCsr: Couldn't find a virtual host with id:${id}`
    );
  }
};

const addCsr = async (virtualHostId: string, csr: string): Promise<boolean> => {
  try {
    const vh = await VirtualHost.findById(virtualHostId);
    if (!vh) {
      throw Error(
        "controllers.virtual_hosts.addCsr: No virtual host was found with the given id."
      );
    }
    vh.csr = csr;
    await vh.save();
    console.log("Added the csr");
    return true;
  } catch (e: any) {
    console.log("Something went wrong in addCsr: " + e);
    return false;
  }
};

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

const requestCsr = async (
  virtualHostId: string,
  formData: Object
): Promise<boolean> => {
  try {
    // I need the agent Id for the server hosting this domain (virtual host)
    const agentId = await getAgentId(virtualHostId);
    if (!agentId)
      throw new Error(
        "Could not find the agent Id related to the given domain"
      );
    // I need the virtual host data to send to the agent for it to know what to generate
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost)
      throw new Error("No virtual host was found with the given Id");

    // Join the form data with the virtual host data from the db
    const jsonData = JSON.stringify({
      request: "csr",
      ...virtualHost.toObject(),
      ...formData,
    });
    publishMessage("csrExchange", agentId, jsonData);
    return true;
  } catch (e: any) {
    console.log("Error in request csr");
    return false;
  }
};

/*
const setOldVirtualHosts = async (
  updatedVirtualHostsIds: Types.ObjectId[]
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
*/

const updateVirtualHost = async (
  virtualHostData: IVirtualHost,
  webServerId: Types.ObjectId,
  certificateId: Types.ObjectId | undefined
): Promise<IVirtualHost> => {
  console.log(`Receiving virtual host data: ${virtualHostData}`);
  console.log(
    `The certificate path in server is ${virtualHostData.certificate_path}, the private key path is ${virtualHostData.certificate_key_path}, the root is ${virtualHostData.root}`
  );
  const virtualHost = await VirtualHost.findOneAndUpdate(
    {
      vh_ips: virtualHostData.vh_ips,
      domain_names: virtualHostData.domain_names,
    },
    {
      enabled: virtualHostData.enabled,
      web_server_id: webServerId,
      certificate_id: certificateId,
      csr: virtualHostData.csr,
      certificate_path: virtualHostData.certificate_path,
      certificate_key_path: virtualHostData.certificate_key_path,
      root: virtualHostData.root,
    },
    { upsert: true, new: true }
  );
  return virtualHost;
};

export {
  updateVirtualHost,
  //setOldVirtualHosts,
  requestCsr,
  getAgentId,
  addCsr,
  getCsr,
  installCertificate,
};
