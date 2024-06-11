import { Schema, model, Types } from "mongoose";
import { Certificate } from "./certificates";

interface IVirtualHost {
  _id: Types.ObjectId;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: Types.ObjectId;
  certificate_id: Types.ObjectId;
  csr: string;
  certificate_path: string;
  certificate_key_path: string;
  root: string;
  configuration_file: string;
  csr_request_status?: string;
  certificate_install_status?: string;
  rollback_status?: string;
}

const schema = new Schema<IVirtualHost>({
  vh_ips: [],
  domain_names: { type: String },
  enabled: {
    type: "boolean",
    required: true,
  },
  web_server_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "web_servers",
  },
  certificate_id: {
    type: Schema.Types.ObjectId,
    ref: Certificate,
  },
  csr: { type: "string" },
  certificate_path: { type: "string" },
  certificate_key_path: { type: "string" },
  root: { type: "string" },
  configuration_file: { type: "string" },
  csr_request_status: { type: "string" },
  certificate_install_status: { type: "string" },
  rollback_status: { type: "string" },
});

const VirtualHost = model<IVirtualHost>("VirtualHost", schema);

export { VirtualHost, IVirtualHost };
