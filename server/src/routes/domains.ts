import express from "express";
import { Domain } from "../models/domains";
import { Certificate } from "../models/certificates";
import { VirtualHost } from "../models/virtual_hosts";
import { isValidObjectId } from "mongoose";
import { updateCertificates } from "../controllers/domain";

const domainRouter = express.Router();

domainRouter.get("/:domainNames", async (req, res) => {
  const domainNames = req.params.domainNames;
  if (!domainNames) {
    res.status(400).send("The domain names parameter is required");
    return;
  }
  try {
    const domain = await Domain.findOne({ domain_names: domainNames });
    res.status(200).json(domain);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

domainRouter.post("/update-certificates", async (req, res) => {
  try {
    const data = req.body;
    await updateCertificates(data);
    res.sendStatus(200);
  } catch (e: any) {
    console.log(`Something went wrong updating the certificates: ${e.message}`);
    res.sendStatus(500);
  }
});

export default domainRouter;
