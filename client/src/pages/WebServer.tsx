import {
  Alert,
  Breadcrumbs,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IServer, IWebServer } from "../types/models";
import WebServerInfo from "../components/WebServerInfo";
import DomainTable from "../components/DomainTable";

const WebServer = () => {
  const { serverId, webServerId } = useParams();
  const [webServer, setwebServer] = useState<IWebServer | null>(null);
  const [server, setServer] = useState<IServer | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);

  useEffect(() => {
    const fetchWebServer = async () => {
      console.log("Fetching web server data");
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

    // Fetch the server data too for the breadcrumb... wasting resources lol
    const fetchServer = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/servers/${serverId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        setServer(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWebServer();
    fetchServer();
  }, []);

  return (
    <>
      <Grid item xs={12} margin={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/servers">
            Servers
          </Link>
          <Link underline="hover" color="inherit" href={`/servers/${serverId}`}>
            {server?.server_name || ""}
          </Link>
          <Typography color="text.primary">
            {webServer?.web_server_name || ""}
          </Typography>
        </Breadcrumbs>
      </Grid>
      {loading && <CircularProgress />}
      {err && (
        <Alert severity="warning">
          Couldn't retrieve this web server data from the backend.
        </Alert>
      )}
      {!err && !loading && (
        <Grid container spacing={2}>
          {serverId && webServerId && (
            <>
              <Grid item container direction={"row"} md={12}>
                <Grid
                  item
                  xs={12}
                  sm={10}
                  md={8}
                  lg={6}
                  justifySelf={"left"}
                  component={Paper}
                  margin={1}
                  padding={1}
                  elevation={3}
                  square={true}
                >
                  <WebServerInfo webServer={webServer} />
                </Grid>

                <Grid item container xs={12} margin={3}>
                  <Divider sx={{ width: "100%" }} />
                </Grid>

                <Grid item container xs={12} justifyContent={"center"}>
                  <Grid item sm={2}>
                    <h2>Domains</h2>
                  </Grid>
                </Grid>

                <Grid
                  item
                  component={Paper}
                  xs={12}
                  margin={1}
                  elevation={3}
                  square={true}
                >
                  <DomainTable serverId={serverId} webServerId={webServerId} />
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};

export default WebServer;
