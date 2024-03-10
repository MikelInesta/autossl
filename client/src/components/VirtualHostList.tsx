import React, { useState, useEffect } from "react";
import CertificateDetail from "./CertificateDetail";

interface VirtualHost {
  _id: string;
  vh_ips: Array<String>;
  domain_names: Array<String>;
  enabled: boolean;
  web_server_id: string;
  certificate_id: string;
}

interface VirtualHostListProps {
  webServerId: string;
}

const VirtualHostList: React.FC<VirtualHostListProps> = ({ webServerId }) => {
  const [virtualHosts, setVirtualHosts] = useState<VirtualHost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      `https://autossl.mikelinesta.com/api/virtual-hosts/webserverid/${webServerId}`,
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
        setVirtualHosts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching virtual hosts:", error);
        setError("Failed to fetch virtual hosts");
        setIsLoading(false);
      });
  }, [webServerId]); // Dependency

  if (isLoading) return <div>Loading web servers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="border">
      <ul>
        {virtualHosts.map((virtualHost) => (
          <li key={virtualHost._id}>
            Domain names: {virtualHost.domain_names.join(", ")}
            <ul>
              <li>IP Addresses: {virtualHost.vh_ips.join(", ")}</li>
              <li>Is Enabled: {virtualHost.enabled ? "Yes" : "No"}</li>
              <li>
                Certificate:
                {virtualHost.certificate_id && (
                  <CertificateDetail
                    certificateId={virtualHost.certificate_id}
                  />
                )}
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VirtualHostList;
