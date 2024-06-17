import { Box } from "@mui/system";
import CreateCsrForm from "../components/CreateCsrForm";
import { useParams } from "react-router-dom";
import React, { useState } from "react";
import { Alert, Breadcrumbs, Grid, Link, Typography } from "@mui/material";
import {
  fetchDomain,
  fetchServer,
  fetchWebServer,
} from "../requests/FetchFunctions";
import { IDomain, IServer, IWebServer } from "../types/models";

const CreateCsr = () => {
  const { serverId, webServerId, domainId } = useParams();

  const [domain, setDomain] = useState<IDomain | null>(null);
  const [server, setServer] = useState<IServer | null>(null);
  const [webServer, setWebServer] = useState<IWebServer | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  React.useEffect(() => {
    serverId && fetchServer(setServer, setLoading, setErr, serverId);
    webServerId &&
      fetchWebServer(setWebServer, setLoading, setErr, webServerId);
    domainId && fetchDomain(setDomain, setLoading, setErr, domainId);
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
          <Typography color="text.primary">Request CSR</Typography>
        </Breadcrumbs>
      </Grid>
      {err && <Alert severity="error">{err}</Alert>}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: 3,
        }}
      >
        <h1>Generate a Certificate Signing Request</h1>
      </Box>
      {serverId && webServerId && domainId && (
        <CreateCsrForm
          domainId={domainId}
          serverId={serverId}
          webServerId={webServerId}
        />
      )}
    </>
  );
};

export default CreateCsr;
