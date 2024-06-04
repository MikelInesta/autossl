import { useEffect, useState } from "react";
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
import { IServer } from "../types/models";

const WebServerTable = ({ serverId }: { serverId: string }) => {
  const [webServers, setWebServers] = useState<IWebServer[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [server, setServer] = useState<IServer | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    const fetchServerData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/servers/${serverId}`
        );
        const data = await response.json();
        setServer(data);
      } catch (error) {
        console.error("Error fetching server data:", error);
      }
    };

    fetchWebServers();
    fetchServerData();
  }, [serverId]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          marginTop: 0,
          marginLeft: 1,
        }}
      >
        <p>
          <strong>Server ID:</strong> {serverId}
          <br />
          <strong>Server Name:</strong> {server && server.server_name}
          <br />
          <strong>Server IP:</strong> {server && server.server_ip}
        </p>
      </Box>
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
    </>
  );
};

export default WebServerTable;
