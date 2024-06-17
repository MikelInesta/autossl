import ServerTable from "../components/ServerTable";
import { Breadcrumbs, Grid, Link, Paper, Typography } from "@mui/material";

const Servers = () => {
  return (
    <>
      <Grid item xs={12} margin={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography color="text.primary">Servers</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid
        xs={12}
        item
        container
        alignItems={"center"}
        justifyItems={"center"}
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Grid item container xs={12} justifyContent={"center"}>
          <Grid item sm={2}>
            <h1>Servers</h1>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={10} component={Paper} elevation={3} margin={1}>
          <ServerTable />
        </Grid>
      </Grid>
    </>
  );
};

export default Servers;
