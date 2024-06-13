import { Alert, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IWebServer } from "../types/models";
import WebServerInfo from "../components/WebServerInfo";
import DomainTable from "../components/DomainTable";

const WebServer = () => {
  const { serverId, webServerId } = useParams();
  const [webServer, setwebServer] = useState<IWebServer | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);

  useEffect(() => {
    const fetchWebServer = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/web-servers/${webServerId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        } else {
          const result = await response.json();
          setwebServer(result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWebServer();
  }, []);

  return (
    <>
      {loading && <CircularProgress />}
      {err && (
        <Alert severity="warning">
          Couldn't retrieve this web server data from the backend.
        </Alert>
      )}
      {!err && !loading && (
        <Grid container spacing={2}>
          {serverId && webServerId && (
            <Grid item md={12}>
              <Grid container spacing={2} direction={"row"}>
                <Grid item xs={12}>
                  <WebServerInfo webServer={webServer} />
                </Grid>
                <Grid item xs={12}>
                  <DomainTable serverId={serverId} webServerId={webServerId} />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
};

export default WebServer;
