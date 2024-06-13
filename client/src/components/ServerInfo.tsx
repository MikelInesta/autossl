import { Box } from "@mui/material";
import { IServer } from "../types/models";

const ServerInfo = ({ server }: { server: IServer | null }) => {
  return (
    <Box>
      {server != null && (
        <>
          <h1>Server {server._id}</h1>
          <p>
            <strong>Name: </strong>
            {server.server_name}
            <br />
            <strong>IP Address: </strong>
            {server.server_ip}
            <br />
            <strong>Operating System: </strong>
            {server.operating_system}
            <br />
            <strong>Agent ID: </strong>
            {server.agent_id}
            <br />
          </p>
        </>
      )}
    </Box>
  );
};

export default ServerInfo;
