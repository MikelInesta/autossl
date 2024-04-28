import express from "express";
import { getCertificateById } from "../controllers/certificate";
import { publishMessage } from "../config/rabbit";
import { Agent } from "../models/agent";

const certificateRouter = express.Router();

certificateRouter.get("/testCsr", async (req, res) => {
  try {
    const agent = await Agent.findOne();
    if (agent) {
      await publishMessage(
        "csrExchange",
        agent._id.toString(),
        "testing csr exchange :0",
      );
    } else {
      res.status(404);
    }
  } catch (e: any) {
    console.log("something went wrong. :(");
    res.status(500);
  }
});

// Endpoint for the client to request a CSR
certificateRouter.get("/csr/:domain", (req, res) => {
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
    res.status(200).json(certificate);
  } catch (e: any) {
    console.error("Error getting the certificate:", e.message);
    res.sendStatus(500);
  }
});

export default certificateRouter;
