import React, { useState, useEffect } from "react";
import WebServerList from "./WebServerList";

interface Server {
  _id: string;
  server_name: string;
  server_ip: string;
  operating_system: string;
  web_servers?: string[];
}

const ServerList: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://autossl.mikelinesta.com/api/servers", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend returned an error");
        }
        return response.json();
      })
      .then((data) => {
        setServers(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching servers:", error);
        setError("Failed to fetch servers");
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="border">
      <ul>
        {servers.map((server) => (
          <li key={server._id}>
            Name: {server.server_name}
            <ul>
              <li>IP Address: {server.server_ip}</li>
              <li>Operating System: {server.operating_system}</li>
              <li>
                Web Servers: <WebServerList serverId={server._id} />
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServerList;
