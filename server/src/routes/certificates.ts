import express from "express";
import {
  getCertificateById,
  updateCertificate,
} from "../controllers/certificate";
import { Domain } from "../models/domains";
import { Certificate } from "../models/certificates";
import { VirtualHost } from "../models/virtual_hosts";
import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";
import { publishMessage } from "../config/rabbit";

const certificateRouter = express.Router();

/*
  This route is for the agent to register those certificates that are found in the filesystem
  (/etc/ssl/certs/autossl) but are not in the database.
  Here they must be:
    1- Registered as certificates
    2- Related to their domain
*/
certificateRouter.post("/new", async (req, res) => {
  console.log("/certificates/new");

  try {
    const body = req.body;
    const cert = req.body.cert;
    const domainName = req.body.domainName;
    if (!body || !cert || !domainName) {
      res.sendStatus(400);
      return;
    }

    const domain = await Domain.findOne({
      domain_names: { $regex: new RegExp(domainName) },
    });

    if (!domain) {
      res.sendStatus(404);
      return;
    }

    // Save the certificate
    const createdCert = await updateCertificate(cert);

    if (!createdCert) {
      res.sendStatus(500);
      return;
    }

    if (!domain.certificate_ids.includes(createdCert._id.toString())) {
      domain.certificate_ids.push(createdCert._id.toString());
    }

    await domain.save();

    res.sendStatus(200);
  } catch (e: any) {
    console.log(`Error at '/certificates/new' :${e}`);
    res.sendStatus(500);
  }
});

/*
  Forwards the required data to the agent for rolling back to an old certificate
  TODO: Move this into the controller
*/
certificateRouter.get("/rollback/:certificateId", async (req, res) => {
  const certificateId = req.params.certificateId;
  console.log(`/certificates/rollback/${certificateId}`);

  try {
    if (!certificateId) {
      throw new Error("Certificate ID was not provided");
    }

    console.log(`/certificates/rollback/${certificateId}`);

    const wantedCertificate = await Certificate.findById(certificateId);

    if (!wantedCertificate) {
      throw new Error("Couldn't find a certificate with the given ID.");
    }

    const domain = await Domain.findOne({
      domain_names: wantedCertificate.domain_names,
    });

    if (!domain) {
      throw new Error(`Couldn't find a domain for the requested certificate.`);
    }

    // Find the virtual host in this domain where the certificate is enabled
    const virtualHost = await VirtualHost.findOne({
      _id: { $in: domain.virtual_host_ids },
      certificate_id: { $exists: true, $ne: null },
    });

    if (!virtualHost) {
      throw new Error("Couldn't find the required virtual host for rollback");
    }

    const currentCertificate = await Certificate.findById(
      virtualHost.certificate_id
    );

    if (!currentCertificate) {
      throw new Error("Could not find a certificate to replace in rollback");
    }

    // Gotta climb up the tree to get the agent id

    const webServer = await WebServer.findById(virtualHost.web_server_id);

    if (!webServer) {
      throw new Error("Could not get the agent Id related to this certificate");
    }

    const server = await Server.findById(webServer.server_id);

    if (!server) {
      throw new Error("Could not get the agent Id related to this certificate");
    }

    const domainName = virtualHost.domain_names.split(" ")[0];

    const data = {
      request: "rollback",
      wantedCertificateId: wantedCertificate._id,
      currentCertificateId: currentCertificate._id,
      wantedCertificateServerBlock: wantedCertificate.server_block,
      currentCertificateServerBlock: currentCertificate.server_block,
      configurationFile: virtualHost.configuration_file,
      domainName: domainName,
      currentCertPath: virtualHost.certificate_path,
    };

    await publishMessage(
      "csrExchange",
      server.agent_id.toString(),
      JSON.stringify(data)
    );

    res.sendStatus(200);
  } catch (e) {
    console.log(`Error at '/certificates/rollback/${certificateId}' :${e}`);
    res.status(500).send(e);
  }
});

/*
  Returns the certificates associated to the domain with the given id
*/
certificateRouter.get("/domain-id/:domainId", async (req, res) => {
  const domainId = req.params.domainId;
  console.log(`/certificates/domain-id/${domainId}`);
  try {
    if (!domainId) {
      res.sendStatus(400);
      return;
    }

    const domain = await Domain.findById(domainId);

    if (!domain) {
      res.sendStatus(404);
      return;
    }

    let certificates = [];
    for (const certId of domain.certificate_ids) {
      const cert = await Certificate.findById(certId);
      if (cert) {
        certificates.push(cert);
      }
    }

    res.status(200).send(certificates);
  } catch (e: any) {
    console.log(`Error at '/certificates/domain-id/${domainId}': ${e}`);
    res.sendStatus(500);
  }
});

// Endpoint for the client to request a CSR
certificateRouter.get("/csr/:domain", async (req, res) => {
  const domain = req.params.domain;
  console.log(`/certificates/csr/${domain}`);
  try {
    if (!domain) {
      res.status(400).send("A domain name is required to request a CSR");
      return;
    }
    // Get the CSR (function in the certificate controller)
    // csr = await getCSR(domain);
  } catch (e: any) {
    console.log(`Error at '/certificates/csr${domain}': ${e}`);
    res.sendStatus(500);
  }
});

certificateRouter.get("/id/:cerificateId", async (req, res) => {
  const certificateId = req.params.cerificateId;
  console.log(`/certificates/id/${certificateId}`);
  if (!certificateId) {
    res.status(400).send("certificate ID is required");
    return;
  }
  try {
    const certificate = await getCertificateById(certificateId);
    if (!certificate) {
      res.sendStatus(404);
    } else {
      res.status(200).json(certificate);
    }
  } catch (e: any) {
    console.log(`Error at '/certificates/id/${certificateId}': ${e}`);
    res.sendStatus(500);
  }
});

export default certificateRouter;
