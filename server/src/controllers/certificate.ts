import { Certificate, ICertificate } from "../models/certificates";

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

export { getCertificateById };
