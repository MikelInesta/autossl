import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

interface IServer {
  _id: string;
  server_name: string;
  server_ip: string;
  operating_system: string;
  agent_id: string;
  //old: boolean;
}

const ServerTable: React.FC = () => {
  const [servers, setServers] = useState<IServer[]>([]);
  const [errorAlert, setErrorAlert] = useState<String>("");

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/servers`);
        const data = await response.json();
        setServers(data);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setErrorAlert("Something went wrong fetching the servers.");
      }
    };

    fetchServers(); // It's fetching twice, probably due to parent re-render, should fix...
  }, []);

  return (
    <>
      {errorAlert.length > 0 && <Alert severity="error">{errorAlert}</Alert>}
      {servers.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers.map((server) => (
                <TableRow
                  key={server._id}
                  component={Link}
                  to={`/servers/${server._id}`}
                  hover={true}
                >
                  <TableCell>{server.server_name}</TableCell>
                  <TableCell>{server.server_ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default ServerTable;
