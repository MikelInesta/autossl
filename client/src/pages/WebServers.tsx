//Showing multiple servers here only makes sense when a user has multiples servers associated
import * as React from "react";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";
import WebServerTable from "../components/WebServerTable";
import { IWebServer } from "../types/models";
import { Alert } from "@mui/material";

const WebServers: React.FC = () => {
  const { serverId } = useParams();
  const [webServers, setWebServers] = React.useState<IWebServer[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  if (serverId) {
    React.useEffect(() => {}, [serverId]);
  } else {
    // If I have the server Id I don't need to fetch all the web servers, just create the component
    React.useEffect(() => {
      const fetchWebServers = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/servers`
          );
          const data = await response.json();
          setWebServers(data);
        } catch (error) {
          setError(
            "Something went wrong fetching the web servers for this server"
          );
        }
      };

      fetchWebServers();
    }, []);
  }
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <h1>Web Servers</h1>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {serverId && <WebServerTable serverId={serverId} />}
      {!serverId &&
        webServers.map((webServer) => (
          <WebServerTable serverId={webServer._id} />
        ))}
    </>
  );
};

export default WebServers;
