import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";

export const getWebServersByName = async (name: string) => {
  // Find the server with the given ip
  const server = await Server.findOne({ server_name: name });
  if (!server) throw new Error("Server with the given name was not found");

  if (!server.web_servers) return [];

  const webServers = server.web_servers.map((webServer) => {
    return {
      id: webServer._id,
      name: webServer.web_server_name,
      path: webServer.configuration_path,
    };
  });
  console.log(webServers);
  return webServers;
};
