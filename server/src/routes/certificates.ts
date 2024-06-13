import express from "express";
import { getCertificateById } from "../controllers/certificate";
import { Domain } from "../models/domains";
import { Certificate } from "../models/certificates";

const certificateRouter = express.Router();

/*

  Forwards the required data to the agent for rolling back to an old certificate

*/
certificateRouter.get("/rollback/:certificateId", async (req, res) => {
  try {
  } catch (e) {}
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
