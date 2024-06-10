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

const setOldWebServers = async (
  updatedWebServersIds: Types.ObjectId[]
): Promise<Boolean> => {
  try {
    const oldWebServers = await WebServer.find({
      _id: { $nin: updatedWebServersIds },
    });
    for (const oldWebServer of oldWebServers) {
      console.log(
        `Deleting web server with id: ${oldWebServer._id} name: ${oldWebServer.web_server_name}`
      );
      WebServer.findByIdAndDelete(oldWebServer._id);
    }
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

export { getVirtualHosts, updateWebServer, setOldWebServers };
