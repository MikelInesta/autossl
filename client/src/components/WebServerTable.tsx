import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { IWebServer } from "../types/models";
import { Link } from "react-router-dom";

const WebServerTable = ({ serverId }: { serverId: string }) => {
  const [webServers, setWebServers] = useState<IWebServer[]>([]);
  const [showTable, setShowTable] = useState(false);
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

    fetchWebServers();
  }, []);

  return (
    <>
      {showTable && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webServers.map((webServer) => (
                  <TableRow key={webServer._id} hover={true}>
                    <TableCell>
                      <Link
                        to={`/servers/${serverId}/web-servers/${webServer._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {webServer.web_server_name}
                      </Link>
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
