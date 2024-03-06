import { IWebServer, WebServer } from "../models/web_servers";
import { IServer, Server } from "../models/servers";
import { Mongoose, Types } from "mongoose";
import { VirtualHost } from "../models/virtual_hosts";
import { Certificate } from "../models/certificates";

const update = async (updateData: any): Promise<Boolean> => {
  try {
    if (!updateData.server) return false;

    /*--------------------------Server------------------------------*/
    // Update or create a server
    var server = await Server.findOneAndUpdate(
      { server_ip: updateData.server.server_ip },
      {
        server_name: updateData.server.server_name,
        operating_system: updateData.server.operating_system,
        // web_servers: newWebServers, * will be added later
      },
      { upsert: true }
    );
    /* newWebServers array is for adding the relation later to the server*/
    const newWebServers = [];
    const webServers = updateData.server.web_servers;
    for (const webServerName in webServers) {
      /*--------------------------Web Server------------------------------*/
      // Update or create each web server
      var ws = await WebServer.findOneAndUpdate(
        { web_server_name: webServerName },
        {
          configuration_path: webServers[webServerName].configuration_path,
        }
      );
      if (!ws) {
        ws = new WebServer({
          web_server_name: webServerName,
          configuration_path: webServers[webServerName].configuration_path,
        });
        ws.save();
        newWebServers.push(ws);
      }

      /*From this point on the update is aimed only towards nginx virtual hosts/server blocks (probably)*/

      // Iterate through the sites files
      for (const site in webServers[webServerName].virtual_hosts) {
        // Iterate through the virtual hosts (server blocks)
        for (const vh of webServers[webServerName].virtual_hosts[site]) {
          /*--------------------------Virtual Host------------------------------*/

          /*--------------------------Certificate------------------------------*/
          var certificate = undefined;
          if (vh.certificate) {
            certificate = await Certificate.findOneAndUpdate(
              { serial_number: vh.certificate.serial_number },
              {
                directory_path: vh.certificate.directory_path,
                subject: vh.certificate.subject,
                issuer: vh.certificate.issuer,
                validity: vh.certificate.validity,
                public_key: vh.certificate.public_key,
                signature_algorithm: vh.certificate.signature_algorithm,
                serial_number: vh.certificate.serial_number,
              },
              { upsert: true }
            );
          }

          // Identify the virtual hosts by both the domain names and the ips
          const virtualHost = await VirtualHost.findOneAndUpdate(
            {
              vh_ips: vh.vh_ips,
              domain_names: vh.domain_names,
            },
            {
              enabled: vh.enabled,
              web_server_id: ws._id,
              certificate_id: certificate ? certificate._id : null,
            },
            { upsert: true }
          );
        }
      }
    }
    // Add the web servers to the server
    if (server) {
      server = await Server.findOneAndUpdate(
        { _id: server._id },
        { web_servers: newWebServers }
      );
    }

    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};
