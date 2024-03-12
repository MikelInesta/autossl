import { WebServer, IWebServer } from "../models/web_servers";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";
import { Types } from "mongoose";

const getVirtualHosts = async (
  webServerId: string
): Promise<IVirtualHost[]> => {
  try {
    const webServer = await WebServer.findById(webServerId);
    if (!webServer) return [];
    const virtualHosts = await VirtualHost.find({ web_server_id: webServerId });
    return virtualHosts;
  } catch (e: any) {
    console.log(e.message);
    return [];
  }
};

const updateWebServer = async (
  webServerName: string,
  webServerData: any,
  serverId: Types.ObjectId
): Promise<IWebServer> => {
  const webServer = await WebServer.findOneAndUpdate(
    { web_server_name: webServerName },
    {
      configuration_path: webServerData.configuration_path,
      server_id: serverId,
    },
    { upsert: true, new: true }
  );
  return webServer;
};

export { getVirtualHosts, updateWebServer };
