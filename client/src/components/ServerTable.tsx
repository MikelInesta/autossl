import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { IServer } from "../types/models";
import { fetchServers } from "../requests/FetchFunctions";

const ServerTable: React.FC = () => {
  const [servers, setServers] = useState<IServer[]>([]);
  const [error, setError] = useState<String>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchServers(setServers, setLoading, setError);
  }, []);

  return (
    <>
      {loading && <CircularProgress />}
      {error.length > 0 && <Alert severity="error">{error}</Alert>}
      {!loading && !error && servers.length > 0 && (
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
