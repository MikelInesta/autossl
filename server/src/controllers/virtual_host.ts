import { Types } from "mongoose";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";
import { Agent } from "../models/agents";
import { publishMessage } from "../config/rabbit";
import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";
import { Certificate } from "../models/certificates";
import { Domain, IDomain } from "../models/domains";

const associateCsrToCert = async (vhId: string) => {
  const virtualHost = await VirtualHost.findById(vhId);
  if (!virtualHost) {
    throw new Error("Could not find a virtual host with the given id");
  }
  const certificate = await Certificate.findOneAndUpdate(
    {
      _id: virtualHost.certificate_id,
    },
    {
      csr_used: virtualHost.csr,
    }
  );
};

const updateRollBackStatus = async (vhId: string, rollBackStatus: string) => {
  if (!vhId || !rollBackStatus) {
    return false;
  }

  const updateRes = await VirtualHost.findOneAndUpdate(
    { _id: vhId },
    {
      rollback_status: rollBackStatus,
    },
    {
      new: true,
    }
  );

  const result = updateRes ? true : false;
  return result;
};

const updateInstallStatus = async (vhId: string, installStatus: string) => {
  if (!vhId || !installStatus) {
    return false;
  }

  const updateRes = await VirtualHost.findOneAndUpdate(
    { _id: vhId },
    {
      certificate_install_status: installStatus,
    },
    {
      new: true,
    }
  );

  const result = updateRes ? true : false;
  return result;
};

const updateCsrStatus = async (vhId: string, csrStatus: string) => {
  if (!vhId || !csrStatus) {
    return false;
  }

  const updateRes = await VirtualHost.findOneAndUpdate(
    { _id: vhId },
    {
      csr_request_status: csrStatus,
    },
    {
      new: true,
    }
  );

  const result = updateRes ? true : false;
  return result;
};

const hasCertificate = async (
  domainNames: string
): Promise<IVirtualHost | null> => {
  try {
    const virtualHosts = await VirtualHost.find({
      domain_names: domainNames,
    });
    for (const virtualHost of virtualHosts) {
      // Only considers a valid certificate
      if (virtualHost.certificate_id) {
        return virtualHost;
      }
    }
    return null;
  } catch (e: any) {
    console.log(e.message);
    return null;
  }
};

const installCertificate = async (id: string, data: object) => {
  try {
    // I need the agent Id for the server hosting this domain (virtual host)
    const agentId = await getAgentId(id);
    if (!agentId)
      throw new Error(
        "Could not find the agent Id related to the given domain"
      );
    // I need the virtual host data to send to the agent for it to know what to generate
    const virtualHost = await VirtualHost.findById(id);
    if (!virtualHost)
      throw new Error("No virtual host was found with the given Id");

    // Join the form data with the virtual host data from the db
    const jsonData = JSON.stringify({
      request: "install",
      ...virtualHost.toObject(),
      ...data,
    });
    publishMessage("csrExchange", agentId, jsonData);
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

const getCsr = async (id: string) => {
  try {
    console.log("getting csr");
    const vh = await VirtualHost.findById(id);
    if (vh) {
      console.log(
        "controllers.virtual_hosts.getCsr: Found virtual host, looking for csr..."
      );
      console.log(vh.toString());
      const csr = vh?.csr;
      if (csr) {
        console.log(`csr: ${csr}`);
      }
      return csr;
    }
  } catch (e: any) {
    throw new Error(
      `controllers.virtual_hosts.getCsr: Couldn't find a virtual host with id:${id}`
    );
  }
};

const addCsr = async (virtualHostId: string, csr: string): Promise<boolean> => {
  try {
    const vh = await VirtualHost.findById(virtualHostId);
    if (!vh) {
      throw Error(
        "controllers.virtual_hosts.addCsr: No virtual host was found with the given id."
      );
    }
    vh.csr = csr;
    await vh.save();
    console.log("Added the csr");
    return true;
  } catch (e: any) {
    console.log("Something went wrong in addCsr: " + e);
    return false;
  }
};

const getAgentId = async (virtualHostId: string): Promise<string> => {
  try {
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost)
      throw new Error("Could not find a virtual host with the given Id");
    const parentWebServer = await WebServer.findById(virtualHost.web_server_id);
    if (!parentWebServer)
      throw new Error("Could not get the domains parent web server");
    const parentServer = await Server.findById(parentWebServer.server_id);
    if (!parentServer)
      throw new Error("Could not get the parent server for the web server");
    const agent = await Agent.findOne({
      server_ip: parentServer.server_ip,
    });
    if (!agent) throw new Error("Could not get the agent for the server");
    else return agent._id.toString();
  } catch (e) {
    console.log("Something went wrong in getAgentId function: " + e);
    return "";
  }
};

const requestCsr = async (
  virtualHostId: string,
  formData: Object
): Promise<boolean> => {
  try {
    // I need the agent Id for the server hosting this domain (virtual host)
    const agentId = await getAgentId(virtualHostId);
    if (!agentId)
      throw new Error(
        "Could not find the agent Id related to the given domain"
      );
    // I need the virtual host data to send to the agent for it to know what to generate
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost)
      throw new Error("No virtual host was found with the given Id");

    // Join the form data with the virtual host data from the db
    const jsonData = JSON.stringify({
      request: "csr",
      ...virtualHost.toObject(),
      ...formData,
    });
    publishMessage("csrExchange", agentId, jsonData);
    return true;
  } catch (e: any) {
    console.log("Error in request csr");
    return false;
  }
};

const setOldVirtualHosts = async (
  updatedVirtualHostsIds: Types.ObjectId[]
): Promise<Boolean> => {
  try {
    const oldVirtualHosts = await VirtualHost.find({
      _id: { $nin: updatedVirtualHostsIds },
    });
    for (const oldVirtualHost of oldVirtualHosts) {
      console.log(
        `Deleting virtual host with id:${oldVirtualHost._id}, names ${oldVirtualHost.domain_names}, ip: ${oldVirtualHost.vh_ips}`
      );
      await VirtualHost.findByIdAndDelete(oldVirtualHost._id);

      // Now delete it's id from the corresponding domain
      let domain = await Domain.findOne({
        domain_names: oldVirtualHost.domain_names,
      });
      if (domain) {
        domain.virtual_host_ids.forEach((vhId, i) => {
          if (vhId == oldVirtualHost._id.toString()) {
            domain.virtual_host_ids.splice(i, 1);
          }
        });
        await domain.save();
      }
    }
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

const updateVirtualHost = async (
  virtualHostData: IVirtualHost,
  webServerId: Types.ObjectId,
  certificateId: Types.ObjectId | undefined
): Promise<IVirtualHost> => {
  //console.log(`Receiving virtual host data: ${virtualHostData}`);
  /*console.log(
    `The certificate path in server is ${virtualHostData.certificate_path}, the private key path is ${virtualHostData.certificate_key_path}, the root is ${virtualHostData.root}`
  );*/

  const virtualHost = await VirtualHost.findOneAndUpdate(
    {
      vh_ips: virtualHostData.vh_ips,
      domain_names: virtualHostData.domain_names,
    },
    {
      enabled: virtualHostData.enabled,
      web_server_id: webServerId,
      certificate_id: certificateId,
      csr: virtualHostData.csr,
      certificate_path: virtualHostData.certificate_path,
      certificate_key_path: virtualHostData.certificate_key_path,
      root: virtualHostData.root,
      configuration_file: virtualHostData.configuration_file,
    },
    { upsert: true, new: true }
  );

  // Find the corresponding domain
  let domain = await Domain.findOne({
    domain_names: virtualHost.domain_names,
  });

  // If the domain does not exist create it
  if (!domain) {
    domain = await Domain.create({
      domain_names: virtualHost.domain_names,
    });
  }

  // Add the virtual hosts web server to the domain
  if (virtualHost.web_server_id) {
    domain.web_server_id = virtualHost.web_server_id;
  }

  /*
  
    A virtual host can only correspond to one domain, so here
    I shoould check if the virtual host already belongs to 
    one before adding it... 
  
  */

  // Make sure the current virtual host id is in the corresponding domain
  if (
    virtualHost._id &&
    !domain.virtual_host_ids.includes(virtualHost._id.toString())
  ) {
    domain.virtual_host_ids.push(virtualHost._id.toString());
  }

  // Make sure the current cert is in the corresponding domain
  if (
    virtualHost.certificate_id &&
    !domain.certificate_ids.includes(virtualHost.certificate_id.toString())
  ) {
    domain.certificate_ids.push(virtualHost.certificate_id.toString());
  }

  await domain.save();

  return virtualHost;
};

export {
  updateVirtualHost,
  setOldVirtualHosts,
  requestCsr,
  getAgentId,
  addCsr,
  getCsr,
  installCertificate,
  hasCertificate,
  updateCsrStatus,
  updateInstallStatus,
  updateRollBackStatus,
  associateCsrToCert,
};
