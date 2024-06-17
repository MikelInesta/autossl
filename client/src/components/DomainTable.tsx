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
import { IDomain } from "../types/models";

const DomainTable: React.FC<{ serverId: string; webServerId: string }> = ({
  serverId,
  webServerId,
}: {
  serverId: string;
  webServerId: string;
}) => {
  const [domains, setDomains] = useState<IDomain[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/domains/webserverid/${webServerId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setDomains(data);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomains();
  }, []);

  return (
    domains.length > 0 && (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Domain Names</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain._id}>
                  <TableCell>
                    <Link
                      to={`/servers/${serverId}/web-servers/${webServerId}/domains/${domain._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {domain.domain_names}
                    </Link>
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

export default DomainTable;
