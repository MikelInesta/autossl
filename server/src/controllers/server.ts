import { IWebServer, WebServer } from "../models/web_servers";
import { IServer, Server } from "../models/servers";
import { VirtualHost } from "../models/virtual_hosts";
import { Certificate } from "../models/certificates";

/* Given a server Id, returns the web server objects related to it */
const getWebServers = async (serverId: string): Promise<IWebServer[]> => {
  try {
    const webServers = await WebServer.find({ server_id: serverId });
    return webServers;
  } catch (e: any) {
    console.log(e.message);
    return [];
  }
};

/* Returns all the servers */
const getServers = async (): Promise<IServer[]> => {
  try {
    const servers = await Server.find();
    return servers;
  } catch (e: any) {
    console.log(e.message);
    return [];
  }
};

const update = async (updateData: any): Promise<Boolean> => {
  try {
    if (!updateData.server) return false;

    /*--------------------------Server------------------------------*/
    // Update or create a server
    const server = await Server.findOneAndUpdate(
      { server_ip: updateData.server.server_ip },
      {
        server_name: updateData.server.server_name,
        operating_system: updateData.server.operating_system,
      },
      { upsert: true, new: true }
    );

    const webServers = updateData.server.web_servers;
    for (const webServerName in webServers) {
      /*--------------------------Web Server------------------------------*/
      // Update or create each web server
      var ws = await WebServer.findOneAndUpdate(
        { web_server_name: webServerName },
        {
          configuration_path: webServers[webServerName].configuration_path,
          server_id: server._id,
        },
        { upsert: true, new: true }
      );

      /*From this point on the update is aimed only towards nginx virtual hosts/server blocks (probably)*/

      // Iterate through the sites files
      for (const site in webServers[webServerName].virtual_hosts) {
        // Iterate through the virtual hosts (server blocks)
        for (const vh of webServers[webServerName].virtual_hosts[site]) {
          /*--------------------------Virtual Host------------------------------*/

          /*--------------------------Certificate------------------------------*/
          var certificateId = undefined;
          if (vh.certificate) {
            const certificate = await Certificate.findOneAndUpdate(
              { serial_number: vh.certificate.serial_number },
              {
                subject: vh.certificate.subject,
                issuer: vh.certificate.issuer,
                has_expired: vh.certificate.has_expired,
                not_after: vh.certificate.not_after,
                not_before: vh.certificate.not_before,
                serial_number: vh.certificate.serial_number,
                serial_number_hex: vh.certificate.serial_number_hex,
                signature_algorithm: vh.certificate.signature_algorithm,
                version: vh.certificate.version,
                public_key_length: vh.certificate.public_key_length,
              },
              { upsert: true, new: true }
            );
            if (certificate) certificateId = certificate._id;
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
              certificate_id: certificateId,
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

export { update, getServers, getWebServers };
