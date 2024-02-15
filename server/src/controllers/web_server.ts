import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";
import { createNewServer } from "./server";

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

export const updateWebServers = async (ip: string, webServers: String[]) => {
  // Create the new web servers objects to be added to the server
  const newWebServers = webServers.map((webServer) => {
    // Create a new web server and save it to the database
    return new WebServer({
      web_server_name: webServer.slice(webServer.lastIndexOf("/")),
      configuration_path: webServer,
    });
  });

  // Find the server with the given ip and update the webservers
  const server = await Server.findOneAndUpdate(
    { server_ip: ip },
    { web_servers: newWebServers }
  );
  if (!server) {
    // If the server does not exist, create a new one with the given server ip and web servers
    //Linux is hard coded right now, but it should be obtained from the agent
    await createNewServer(ip, "Linux", newWebServers);
  }
};
