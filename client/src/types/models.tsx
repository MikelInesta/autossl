interface IWebServer {
  _id: string;
  web_server_name: string;
  configuration_path: string;
  server_id: string;
}

interface IServer {
  _id: string;
  server_name: string;
  server_ip: string;
  operating_system: string;
  agent_id: string;
}

interface IVirtualHost {
  _id: string;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: string;
  certificate_id: string;
  csr: string;
  certificate_path: string;
  certificate_key_path: string;
  root: string;
  configuration_file: string;
  csr_request_status?: string;
  certificate_install_status?: string;
  rollback_status?: string;
}

interface IDomain {
  _id: string;
  web_server_id: string;
  domain_names: string;
  certificate_ids: Array<string>;
  virtual_host_ids: Array<string>;
}

export type { IWebServer, IServer, IVirtualHost, IDomain };
