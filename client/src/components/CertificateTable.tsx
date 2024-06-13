import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ICertificate } from "../types/models";

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
      }
    };

    fetchCertificates();
  });

  return (
    certificates.length > 0 && (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Issuer</TableCell>
                <TableCell>Has Expired?</TableCell>
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
                  <TableCell>
                    {certificate.has_expired ? "Yes" : "No"}
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
