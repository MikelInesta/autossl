import * as React from "react";
import Box from "@mui/material/Box";
import { useParams } from "react-router-dom";

const WebServers: React.FC = () => {
  const { serverId } = useParams();

  React.useEffect(() => {}, [serverId]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <h1>WebServers</h1>
        <h2>Server ID: {serverId}</h2>
      </Box>
    </>
  );
};

export default WebServers;
