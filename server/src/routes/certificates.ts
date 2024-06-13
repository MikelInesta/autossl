import express from "express";
import { getCertificateById } from "../controllers/certificate";
import { Domain } from "../models/domains";
import { Certificate } from "../models/certificates";
import { VirtualHost } from "../models/virtual_hosts";
import { WebServer } from "../models/web_servers";
import { Server } from "../models/servers";
import { publishMessage } from "../config/rabbit";

const certificateRouter = express.Router();

/*

  Forwards the required data to the agent for rolling back to an old certificate
*/
certificateRouter.get("/rollback/:certificateId", async (req, res) => {
  try {
    const certificateId = req.params.certificateId;
    if (!certificateId) {
      throw new Error("Certificate ID was not provided");
    }

    const wantedCertificate = await Certificate.findById(certificateId);

    if (!wantedCertificate) {
      throw new Error("Couldn't find a certificate with the given ID.");
    }

    const domain = await Domain.findOne({
      certificate_ids: wantedCertificate._id,
    });

    if (!domain) {
      throw new Error("Could not find a domain with the given certificate");
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

    const data = {
      request: "rollback",
      wantedCertificateId: wantedCertificate._id,
      currentCertificateId: currentCertificate._id,
      wantedCertificateServerBlock: wantedCertificate.server_block,
      currentCertificateServerBlock: currentCertificate.server_block,
      configurationFile: virtualHost.configuration_file,
    };

    await publishMessage("csrExchange", server.agent_id.toString(), data);

    res.sendStatus(200);
  } catch (e) {
    console.log(
      `Something went wrong while sending the rollback request to the agent.`
    );
    res.status(500).send(e);
  }
});

/*
  Returns the certificates associated to the domain with the given id
*/
certificateRouter.get("/domain-id/:domainId", async (req, res) => {
  try {
    const domainId = req.params.domainId;
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
    console.log(
      `Something went wrong trying to get the certificates for a domain: ${e}`
    );
    res.sendStatus(500);
  }
});

// Endpoint for the client to request a CSR
certificateRouter.get("/csr/:domain", async (req, res) => {
  try {
    const domain = req.params.domain;
    if (!domain) {
      res.status(400).send("A domain name is required to request a CSR");
      return;
    }
    // Get the CSR (function in the certificate controller)
    // csr = await getCSR(domain);
  } catch (e: any) {
    console.log(e.message);
    res.sendStatus(500);
  }
});

certificateRouter.get("/id/:cerificateId", async (req, res) => {
  const certificateId = req.params.cerificateId;
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
    console.error("Error getting the certificate:", e.message);
    res.sendStatus(500);
  }
});

export default certificateRouter;
