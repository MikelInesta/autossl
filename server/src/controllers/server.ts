import { IWebServer, WebServer } from "../models/web_servers";
import { IServer, Server } from "../models/servers";
import { setOldCertificates, updateCertificate } from "./certificate";
import { setOldWebServers, updateWebServer } from "./web_server";
import { setOldVirtualHosts, updateVirtualHost } from "./virtual_host";

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
    { upsert: true, new: true },
  );
  return server;
};

const update = async (updateData: any): Promise<Boolean> => {
  try {
    if (!updateData.server) return false;

    /*--------------------------Server------------------------------*/
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
        server._id,
      );
      updatedWebServersIds.push(webServer._id);

      for (const site in webServerData.virtual_hosts) {
        for (const virtualHostData of webServerData.virtual_hosts[site]) {
          var certificateId = undefined;
          if (virtualHostData.certificate) {
            const certificate = await updateCertificate(
              virtualHostData.certificate,
            );
            certificateId = certificate._id;
            updatedCertificatesIds.push(certificateId);
          }
          const virtualHost = await updateVirtualHost(
            virtualHostData,
            webServer._id,
            certificateId,
          );
          updatedVirtualHostsIds.push(virtualHost._id);
        }
      }
    }

    await setOldWebServers(updatedWebServersIds);
    await setOldCertificates(updatedCertificatesIds);
    await setOldVirtualHosts(updatedVirtualHostsIds);

    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

export { update, getServers, getWebServers };
