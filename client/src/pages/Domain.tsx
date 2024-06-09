import { Alert, Box, CircularProgress, Grid, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IVirtualHost } from "../types/models";
import DomainOptions from "../components/DomainOptions";
import DomainInfo from "../components/DomainInfo";
import DomainStatus from "../components/DomainStatus";

const Domain = () => {
  const { virtualHostId, serverId, webServerId } = useParams();
  const [virtualHost, setVirtualHost] = useState<IVirtualHost | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);

  useEffect(() => {
    const fetchVirtualHost = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/virtual-hosts/${virtualHostId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        setVirtualHost(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVirtualHost();
  }, [virtualHostId]);

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
          {virtualHostId && serverId && webServerId && (
            <>
              <Grid item md={12}>
                <DomainOptions
                  virtualHostId={virtualHostId}
                  serverId={serverId}
                  webServerId={webServerId}
                />
              </Grid>
              <Grid item md={12}>
                <Grid container spacing={2} direction={"row"}>
                  <Grid item xs={12} md={6}>
                    <DomainInfo virtualHost={virtualHost} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DomainStatus virtualHost={virtualHost} />
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

export default Domain;
