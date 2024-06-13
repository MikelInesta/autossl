import { Box } from "@mui/material";
import { IDomain } from "../types/models";

const DomainInfo = ({ domain }: { domain: IDomain | null }) => {
  return (
    <Box>
      {domain != null && (
        <>
          <h1>{domain.domain_names}</h1>
          <p>
            <strong>Domain ID: </strong>
            {domain._id}
            <br />
            <strong>Parent Web Server ID: </strong>
            {domain.web_server_id}
            <br />
            <strong>Certificate IDs: </strong>
            {domain.certificate_ids.map((id, i) => {
              return i < domain.certificate_ids.length - 1 ? `${id}, ` : id;
            })}
            <br />
            <strong>Virtual Host IDs: </strong>
            {domain.virtual_host_ids.map((id, i) => {
              return i < domain.virtual_host_ids.length - 1 ? `${id}, ` : id;
            })}
            <br />
          </p>
        </>
      )}
    </Box>
  );
};

export default DomainInfo;
