import express from "express";
import { Domain } from "../models/domains";
import { VirtualHost } from "../models/virtual_hosts";
import { updateCertificates } from "../controllers/domain";
import { Certificate } from "../models/certificates";

const domainRouter = express.Router();

/* 
  Returns the certificates associated to the domain with this domain_names
*/
domainRouter.get("/certificates/:domainNames", async (req, res) => {
  try {
    const domainNames = req.params.domainNames;
    if (!domainNames) {
      res.sendStatus(404);
      return;
    }

    const domain = await Domain.findOne({ domain_names: domainNames });

    if (!domain) {
      res.sendStatus(404);
      return;
    }

    let certificates = [];

    for (const certificateId in domain.certificate_ids) {
      const cert = await Certificate.findById(certificateId);
      certificates.push(cert);
    }
  } catch (e: any) {
    console.log(
      `Something went wrong retrieving the certificates: ${e.message}`
    );
    res.sendStatus(500);
  }
});

/* 
  Returns the virtual hosts with the given domain names
*/
domainRouter.get("/virtual-hosts/:domainNames", async (req, res) => {
  try {
    const domainNames = req.params.domainNames;
    if (!domainNames) {
      res.sendStatus(404);
      return;
    }

    const virtualHosts = await VirtualHost.find({ domain_names: domainNames });
    res.status(200).send(virtualHosts);
  } catch (e: any) {
    console.log(
      `Something went wrong retrieving a domains virtual hosts: ${e.message}`
    );
    res.sendStatus(500);
  }
});

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
