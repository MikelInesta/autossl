import { Link, Outlet } from "react-router-dom";
//import BasicMenu from "../components/BasicMenu";
import IMAGES from "../images/Images";
import { Button, Paper } from "@mui/material";

const Layout = () => {
  return (
    <>
      <Paper
        elevation={10}
        square={true}
        sx={{
          width: "90%",
          marginLeft: "5%",
          marginRight: "5%",
          padding: 3,
          marginBottom: 3,
        }}
      >
        <nav>
          <div
            style={{
              display: "flex",
              marginLeft: "10%",
              marginRight: "10%",
            }}
          >
            <Link to="/">
              <img
                src={IMAGES.autosslLogo}
                alt="AutoSSL"
                style={{ width: 200, height: "auto", borderRadius: 1 }}
              />
            </Link>
            <Button
              variant="contained"
              sx={{
                marginTop: "20px",
                marginBottom: "20px",
                marginLeft: "auto",
                backgroundColor: "#009933",
                "&:hover": {
                  backgroundColor: "#006600",
                },
              }}
              component={Link}
              to="/servers"
            >
              Servers
            </Button>
          </div>
        </nav>
      </Paper>
      <Paper
        elevation={3}
        square={true}
        sx={{ width: "90%", marginLeft: "5%", marginRight: "5%", padding: 3 }}
      >
        <Outlet />
      </Paper>
    </>
  );
};

export default Layout;
