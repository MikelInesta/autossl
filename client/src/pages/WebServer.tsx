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
import { fetchServer, fetchWebServer } from "../requests/FetchFunctions";

const WebServer = () => {
  const { serverId, webServerId } = useParams();
  const [webServer, setWebServer] = useState<IWebServer | null>(null);
  const [server, setServer] = useState<IServer | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    webServerId &&
      fetchWebServer(setWebServer, setLoading, setErr, webServerId);
    serverId && fetchServer(setServer, setLoading, setErr, serverId);
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
      {err && <Alert severity="warning">{err}</Alert>}
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
