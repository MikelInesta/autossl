import { Alert, CircularProgress, Divider, Grid, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IDomain } from "../types/models";
import DomainOptions from "../components/DomainOptions";
import DomainInfo from "../components/DomainInfo";
import DomainStatus from "../components/DomainStatus";
import VirtualHostTable from "../components/VirtualHostTable";
import CertificateTable from "../components/CertificateTable";

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
        <Grid container>
          {domainId && serverId && webServerId && (
            <>
              <Grid
                item
                component={Paper}
                xs={12}
                margin={1}
                elevation={3}
                square={true}
                padding={3}
              >
                <DomainOptions
                  serverId={serverId}
                  webServerId={webServerId}
                  domainId={domainId}
                />
              </Grid>
              <Grid item container direction={"row"} md={12}>
                <Grid item container xs={12} margin={3}>
                  <Divider sx={{ width: "100%" }} />
                </Grid>
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
                  <DomainInfo domain={domain} />
                </Grid>

                <Grid item container xs={12} margin={3}>
                  <Divider sx={{ width: "100%" }} />
                </Grid>

                <Grid item container xs={12} justifyContent={"center"}>
                  <Grid item sm={2}>
                    <h2>Virtual Hosts</h2>
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
                  <VirtualHostTable
                    serverId={serverId}
                    webServerId={webServerId}
                    domainId={domainId}
                  />
                </Grid>

                <Grid item container xs={12} margin={3}>
                  <Divider sx={{ width: "100%" }} />
                </Grid>

                <Grid item container xs={12} justifyContent={"center"}>
                  <Grid item sm={2}>
                    <h2>Certificates</h2>
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
                  <CertificateTable
                    serverId={serverId}
                    webServerId={webServerId}
                    domainId={domainId}
                  />
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
