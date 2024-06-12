import express from "express";
import { getCertificateById } from "../controllers/certificate";
import { publishMessage } from "../config/rabbit";
import { Agent } from "../models/agents";
import { getAgentId } from "../controllers/virtual_host";

const certificateRouter = express.Router();

// certificateRouter.get("testGetAgentId", async (req, res) => {
//   const agentId = await getAgentId(virtualHostI);
// });

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
