import { Box } from "@mui/material";
import { IWebServer } from "../types/models";

const WebServerInfo = ({ webServer }: { webServer: IWebServer | null }) => {
  return (
    <Box>
      {webServer != null && (
        <>
          <h1>{webServer.web_server_name}</h1>
          <p>
            <strong>Web Server ID: </strong>
            {webServer._id}
            <br />
            <strong>Configuration Path: </strong>
            {webServer.configuration_path}
            <br />
            <strong>Parent Server ID: </strong>
            {webServer.server_id}
            <br />
          </p>
        </>
      )}
    </Box>
  );
};

export default WebServerInfo;
