import { Box } from "@mui/material";
import { ICertificate } from "../types/models";

const CertificateInfo = ({
  certificate,
}: {
  certificate: ICertificate | null;
}) => {
  return (
    <Box>
      {certificate != null && (
        <p>
          <strong>Common Name:</strong> {certificate.subject.common_name}
          <br />
          <strong>Organization:</strong> {certificate.subject.organization}
          <br />
          <strong>Organizational Unit:</strong>{" "}
          {certificate.subject.organizational_unit}
          <br />
          <strong>Country:</strong> {certificate.subject.country}
          <br />
          <strong>State:</strong> {certificate.subject.state}
          <br />
          <strong>Locality:</strong> {certificate.subject.locality}
          <br />
          <strong>Issuer Common Name:</strong> {certificate.issuer.common_name}
          <br />
          <strong>Issuer Organization:</strong>{" "}
          {certificate.issuer.organization}
          <br />
          <strong>Issuer Organizational Unit:</strong>{" "}
          {certificate.issuer.organizational_unit}
          <br />
          <strong>Issuer Country:</strong> {certificate.issuer.country}
          <br />
          <strong>Issuer State:</strong> {certificate.issuer.state}
          <br />
          <strong>Issuer Locality:</strong> {certificate.issuer.locality}
          <br />
          <strong>Has Expired:</strong> {certificate.has_expired ? "Yes" : "No"}
          <br />
          <strong>Not After:</strong> {certificate.not_after.toString()}
          <br />
          <strong>Not Before:</strong> {certificate.not_before.toString()}
          <br />
          <strong>Serial Number:</strong> {certificate.serial_number}
          <br />
          <strong>Serial Number Hex:</strong> {certificate.serial_number_hex}
          <br />
          <strong>Signature Algorithm:</strong>{" "}
          {certificate.signature_algorithm}
          <br />
          <strong>Version:</strong> {certificate.version}
          <br />
          <strong>Public Key Length:</strong> {certificate.public_key_length}
          <br />
          <strong>Server Block:</strong> <br />
          <pre>{certificate.server_block}</pre>
          <br />
        </p>
      )}
    </Box>
  );
};

export default CertificateInfo;
