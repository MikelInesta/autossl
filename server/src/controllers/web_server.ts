import { WebServer, IWebServer } from "../models/web_servers";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";

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

export { getVirtualHosts };
