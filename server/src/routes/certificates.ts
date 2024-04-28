import express from "express";
import { getCertificateById } from "../controllers/certificate";
import { publishMessage } from "../config/rabbit";
import { Agent } from "../models/agent";

const certificateRouter = express.Router();

certificateRouter.get("/testCsr", async (req, res) => {
  try {
    const agent = await Agent.findOne();
    if (agent) {
      console.log(`publishing message to 662928cadbf726c2e705bd3e`);
      await publishMessage(
        "csrExchange",
        "662928cadbf726c2e705bd3e",
        "testing csr exchange :0",
      );
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (e: any) {
    console.log("something went wrong. :(");
    res.sendStatus(500);
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
