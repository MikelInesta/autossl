import { IWebServer, WebServer } from "../models/web_servers";
import { IServer, Server } from "../models/servers";
import { updateCertificate } from "./certificate";
import { setOldWebServers, updateWebServer } from "./web_server";
import { setOldVirtualHosts, updateVirtualHost } from "./virtual_host";
import { Agent } from "../models/agents";

const getWebServers = async (serverId: string): Promise<IWebServer[]> => {
  try {
    const webServers = await WebServer.find({ server_id: serverId });
    return webServers;
  } catch (e: any) {
    console.log(e.message);
    return [];
  }
};

const getServers = async (): Promise<IServer[]> => {
  try {
    const servers = await Server.find();
    return servers;
  } catch (e: any) {
    console.log(e.message);
    return [];
  }
};

const updateServer = async (serverData: IServer): Promise<IServer> => {
  const server = await Server.findOneAndUpdate(
    {
      agent_id: serverData.agent_id,
    },
    {
      server_name: serverData.server_name,
      operating_system: serverData.operating_system,
      server_ip: serverData.server_ip,
    },
    { upsert: true, new: true }
  );
  return server;
};

/*
  Function used by /agents/update to handle the update of every entity
*/

const update = async (updateData: any): Promise<Boolean> => {
  if (!updateData.server) {
    throw new Error("Server data is missing.");
  }

  try {
    const agentExists = await Agent.findOne({
      _id: updateData.server.agent_id,
    });

    if (!agentExists) {
      throw new Error(
        `Could not find an agent in the database with id: ${updateData.server.agent_id}`
      );
    }

    const server = await updateServer(updateData.server);

    const webServers = updateData.server.web_servers;
    var updatedWebServersIds = [];
    var updatedCertificatesIds = [];
    var updatedVirtualHostsIds = [];
    for (const webServerName in webServers) {
      const webServerData = webServers[webServerName];
      const webServer = await updateWebServer(
        webServerName,
        webServerData,
        server._id
      );
      updatedWebServersIds.push(webServer._id);

      for (const site in webServerData.virtual_hosts) {
        for (const virtualHostData of webServerData.virtual_hosts[site]) {
          var certificateId = undefined;
          if (virtualHostData.certificate) {
            const certificate = await updateCertificate(
              virtualHostData.certificate
            );
            certificateId = certificate._id;
            updatedCertificatesIds.push(certificateId);
          }
          const virtualHost = await updateVirtualHost(
            virtualHostData,
            webServer._id,
            certificateId
          );
          updatedVirtualHostsIds.push(virtualHost._id);
        }
      }
    }

    await setOldWebServers(updatedWebServersIds);
    // Certificates work a little different, I don't really want to delete them
    // unless they are no longer in the autossl folder
    //await setOldCertificates(updatedCertificatesIds);
    await setOldVirtualHosts(updatedVirtualHostsIds);

    return true;
  } catch (e: any) {
    console.error("Failed to update:", e.message, e.stack);
    throw e;
  }
};

export { update, getServers, getWebServers };
