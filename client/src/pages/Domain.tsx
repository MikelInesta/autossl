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
import { IDomain, IServer, IVirtualHost, IWebServer } from "../types/models";
import DomainOptions from "../components/DomainOptions";
import VirtualHostTable from "../components/VirtualHostTable";
import CertificateTable from "../components/CertificateTable";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DomainInfo from "../components/DomainInfo";
import {
  fetchDomain,
  fetchServer,
  fetchSslVirtualHost,
  fetchWebServer,
} from "../requests/FetchFunctions";

const Domain = () => {
  const { domainId, serverId, webServerId } = useParams();
  const [domain, setDomain] = useState<IDomain | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  const [sslVhErr, setSslVhErr] = useState<string>("");
  const [loadingSsl, setLoadingSsl] = useState<boolean>(true);

  const [sslVirtualHost, setSslVirtualHost] = useState<IVirtualHost | null>(
    null
  );
  const [server, setServer] = useState<IServer | null>(null);
  const [webServer, setWebServer] = useState<IWebServer | null>(null);

  useEffect(() => {
    if (domainId) {
      fetchSslVirtualHost(
        setSslVirtualHost,
        setLoadingSsl,
        setSslVhErr,
        domainId
      );
      fetchDomain(setDomain, setLoading, setErr, domainId);
      serverId && fetchServer(setServer, setLoading, setErr, serverId);
      webServerId &&
        fetchWebServer(setWebServer, setLoading, setErr, webServerId);
    }
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
          <Typography color="text.primary">
            {domain?.domain_names || ""}
          </Typography>
        </Breadcrumbs>
      </Grid>
      {loading && <CircularProgress />}
      {err && <Alert severity="warning">{err}</Alert>}
      {!err && !loading && (
        <Grid container>
          {domainId && serverId && webServerId && (
            <>
              <Grid
                item
                xs={12}
                margin={1}
                justifyContent={"center"}
                alignContent={"center"}
                container
              >
                <Grid
                  item
                  xs={4}
                  sx={{ justifyContent: "center", alignContent: "center" }}
                >
                  <h1>{domain?.domain_names}</h1>
                </Grid>
                <Grid>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ArrowDropDownIcon />}
                      aria-controls="panel2-content"
                      id="panel2-header"
                    >
                      <Typography>Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <DomainInfo domain={domain} />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
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
                  sslVirtualHost={sslVirtualHost}
                />
              </Grid>
              <Grid item container direction={"row"} md={12}>
                <Grid item container xs={12} margin={3}>
                  <Divider sx={{ width: "100%" }} />
                </Grid>

                <Grid
                  item
                  container
                  xs={12}
                  direction={"row"}
                  justifyContent={"space-around"}
                >
                  <Grid
                    item
                    xs={12}
                    md={3}
                    component={Paper}
                    margin={1}
                    padding={2}
                  >
                    <p>
                      CSR Status:
                      <br />
                      <br />
                      Status...
                    </p>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={3}
                    component={Paper}
                    margin={1}
                    padding={2}
                  >
                    <p>
                      Installation Status:
                      <br />
                      <br />
                      Status...
                    </p>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={3}
                    component={Paper}
                    margin={1}
                    padding={2}
                  >
                    <p>
                      Rollback Status:
                      <br />
                      <br />
                      Status...
                    </p>
                  </Grid>
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
