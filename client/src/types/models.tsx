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

interface ICertificate extends Document {
  _id: string;
  subject: {
    common_name: string;
    organization: string;
    organizational_unit: string;
    country: string;
    state: string;
    locality: string;
  };
  issuer: {
    common_name: string;
    organization: string;
    organizational_unit: string;
    country: string;
    state: string;
    locality: string;
  };
  has_expired: boolean;
  not_after: Date;
  not_before: Date;
  serial_number: string;
  serial_number_hex: string;
  signature_algorithm: string;
  version: number;
  public_key_length: number;
  server_block: string;
  csr_used: string;
}

export type { IWebServer, IServer, IVirtualHost, IDomain, ICertificate };
