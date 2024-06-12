import express from "express";
import { Domain } from "../models/domains";
import { Certificate } from "../models/certificates";
import { VirtualHost } from "../models/virtual_hosts";

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

    if (data) {
      // Append the certificates to the corresponding domain
      for (const cert in data) {
        const dbVh = await VirtualHost.findOne({ certificate_id: cert });
        if (dbVh) {
          const dbDomain = await Domain.findOne({
            domain_names: dbVh.domain_names,
          });
          if (dbDomain) {
            dbDomain.certificate_ids.push(cert);
            await dbDomain.save();
          }
        }
      }

      // Remove the certificates that are no longer used both themselves and from domains
      const certificateIds = Object.keys(data);
      if (certificateIds.length > 0) {
        const oldCertificates = await Certificate.find({
          _id: { $nin: certificateIds },
        });

        for (const oldCertificate of oldCertificates) {
          console.log(`Deleting certificate with id:${oldCertificate._id}`);
          const deletedCert = await Certificate.findByIdAndDelete(
            oldCertificate._id
          );

          // Now delete it's id from the corresponding domain
          let domain = await Domain.findOne({
            certificate_ids: oldCertificate._id,
          });

          if (domain) {
            domain.certificate_ids.forEach((certId, i) => {
              if (certId == oldCertificate._id.toString()) {
                domain.certificate_ids.splice(i, 1);
              }
            });
            await domain.save();
          }
        }
      }
    }
  } catch (e: any) {
    console.log(`Somethin went wrong updating the certificates: ${e.message}`);
    res.sendStatus(500);
  }
});

export default domainRouter;
