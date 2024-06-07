import { Schema, model, Types } from "mongoose";
import { Certificate } from "./certificates";

interface IVirtualHost {
  _id: Types.ObjectId;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: Types.ObjectId;
  certificate_id: Types.ObjectId;
  //old: boolean;
  csr: string;
  certificate_path: string;
  certificate_key_path: string;
  root: string;
  configuration_file: string;
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
  //old: { type: Boolean, default: false },
  csr: { type: "string" },
  certificate_path: { type: "string" },
  certificate_key_path: { type: "string" },
  root: { type: "string" },
  configuration_file: { type: "string" },
});

const VirtualHost = model<IVirtualHost>("VirtualHost", schema);

export { VirtualHost, IVirtualHost };
