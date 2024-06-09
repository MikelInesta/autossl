import { Button, Grid } from "@mui/material";
import { Link } from "react-router-dom";

const DomainOptions: React.FC<{
  serverId: string;
  webServerId: string;
  virtualHostId: string;
}> = ({
  serverId,
  webServerId,
  virtualHostId,
}: {
  serverId: string;
  webServerId: string;
  virtualHostId: string;
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
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/csr`}
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
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/downloadCsr`}
          sx={{ color: "white" }}
        >
          Download the CSR
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/certificates`}
          sx={{ color: "white" }}
        >
          Show Certificates
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/installCertificate`}
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
