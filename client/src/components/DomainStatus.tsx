import { Box, Card, Grid, Paper } from "@mui/material";
import { IVirtualHost } from "../types/models";

const DomainStatus = ({
  virtualHost,
}: {
  virtualHost: IVirtualHost | null;
}) => {
  return (
    <>
      {virtualHost != null && (
        <Grid container spacing={2} direction={"column"}>
          <Grid item>{virtualHost.csr_request_status}</Grid>
          <Grid item>{virtualHost.certificate_install_status}</Grid>
          <Grid item>{virtualHost.rollback_status}</Grid>
        </Grid>
      )}
    </>
  );
};

export default DomainStatus;
