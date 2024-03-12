import { IWebServer, WebServer } from "../models/web_servers";
import { IServer, Server } from "../models/servers";
import { updateCertificate } from "./certificate";
import { updateWebServer } from "./web_server";
import { updateVirtualHost } from "./virtual_host";

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
    { server_ip: serverData.server_ip },
    {
      server_name: serverData.server_name,
      operating_system: serverData.operating_system,
    },
    { upsert: true, new: true }
  );
  return server;
};

const update = async (updateData: any): Promise<Boolean> => {
  try {
    if (!updateData.server) return false;

    /*--------------------------Server------------------------------*/
    const server = await updateServer(updateData.server);

    const webServers = updateData.server.web_servers;
    for (const webServerName in webServers) {
      const webServerData = webServers[webServerName];
      const webServer = await updateWebServer(
        webServerName,
        webServerData,
        server._id
      );

      for (const site in webServerData.virtual_hosts) {
        for (const virtualHostData of webServerData.virtual_hosts[site]) {
          var certificateId = undefined;
          if (virtualHostData.certificate) {
            const certificate = await updateCertificate(
              virtualHostData.certificate
            );
            certificateId = certificate._id;
          }
          const virtualHost = await updateVirtualHost(
            virtualHostData,
            webServer._id,
            certificateId
          );
        }
      }
    }

    // Set the old property true for the data on the dbb that is not on the update data

    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

export { update, getServers, getWebServers };
