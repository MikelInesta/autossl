import express from "express";
import { getVirtualHosts } from "../controllers/web_server";
import {
  associateCsrToCert,
  hasCertificate,
  requestCsr,
  updateCsrStatus,
  updateInstallStatus,
  updateRollBackStatus,
} from "../controllers/virtual_host";
import { publishMessage } from "../config/rabbit";
import { getCsr } from "../controllers/virtual_host";
import { VirtualHost } from "../models/virtual_hosts";
import { installCertificate } from "../controllers/virtual_host";

const virtualHostRouter = express.Router();

virtualHostRouter.get("/associate-csr-cert/:vhId", async (req, res) => {
  try {
    const vhId = req.params.vhId;
    associateCsrToCert(vhId);
  } catch (e: any) {
    console.log(`Something went wrong trying to associate csr to cert`);
    res.sendStatus(500);
  }
});

virtualHostRouter.post("/update/rollback-status", async (req, res) => {
  try {
    const { vhId, rollBackStatus } = req.body;
    const result = await updateRollBackStatus(vhId, rollBackStatus);
    if (!result) res.sendStatus(400);
    else res.sendStatus(200);
  } catch (e: any) {
    res.sendStatus(500);
  }
  const requestBody = req.body;
  if (!requestBody) {
    res.sendStatus(400);
    return;
  }
});

virtualHostRouter.post("/update/csr-status", async (req, res) => {
  try {
    const { vhId, csrStatus } = req.body;
    const result = await updateCsrStatus(vhId, csrStatus);
    if (!result) res.sendStatus(400);
    else res.sendStatus(200);
  } catch (e: any) {
    res.sendStatus(500);
  }
  const requestBody = req.body;
  if (!requestBody) {
    res.sendStatus(400);
    return;
  }
});

virtualHostRouter.post("/update/install-status", async (req, res) => {
  try {
    const { vhId, installStatus } = req.body;
    const result = await updateInstallStatus(vhId, installStatus);
    if (!result) res.sendStatus(400);
    else res.sendStatus(200);
  } catch (e: any) {
    res.sendStatus(500);
  }
  const requestBody = req.body;
  if (!requestBody) {
    res.sendStatus(400);
    return;
  }
});

virtualHostRouter.get("/get-domain/:domainNames", async (req, res) => {
  /*
    Gotta return (if exists) the domain with a certificate
  */
  const domainNames = req.params.domainNames;
  if (!domainNames) {
    res.status(400).send("Domain names are required");
    return;
  }
  try {
    const domains = await VirtualHost.find({ domain_names: domainNames });

    let foundDomain = null;

    domains.forEach((domain) => {
      if (domain.certificate_id) {
        foundDomain = domain;
      }
    });

    if (foundDomain == null) {
      if (domains.length < 1) {
        res.sendStatus(404);
        return;
      }

      // This means no virtual host with a certificate id was found so I just send one
      foundDomain = domains.pop();
    }

    res.status(200).json(foundDomain);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

virtualHostRouter.get("/has-certificate/:domainNames", async (req, res) => {
  const domainNames = req.params.domainNames;
  if (!domainNames) {
    res.status(400).send("Domain names are required");
    return;
  }
  try {
    const virtualHost = await hasCertificate(domainNames);
    if (!virtualHost) {
      res.status(404).send("Domain has no certificates registered.");
      return;
    }
    res.status(200).json(virtualHost);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

virtualHostRouter.post(
  "/install-certificate/:virtualHostId",
  async (req, res) => {
    console.log("requesting a certificate installation...");
    const virtualHostId = req.params.virtualHostId;
    try {
      const data = req.body;
      console.log("data: ", data);
      if (!virtualHostId || !data) {
        res.status(400).send("Mandatory data was not received");
        return;
      }
      const result = await installCertificate(virtualHostId, data);
      if (!result) {
        res.sendStatus(500);
        return;
      }
    } catch (e: any) {
      console.log(e.message);
      res.sendStatus(500);
      return;
    }
  }
);

virtualHostRouter.get("/:virtualHostId", async (req, res) => {
  const virtualHostId = req.params.virtualHostId;
  if (!virtualHostId) {
    res.status(400).send("Virtual Host ID is required");
    return;
  }
  try {
    const virtualHost = await VirtualHost.findById(virtualHostId);
    if (!virtualHost) {
      res.status(404).send("Virtual Host not found");
      return;
    }
    res.status(200).json(virtualHost);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

virtualHostRouter.get("/viewCsr/:id", async (req, res) => {
  console.log("trying to viewCsr");
  try {
    const virtualHostId = req.params.id;
    if (!virtualHostId) {
      res.sendStatus(422);
    }
    const csr = await getCsr(virtualHostId);
    if (!csr) {
      res.sendStatus(404);
      return;
    }
    const csrJson = JSON.stringify({
      csr: csr,
    });
    console.log(`Sending ${csrJson}`);
    res.status(200).send(csrJson);
  } catch {
    res.sendStatus(500);
  }
});

virtualHostRouter.get("/testRabbit/:key", async (req, res) => {
  try {
    const key = req.params.key;
    if (!key) {
      console.log("No agent ID was providad for /testCsr");
      res.sendStatus(422);
    }
    publishMessage("csrExchange", key, "Message from backend")
      .then(() => {
        res.sendStatus(200);
      })
      .catch((e: any) => {
        console.log(
          "something went wrong publishing a message to exchange: ",
          e
        );
      });
  } catch (e: any) {
    console.log("Something went wrong.");
    res.sendStatus(500);
  }
});

virtualHostRouter.post("/getCsr/:virtualHostId", async (req, res) => {
  const formData = req.body;
  const virtualHostId = req.params.virtualHostId;
  if (!virtualHostId) {
    res.sendStatus(422);
  }
  const response = await requestCsr(virtualHostId, formData);
  if (!response) {
    res.sendStatus(500);
  } else {
    res.sendStatus(200);
  }
});

virtualHostRouter.get("/webserverid/:webserverid", async (req, res) => {
  const webServerId = req.params.webserverid;
  if (!webServerId) {
    res.status(400).send("Web Server ID is required");
    return;
  }
  try {
    const virtualHosts = await getVirtualHosts(webServerId);
    res.status(200).json(virtualHosts);
  } catch (e: any) {
    res.sendStatus(500);
    return;
  }
});

export default virtualHostRouter;
