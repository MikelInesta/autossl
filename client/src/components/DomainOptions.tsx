import { Button, Grid } from "@mui/material";
import { Link } from "react-router-dom";

const DomainOptions: React.FC<{
  serverId: string;
  webServerId: string;
  domainId: string;
}> = ({
  serverId,
  webServerId,
  domainId,
}: {
  serverId: string;
  webServerId: string;
  domainId: string;
}) => {
  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${domainId}/csr`}
          sx={{ color: "white" }}
        >
          Request a CSR
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${domainId}/downloadCsr`}
          sx={{ color: "white" }}
        >
          Show CSR
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${domainId}/installCertificate`}
          sx={{ color: "white" }}
        >
          Install a Certificate
        </Button>
      </Grid>
    </Grid>
  );
};

export default DomainOptions;

/*

<MenuItem
  onClick={handleClose}
  disableRipple
  component={Link}
  to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/certificates`}
>
  Certificates
</MenuItem>
<MenuItem
  onClick={handleClose}
  component={Link}
  to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/csr`}
>
  Generate CSR
</MenuItem>
<MenuItem
  onClick={handleClose}
  component={Link}
  to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/downloadCsr`}
>
  Show CSR
</MenuItem>
<MenuItem
  onClick={handleClose}
  component={Link}
  to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/installCertificate`}
>
  Install a certificate
</MenuItem>

*/
