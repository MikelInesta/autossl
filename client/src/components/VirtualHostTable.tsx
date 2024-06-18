import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Box,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import VirtualHostInfo from "./VirtualHostInfo";
import { IVirtualHost } from "../types/models";

const VirtualHostTable: React.FC<{
  serverId: string;
  webServerId: string;
  domainId: string;
}> = ({ webServerId }) => {
  const [virtualHosts, setVirtualHosts] = useState<IVirtualHost[]>([]);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchVirtualHosts = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/virtual-hosts/webserverid/${webServerId}`
        );
        const data = await response.json();
        setVirtualHosts(data);
      } catch (error) {
        console.error("Error fetching virtual hosts:", error);
      }
    };

    fetchVirtualHosts();
  }, [webServerId]);

  const handleClick = (id: string) => {
    setOpen((prevOpen) => ({
      ...prevOpen,
      [id]: !prevOpen[id],
    }));
  };

  return (
    virtualHosts.length > 0 && (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Domain Names</TableCell>
              <TableCell>IP Addresses</TableCell>
              <TableCell>Is Enabled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {virtualHosts.map((virtualHost) => (
              <React.Fragment key={virtualHost._id}>
                <TableRow
                  hover={true}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClick(virtualHost._id)}
                >
                  <TableCell>
                    <IconButton size="small">
                      {open[virtualHost._id] ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {virtualHost.domain_names}
                  </TableCell>
                  <TableCell>
                    <ul>
                      {virtualHost.vh_ips.map((ip) => (
                        <li key={ip}>{ip}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{virtualHost.enabled ? "Yes" : "No"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                  >
                    <Collapse
                      in={open[virtualHost._id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box margin={1}>
                        <VirtualHostInfo virtualHost={virtualHost} />
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );
};

export default VirtualHostTable;
