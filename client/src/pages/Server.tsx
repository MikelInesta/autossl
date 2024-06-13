import { Alert, CircularProgress, Grid } from "@mui/material";
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
              <Grid item md={12}>
                <Grid container spacing={2} direction={"row"}>
                  <Grid item xs={12}>
                    <ServerInfo server={server} />
                  </Grid>
                  <Grid item xs={12}>
                    <WebServerTable serverId={serverId} />
                  </Grid>
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
