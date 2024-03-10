import React, { useState, useEffect } from "react";
import VirtualHostList from "./VirtualHostList";

interface WebServer {
  _id: string;
  web_server_name: string;
  configuration_path: string;
}

interface WebServerListProps {
  serverId: string;
}

const WebServerList: React.FC<WebServerListProps> = ({ serverId }) => {
  const [webServers, setWebServers] = useState<WebServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      `https://autossl.mikelinesta.com/api/web-servers/serverid/${serverId}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend returned an error");
        }
        return response.json();
      })
      .then((data) => {
        setWebServers(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching web servers:", error);
        setError("Failed to fetch web servers");
        setIsLoading(false);
      });
  }, [serverId]); // Dependency

  if (isLoading) return <div>Loading web servers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="border">
      <ul>
        {webServers.map((webServer) => (
          <li key={webServer._id}>
            Name: {webServer.web_server_name}
            <ul>
              <li>Configuration Path: {webServer.configuration_path}</li>
              <li>
                Virtual Hosts/Server Blocks:
                <VirtualHostList webServerId={webServer._id} />
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WebServerList;
