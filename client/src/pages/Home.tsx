import { Box } from "@mui/system";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Grid } from "@mui/material";

const Home = () => {
  return (
    <Grid container spacing={2} direction={"row"}>
      <Grid item xs={12}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item>
            <h1>Home</h1>
          </Grid>
        </Grid>
      </Grid>
      <Grid item sm={12}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} sm={10}>
            <p>
              Welcome to AutoSSL, you're supposed to be able to manage, install
              and change TLS certificates here, good luck :){" "}
            </p>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Home;
