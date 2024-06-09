import { Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import IMAGES from "../images/Images";

const OldNavBar = () => {
  return (
    <Paper
      elevation={3}
      square={true}
      sx={{
        ":hover": {
          boxShadow: 10,
        },
      }}
    >
      <div
        style={{
          display: "flex",
        }}
      >
        <Link to="/">
          <img
            src={IMAGES.autosslLogo}
            alt="AutoSSL"
            style={{ width: 200, height: "auto" }}
          />
        </Link>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#009933",
            "&:hover": {
              backgroundColor: "#006600",
            },
          }}
          component={Link}
          to="/servers"
          size="medium"
        >
          My Servers
        </Button>
      </div>
    </Paper>
  );
};

export default OldNavBar;
