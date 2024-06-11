import { Types } from "mongoose";
import { Certificate, ICertificate } from "../models/certificates";

const setOldCertificates = async (
  updatedCertificatesIds: Types.ObjectId[]
): Promise<Boolean> => {
  try {
    const oldCertificates = await Certificate.find({
      _id: { $nin: updatedCertificatesIds },
    });
    for (const oldCertificate of oldCertificates) {
      console.log(
        `Deleting certificate with serial: ${oldCertificate.serial_number}`
      );
      Certificate.findByIdAndDelete(oldCertificate._id);
    }
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

const getCertificateById = async (
  certificateId: string
): Promise<ICertificate | null> => {
  try {
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) return null;
    return certificate;
  } catch (e: any) {
    console.log(e.message);
    return null;
  }
};

const updateCertificate = async (
  certificateData: ICertificate
): Promise<ICertificate> => {
  const certificate = await Certificate.findOneAndUpdate(
    { serial_number: certificateData.serial_number },
    {
      subject: certificateData.subject,
      issuer: certificateData.issuer,
      has_expired: certificateData.has_expired,
      not_after: certificateData.not_after,
      not_before: certificateData.not_before,
      serial_number: certificateData.serial_number,
      serial_number_hex: certificateData.serial_number_hex,
      signature_algorithm: certificateData.signature_algorithm,
      version: certificateData.version,
      public_key_length: certificateData.public_key_length,
      server_block: certificateData.server_block,
    },
    { upsert: true, new: true }
  );
  return certificate;
};

export { getCertificateById, updateCertificate, setOldCertificates };
