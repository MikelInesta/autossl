import { IWebServer } from "../models/web_servers";
import { Server } from "../models/servers";

export const createNewServer = async (
  ip: string,
  os: string,
  newWebServers: IWebServer[]
) => {
  //Get the name of the last recorded server and add 1 to it
  const lastServer = await Server.findOne();
  const lastVal = lastServer ? lastServer.server_name.split("-")[1] : "0";
  const newServer = new Server({
    server_name: `Server-${parseInt(lastVal) + 1}`,
    server_ip: ip,
    operating_system: os,
    web_servers: newWebServers,
  });

  newServer.save();
  return newServer;
};
