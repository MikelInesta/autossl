import { Outlet } from "react-router-dom";
import { Grid, Paper, ThemeProvider, createTheme } from "@mui/material";
import ResponsiveAppBar from "../components/ResponsiveAppBar";

const theme = createTheme({
  palette: {
    primary: {
      main: "#579e49",
      light: "#7cb870",
      dark: "#3c8a2c",
      contrastText: "ffffff",
    },
  },
});

const Layout = () => {
  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Grid container spacing={2} direction={"column"}>
            <Grid item marginBottom={4}>
              {/*<OldNavBar />*/}
              <ResponsiveAppBar />
            </Grid>
            <Grid item>
              <Paper
                elevation={3}
                square={true}
                sx={{
                  ":hover": {
                    boxShadow: 10,
                  },
                }}
              >
                <Outlet />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Layout;
