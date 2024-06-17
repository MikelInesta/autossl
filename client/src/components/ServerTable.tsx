import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { IServer } from "../types/models";

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

    fetchServers();
  }, []);

  return (
    <>
      {errorAlert.length > 0 && <Alert severity="error">{errorAlert}</Alert>}
      {servers.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server._id} hover={true}>
                  <TableCell>
                    <Link
                      to={`/servers/${server._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {server.server_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/servers/${server._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {server.server_ip}
                    </Link>
                  </TableCell>
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
