import { Box } from "@mui/material";
import { IVirtualHost } from "../types/models";

const DomainInfo = ({ virtualHost }: { virtualHost: IVirtualHost | null }) => {
  return (
    <Box>
      {virtualHost != null && (
        <>
          <h1>Domain {virtualHost._id}</h1>
          <p>
            <strong>Domain names: </strong>
            {virtualHost.domain_names}
            <br />
            <strong>IP Addresses: </strong>
            {virtualHost.vh_ips.map((ip, i) => {
              return i < virtualHost.vh_ips.length - 1 ? `${ip}, ` : ip;
            })}
            <br />
            <strong>Certificate Path: </strong>
            {virtualHost.certificate_path}
            <br />
            <strong>Private Key Path: </strong>
            {virtualHost.certificate_key_path}
            <br />
            <strong>Nginx Configuration File: </strong>
            {virtualHost.configuration_file}
            <br />
            <strong>Web Files root address: </strong>
            {virtualHost.root}
            <br />
            <strong>Parent Web Server Id: </strong>
            {virtualHost.web_server_id}
            <br />
          </p>
        </>
      )}
    </Box>
  );
};

export default DomainInfo;
