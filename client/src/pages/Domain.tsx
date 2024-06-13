import { Alert, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IDomain } from "../types/models";
import DomainOptions from "../components/DomainOptions";
import DomainInfo from "../components/DomainInfo";
import DomainStatus from "../components/DomainStatus";
import VirtualHostTable from "../components/VirtualHostTable";

const Domain = () => {
  const { domainId, serverId, webServerId } = useParams();
  const [domain, setDomain] = useState<IDomain | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/domains/id/${domainId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        setDomain(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDomain();
  }, [domainId]);

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
          {domainId && serverId && webServerId && (
            <>
              <Grid item md={12}>
                <DomainOptions
                  domainId={domainId}
                  serverId={serverId}
                  webServerId={webServerId}
                />
              </Grid>
              <Grid item md={12}>
                <Grid container spacing={2} direction={"row"}>
                  <Grid item xs={12} md={6}>
                    <DomainInfo domain={domain} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DomainStatus domain={domain} />
                  </Grid>
                </Grid>
                {/* I need a virtual hosts table and a certificates table here */}
              </Grid>
              <Grid item xs={12}>
                Virtual Hosts
                <VirtualHostTable
                  domainId={domainId}
                  serverId={serverId}
                  webServerId={webServerId}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};

export default Domain;
