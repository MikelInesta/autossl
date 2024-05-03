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
  Divider,
} from "@mui/material";
import WebServerOptionsMenu from "./WebServerOptionsMenu";
import { IWebServer } from "../types/models";

const WebServerTable = ({ serverId }: { serverId: string }) => {
  const [webServers, setWebServers] = useState<IWebServer[]>([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const fetchWebServers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/web-servers/serverid/${serverId}`
        );
        const data = await response.json();
        if (data.length > 0) {
          setShowTable(true);
        }
        setWebServers(data);
      } catch (error) {
        console.error("Error fetching web servers:", error);
      }
    };

    fetchWebServers();
  });

  return (
    <Paper sx={{ margin: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 0 }}>
        <h2>Server ID: {serverId}</h2>
      </Box>
      {!showTable && (
        <p style={{ textAlign: "center", color: "red" }}>
          There are no Web Servers assigned to this Server
        </p>
      )}
      {showTable && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Operating System</TableCell>
                  <TableCell>Archived (Old)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webServers.map((webServer) => (
                  <TableRow key={webServer._id}>
                    <TableCell>{webServer._id}</TableCell>
                    <TableCell>{webServer.web_server_name}</TableCell>
                    <TableCell>{webServer.configuration_path}</TableCell>
                    <TableCell>{webServer.server_id}</TableCell>
                    <TableCell>{webServer.old ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <WebServerOptionsMenu
                        serverId={serverId}
                        webServerId={webServer._id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Divider></Divider>
    </Paper>
  );
};

export default WebServerTable;
