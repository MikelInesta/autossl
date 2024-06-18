import { Button, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

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
  const [hasCsr, setHasCsr] = useState<boolean>(false);

  useEffect(() => {
    const fetchHasCsr = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/domains/has-csr/${domainId}`
      );
      if (response.status == 200) {
        setHasCsr(true);
      }
    };

    fetchHasCsr();
  });

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
      {hasCsr && (
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
      )}
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
