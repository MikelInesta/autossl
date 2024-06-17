import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ICertificate, IVirtualHost } from "../types/models";
import { fetchSslVirtualHost } from "../requests/FetchFunctions";

const CertificateTable: React.FC<{
  serverId: string;
  webServerId: string;
  domainId: string;
}> = ({
  serverId,
  webServerId,
  domainId,
}: {
  serverId: string;
  webServerId: string;
  domainId: string;
}) => {
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [sslVirtualHost, setSslVirtualHost] = useState<IVirtualHost | null>(
    null
  );

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/certificates/domain-id/${domainId}`
        );
        const data = await response.json();
        setCertificates(data);
      } catch (error) {
        console.error("Error fetching certificates for this domain:", error);
        setError(
          "Something went wrong fetching the certificates for this domain."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
    fetchSslVirtualHost(setSslVirtualHost, setLoading, setError, domainId);
  }, []);

  const handleCertificateEnabling = async (certificateId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/certificates/rollback/${certificateId}`
      );

      if (!response.ok) {
        throw new Error("Received a Negative response: " + response.status);
      }
    } catch (e) {
      console.log(
        `Something went wrong trying to enable this certificate: ${e}`
      );
    }
  };

  return (
    certificates.length > 0 && (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Issuer</TableCell>
                <TableCell>Expiration date</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((certificate) => (
                <TableRow
                  component={Link}
                  to={`/servers/${serverId}/web-servers/${webServerId}/domains/${domainId}/certificates/${certificate._id}`}
                  key={certificate._id}
                  hover={true}
                >
                  <TableCell>{certificate.issuer.common_name}</TableCell>
                  <TableCell>{certificate.not_after.toString()}</TableCell>
                  <TableCell>
                    {!certificate.has_expired &&
                      sslVirtualHost?.certificate_id != certificate._id && (
                        <Button
                          onClick={() =>
                            handleCertificateEnabling(certificate._id)
                          }
                          variant="contained"
                          sx={{ color: "white" }}
                        >
                          Enable
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  );
};

export default CertificateTable;
