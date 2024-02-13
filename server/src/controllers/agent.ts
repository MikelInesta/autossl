import { IWebServer, WebServer } from "../models/web_servers";
import { Server, IServer } from "../models/servers";
import { create } from "domain";

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

const createNewServer = async (
  ip: string,
  os: string,
  newWebServers: IWebServer[]
) => {
  const newServer = new Server({
    //Generate a random name for the server
    server_name: `Server-${Math.floor(Math.random() * 100)}`,
    server_ip: ip,
    operating_system: os,
    web_servers: newWebServers,
  });

  newServer.save();
  return newServer;
};
