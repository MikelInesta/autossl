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
import { IServer } from "../types/models";
import WebServerTable from "../components/WebServerTable";
import ServerInfo from "../components/ServerInfo";

const Server = () => {
  const { serverId } = useParams();
  const [server, setServer] = useState<IServer | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);

  useEffect(() => {
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

    fetchServer();
  }, [serverId]);

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
          <Typography color="text.primary">
            {server?.server_name || ""}
          </Typography>
        </Breadcrumbs>
      </Grid>
      {loading && <CircularProgress />}
      {err && (
        <Alert severity="warning">
          Couldn't retrieve this domains information from the backend.
        </Alert>
      )}
      {!err && !loading && (
        <Grid container spacing={2}>
          {serverId && (
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
                  <ServerInfo server={server} />
                </Grid>

                <Grid item container xs={12} margin={3}>
                  <Divider sx={{ width: "100%" }} />
                </Grid>

                <Grid item container xs={12} justifyContent={"center"}>
                  <Grid item sm={2}>
                    <h2>Web Servers</h2>
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
                  <WebServerTable serverId={serverId} />
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};

export default Server;
