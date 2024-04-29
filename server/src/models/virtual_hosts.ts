import { Schema, model, Types } from "mongoose";
import { Certificate, ICertificate } from "./certificates";

interface IVirtualHost {
  _id: Types.ObjectId;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: Types.ObjectId;
  certificate_id: Types.ObjectId;
  old: boolean;
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
  old: { type: Boolean, default: false },
});

const VirtualHost = model<IVirtualHost>("VirtualHost", schema);

export { VirtualHost, IVirtualHost };
