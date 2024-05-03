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
import VirtualHostOptionsMenu from "./VirtualHostOptionsMenu";

interface IVirtualHost {
  _id: string;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: string;
  certificate_id: string;
  old: boolean;
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
    <>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 0 }}>
        <h2>Server ID: {serverId}</h2>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 0 }}>
        <h3>Web Server ID: {webServerId}</h3>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>IP Addresses</TableCell>
              <TableCell>Domain Names</TableCell>
              <TableCell>Is Enabled</TableCell>
              <TableCell>Web Server ID</TableCell>
              <TableCell>Certificate ID</TableCell>
              <TableCell>Is Old</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {virtualHosts.map((virtualHost) => (
              <TableRow key={virtualHost._id}>
                <TableCell>{virtualHost._id}</TableCell>
                <TableCell>
                  <ul>
                    {virtualHost.vh_ips.map((ip) => (
                      <li>{ip}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{virtualHost.domain_names}</TableCell>
                <TableCell>{virtualHost.enabled ? "Yes" : "No"}</TableCell>
                <TableCell>{virtualHost.web_server_id}</TableCell>
                <TableCell>{virtualHost.web_server_id}</TableCell>
                <TableCell>{virtualHost.old ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <VirtualHostOptionsMenu
                    serverId={serverId}
                    webServerId={virtualHost.web_server_id}
                    virtualHostId={virtualHost._id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default VirtualHostTable;
