import { isValidObjectId } from "mongoose";
import { VirtualHost } from "../models/virtual_hosts";
import { Certificate } from "../models/certificates";
import { Domain } from "../models/domains";

/*

Status update controllers

*/

const updateRollBackStatus = async (
  domainId: string,
  rollBackStatus: string
) => {
  if (!domainId || !rollBackStatus) {
    return false;
  }

  const updateRes = await Domain.findOneAndUpdate(
    { _id: domainId },
    {
      rollback_status: rollBackStatus,
    },
    {
      new: true,
    }
  );

  const result = updateRes ? true : false;
  return result;
};

const updateInstallStatus = async (domainId: string, installStatus: string) => {
  if (!domainId || !installStatus) {
    return false;
  }

  const updateRes = await Domain.findOneAndUpdate(
    { _id: domainId },
    {
      certificate_install_status: installStatus,
    },
    {
      new: true,
    }
  );

  const result = updateRes ? true : false;
  return result;
};

const updateCsrStatus = async (domainId: string, csrStatus: string) => {
  if (!domainId || !csrStatus) {
    return false;
  }

  const updateRes = await Domain.findOneAndUpdate(
    { _id: domainId },
    {
      csr_request_status: csrStatus,
    },
    {
      new: true,
    }
  );

  const result = updateRes ? true : false;
  return result;
};

const updateCertificates = async (data: [string]) => {
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
};

export {
  updateCertificates,
  updateCsrStatus,
  updateInstallStatus,
  updateRollBackStatus,
};
