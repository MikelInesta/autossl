import { Box, Button, Grid } from "@mui/material";
import { ICertificate } from "../types/models";

const CertificateInfo = ({
  certificate,
}: {
  certificate: ICertificate | null;
}) => {
  let success = false;

  const handleCertificateEnabling = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/certificates/rollback/${
          certificate && certificate._id
        }`
      );

      if (!response.ok) {
        throw new Error("Received a Negative response: " + response.status);
      } else {
        success = true;
      }
    } catch (e) {
      console.log(
        `Something went wrong trying to enable this certificate: ${e}`
      );
    }
  };

  return (
    <Box>
      {certificate != null && (
        <Grid container spacing={2}>
          {success && <p>Successfully sent certificate</p>}
          <Grid item xs={12} xl={12}>
            <Grid container>
              <Grid item xs={12} lg={6}>
                <h1>{certificate.issuer.common_name}</h1>
              </Grid>
              <Grid
                item
                xs={12}
                lg={6}
                alignContent={"center"}
                justifyContent={"center"}
              >
                <Button
                  onClick={handleCertificateEnabling}
                  variant="contained"
                  sx={{ color: "white" }}
                >
                  Enable this Certificate
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} xl={12}>
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
              <strong>Issuer Common Name:</strong>{" "}
              {certificate.issuer.common_name}
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
              <strong>Has Expired:</strong>{" "}
              {certificate.has_expired ? "Yes" : "No"}
              <br />
              <strong>Not After:</strong> {certificate.not_after.toString()}
              <br />
              <strong>Not Before:</strong> {certificate.not_before.toString()}
              <br />
              <strong>Serial Number:</strong> {certificate.serial_number}
              <br />
              <strong>Serial Number Hex:</strong>{" "}
              {certificate.serial_number_hex}
              <br />
              <strong>Signature Algorithm:</strong>{" "}
              {certificate.signature_algorithm}
              <br />
              <strong>Version:</strong> {certificate.version}
              <br />
              <strong>Public Key Length:</strong>{" "}
              {certificate.public_key_length}
              <br />
              <strong>Server Block:</strong> <br />
              <pre>{certificate.server_block}</pre>
              <br />
              <strong>CSR:</strong> {certificate.csr_used}
            </p>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CertificateInfo;
