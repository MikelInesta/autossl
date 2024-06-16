import express from "express";
import { Domain } from "../models/domains";
import { VirtualHost } from "../models/virtual_hosts";
import { updateCertificates } from "../controllers/domain";
import { Certificate } from "../models/certificates";
import { installCertificate } from "../controllers/virtual_host";

const domainRouter = express.Router();

/* 
  Returns the domains with the given parent web server id
*/
domainRouter.get("/webserverid/:webServerId", async (req, res) => {
  const webServerId = req.params.webServerId;
  console.log(`/domains/webserverid/${webServerId}`);
  try {
    if (!webServerId) {
      res.sendStatus(404);
      return;
    }

    const domains = await Domain.find({ web_server_id: webServerId });

    if (domains.length < 1) {
      res.sendStatus(404);
      return;
    }

    res.status(200).send(domains);
  } catch (e: any) {
    console.log(`Error at '/domains/webserverid/${webServerId}': ${e}`);
    res.sendStatus(500);
  }
});

/* 
  Returns the certificates associated to the domain with this domain_names
*/
domainRouter.get("/certificates/:domainNames", async (req, res) => {
  const domainNames = req.params.domainNames;
  console.log(`/domains/certificates/${domainNames}`);
  try {
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
    res.status(200).send(certificates);
  } catch (e: any) {
    console.log(`Error at '/domains/certificates/${domainNames}': ${e}`);
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

domainRouter.get("/id/:domainId", async (req, res) => {
  const domainId = req.params.domainId;
  if (!domainId) {
    res.status(400).send("The domain id parameter is required");
    return;
  }
  try {
    const domain = await Domain.findById(domainId);
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

domainRouter.post("/install-certificate/:domainId", async (req, res) => {
  const domainId = req.params.domainId;
  const data = req.body;
  if (!domainId || !data) {
    res.status(400).send("The domain id parameter and data are required");
    return;
  }
  try {
    const domain = await Domain.findById(domainId);

    if (!domain) {
      res.sendStatus(404);
      return;
    }

    domain.virtual_host_ids.forEach((vhId) => {
      VirtualHost.findById(vhId)
        .then((vh) => {
          if (vh) {
            const req = installCertificate(vh._id.toString(), data).then(
              (response) => {
                if (response) {
                  return;
                } else {
                  throw new Error(
                    "Something went wrong installing the certificate"
                  );
                }
              }
            );
          }
        })
        .catch((e: any) => {
          console.log("Something went wrong installing a certificatej: " + e);
        });
    });
    res.sendStatus(200);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

domainRouter.get("/getCsr/:domainId", async (req, res) => {
  try {
    const domainId = req.params.domainId;

    if (!domainId) {
      res.sendStatus(404);
      return;
    }

    const domain = await Domain.findById(domainId);
    if (!domain) {
      res.sendStatus(404);
      return;
    }

    for (const vhId in domain.virtual_host_ids) {
      const vh = await VirtualHost.findById(vhId);
      if (vh && vh.csr) {
        const csrJson = JSON.stringify({
          csr: vh.csr,
        });
        res.status(200).send(csrJson);
        return;
      }
    }

    res.sendStatus(404);
  } catch (e: any) {
    console.log(`Something went wrong getting the csr: ${e.message}`);
    res.sendStatus(500);
  }
});

export default domainRouter;
