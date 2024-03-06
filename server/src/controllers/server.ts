import { IWebServer, WebServer } from "../models/web_servers";
import { IServer, Server } from "../models/servers";
import { Mongoose, Types } from "mongoose";
import { VirtualHost } from "../models/virtual_hosts";
import { Certificate } from "../models/certificates";

const ReplaceServer = async (
  server_name: string,
  server_ip: string,
  operating_system: string
): Promise<IServer> => {
  try {
    // Attempt to find the server
    const server = await Server.findOne({
      server_ip: server_ip,
    }).exec();

    if (server) {
      console.log("Server found:", server);
      return server;
    } else {
      // Server was not found, creating a new one
      const newServer = new Server({
        server_name,
        server_ip,
        operating_system,
      });
      await newServer.save();
      console.log("New server created:", newServer);
      return newServer;
    }
  } catch (e: any) {
    throw new Error(`FindOrCreateServer failed: ${e.message}`);
  }
};

const deleteServer = async (server: Partial<IServer>): Promise<boolean> => {
  if (server.web_servers) {
    try {
      // Find the virtualhosts for each web_server and delete them
      for (const web_server of server.web_servers) {
        /* Find the certificate for every virtualhost and set its is_old field to true
            I don´t delete certificates when updating for logging*/
        const virtual_hosts = await VirtualHost.find({
          web_server_id: web_server._id,
        });
        for (const virtual_host of virtual_hosts) {
          await Certificate.findByIdAndUpdate(virtual_host.certificate, {
            is_old: true,
          });
        }
      }
      return true;
    } catch (e: any) {
      console.log(`deleteServer failed: ${e.message}`);
      return false;
    }
  } else {
    // Delete the server
    try {
      await Server.findByIdAndDelete(server._id);
      return true;
    } catch (e: any) {
      console.log(`deleteServer failed to delete the server: ${e.message}`);
      return false;
    }
  }
};

export { ReplaceServer };
