import express from "express";
import { Domain } from "../models/domains";
import { Certificate } from "../models/certificates";
import { VirtualHost } from "../models/virtual_hosts";
import { isValidObjectId } from "mongoose";

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
      for (const cert in data) {
        if (isValidObjectId(cert)) {
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
      }

      const certificateIds = Object.keys(data).filter((cert) =>
        isValidObjectId(cert)
      );
      if (certificateIds.length > 0) {
        const oldCertificates = await Certificate.find({
          _id: { $nin: certificateIds },
        });

        for (const oldCertificate of oldCertificates) {
          console.log(`Deleting certificate with id:${oldCertificate._id}`);
          const deletedCert = await Certificate.findByIdAndDelete(
            oldCertificate._id
          );

          let domain = await Domain.findOne({
            certificate_ids: oldCertificate._id,
          });

          if (domain) {
            domain.certificate_ids = domain.certificate_ids.filter(
              (certId) => certId.toString() !== oldCertificate._id.toString()
            );
            await domain.save();
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (e: any) {
    console.log(`Something went wrong updating the certificates: ${e.message}`);
    res.sendStatus(500);
  }
});

export default domainRouter;
