import express from "express";
import { getCertificateById } from "../controllers/certificate";

const certificateRouter = express.Router();

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
