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
      <Grid container direction="row" justifyContent={"center"}>
        <Grid item xs={12} sm={12} md={10} lg={8}>
          <ResponsiveAppBar />
        </Grid>
        <Grid
          item
          component={Paper}
          elevation={3}
          square={true}
          xs={12}
          sm={12}
          md={10}
          lg={8}
          sx={{
            ":hover": {
              boxShadow: 10,
            },
            height: "100%",
          }}
          paddingBottom={20}
        >
          <Outlet />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Layout;
