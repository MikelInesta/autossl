import express from "express";
import { getCertificateById } from "../controllers/certificate";

const certificateRouter = express.Router();

// Endpoint for the client to request a CSR
certificateRouter.get("/csr/:key", (req, res) => {
  try {
    const key = req.params.key;
    if (!key) {
      res.status(400).send("Key is required");
      return;
    }
    // Get the CSR (function in the certificate controller)
    // csr = await getCSR(key);
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
