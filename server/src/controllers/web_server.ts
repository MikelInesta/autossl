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
  webServerData: IWebServer,
  serverId: Types.ObjectId
): Promise<IWebServer> => {
  const webServer = await WebServer.findOneAndUpdate(
    { web_server_name: webServerName, server_id: serverId },
    {
      configuration_path: webServerData.configuration_path,
    },
    { upsert: true, new: true }
  );
  return webServer;
};

/*
const setOldWebServers = async (
  updatedWebServersIds: Types.ObjectId[]
): Promise<Boolean> => {
  try {
    const oldWebServers = await WebServer.find({
      _id: { $nin: updatedWebServersIds },
    });
    if (oldWebServers.length === 0) console.log("No old web servers");
    for (const oldWebServer of oldWebServers) {
      oldWebServer.old = true;
      await oldWebServer.save();
    }
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};
*/

export { getVirtualHosts, updateWebServer };
