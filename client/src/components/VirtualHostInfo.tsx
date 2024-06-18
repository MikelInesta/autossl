import { Box } from "@mui/material";
import { IVirtualHost } from "../types/models";

const VirtualHostInfo = ({
  virtualHost,
}: {
  virtualHost: IVirtualHost | null;
}) => {
  return (
    <Box>
      {virtualHost != null && (
        <>
          <p>
            <strong>VirtualHost ID: </strong>
            {virtualHost._id}
            <br />
            <strong>IP Addresses: </strong>
            {virtualHost.vh_ips.map((ip, i) => {
              return i < virtualHost.vh_ips.length - 1 ? `${ip}, ` : ip;
            })}
            <br />
            <strong>Domain Names: </strong>
            {virtualHost.domain_names}
            <br />
            <strong>Enabled: </strong>
            {(virtualHost.enabled && "Yes") || "False"}
            <br />
            <strong>Web Server ID: </strong>
            {virtualHost.web_server_id}
            <br />
            <strong>Certificate ID: </strong>
            {virtualHost.certificate_id}
            <br />
            <strong>Certificate Path: </strong>
            {virtualHost.certificate_path}
            <br />
            <strong>Certificate Key Path: </strong>
            {virtualHost.certificate_key_path}
            <br />
            <strong>Root: </strong>
            {virtualHost.root}
            <br />
            <strong>Configuration file: </strong>
            {virtualHost.configuration_file}
            <br />
          </p>
        </>
      )}
    </Box>
  );
};

export default VirtualHostInfo;
