import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Collapse,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { ICertificate, IVirtualHost } from "../types/models";
import { fetchSslVirtualHost } from "../requests/FetchFunctions";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CertificateInfo from "./CertificateInfo";
import { updateRollbackStatus } from "../requests/Status";

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

  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

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

  const handleClick = (id: string) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [id]: !prevOpen[id],
    }));
  };

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
    } finally {
      domainId &&
        updateRollbackStatus(domainId, "Rollback has been requested...");
    }
  };

  return (
    certificates.length > 0 && (
      <>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Issuer</TableCell>
                <TableCell>Expiration date</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((certificate) => (
                <React.Fragment key={certificate._id}>
                  <TableRow
                    hover={true}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleClick(certificate._id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {open[certificate._id] ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
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
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={6}
                    >
                      <Collapse
                        in={open[certificate._id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box margin={1}>
                          <CertificateInfo certificate={certificate} />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  );
};

export default CertificateTable;
