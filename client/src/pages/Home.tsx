import { Button, Grid, Paper } from "@mui/material";

const Home = () => {
  return (
    <Grid container spacing={2} direction={"row"}>
      <Grid item xs={12}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item>
            <h1>Welcome to AutoSSL :D</h1>
          </Grid>
        </Grid>
      </Grid>
      <Grid item sm={12}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} sm={10} component={Paper} padding={3} margin={1}>
            <p>
              In this page you're supposed to be able to manage, install and
              change TLS certificates, good luck :) <br />
              <br />
              To work with the application you must deploy the agent in the
              server you wish to manage, the install intructions and source code
              can be found here.
            </p>
          </Grid>
          <Grid container item xs={12} sm={10} margin={1} padding={3}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                href="https://gitlab.com/HP-SCDS/Observatorio/2023-2024/autossl/usal-za-autossl"
              >
                Download
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;
