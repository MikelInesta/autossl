import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

interface IVirtualHost {
  _id: string;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: string;
  certificate_id: string;
  //old: boolean;
}

const VirtualHostTable: React.FC<{ serverId: string; webServerId: string }> = ({
  serverId,
  webServerId,
}: {
  serverId: string;
  webServerId: string;
}) => {
  const [virtualHosts, setVirtualHosts] = useState<IVirtualHost[]>([]);

  useEffect(() => {
    const fetchVirtualHosts = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/virtual-hosts/webserverid/${webServerId}`
        );
        const data = await response.json();
        setVirtualHosts(data);
      } catch (error) {
        console.error("Error fetching virtual hosts:", error);
      }
    };

    fetchVirtualHosts();
  });

  return (
    virtualHosts.length > 0 && (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Domain Names</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Is Enabled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {virtualHosts.map((virtualHost) => (
                <TableRow
                  component={Link}
                  to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHost._id}`}
                  key={virtualHost._id}
                  hover={true}
                >
                  <TableCell>{virtualHost.domain_names}</TableCell>
                  <TableCell>
                    <ul>
                      {virtualHost.vh_ips.map((ip) => (
                        <li key={ip}>{ip}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{virtualHost.enabled ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  );
};

export default VirtualHostTable;
