import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IDomain, IServer, IVirtualHost, IWebServer } from "../types/models";
import {
  fetchDomain,
  fetchServer,
  fetchSslVirtualHost,
  fetchWebServer,
} from "../requests/FetchFunctions";

const DownloadCsr = () => {
  const { domainId, serverId, webServerId } = useParams();

  const [domain, setDomain] = useState<IDomain | null>(null);
  const [server, setServer] = useState<IServer | null>(null);
  const [webServer, setWebServer] = useState<IWebServer | null>(null);
  const [sslVirtualHost, setSslVirtualHost] = useState<IVirtualHost | null>(
    null
  );

  const [sslVhErr, setSslVhErr] = useState<string>("");
  const [loadingSsl, setLoadingSsl] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    domainId && fetchDomain(setDomain, setLoading, setError, domainId);
    domainId &&
      fetchSslVirtualHost(
        setSslVirtualHost,
        setLoadingSsl,
        setSslVhErr,
        domainId
      );
    serverId && fetchServer(setServer, setLoading, setError, serverId);
    webServerId &&
      fetchWebServer(setWebServer, setLoading, setError, webServerId);
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
          <Link
            underline="hover"
            color="inherit"
            href={`/servers/${serverId}/web-servers/${webServer?._id}`}
          >
            {webServer?.web_server_name || ""}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href={`/servers/${serverId}/web-servers/${webServer?._id}/domains/${domain?._id}`}
          >
            {domain?.domain_names || ""}
          </Link>
          <Typography color="text.primary">CSR</Typography>
        </Breadcrumbs>
      </Grid>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: 5,
        }}
      >
        <h2 style={{ alignSelf: "center" }}>
          Certificate Signing Request for {domain && domain.domain_names}
        </h2>
      </Box>
      <Grid container justifyContent={"center"}>
        <Grid item xs={8} component={Paper} padding={3} elevation={5}>
          {loading && <CircularProgress />}
          {error && <Alert severity="warning">{error}</Alert>}
          {!error && !loading && sslVirtualHost && (
            <pre>{sslVirtualHost.csr}</pre>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default DownloadCsr;
