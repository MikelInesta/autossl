import { Grid } from "@mui/material";
import { IDomain } from "../types/models";

const DomainStatus = ({ domain }: { domain: IDomain | null }) => {
  return (
    <>
      {domain != null && (
        <Grid container spacing={2} direction={"column"}>
          Pending status implementation for domain...
          {/*
          <Grid item>{virtualHost.csr_request_status}</Grid>
          <Grid item>{virtualHost.certificate_install_status}</Grid>
          <Grid item>{virtualHost.rollback_status}</Grid>
          */}
        </Grid>
      )}
    </>
  );
};

export default DomainStatus;
