import { Schema, model, Types } from "mongoose";
import { Certificate, ICertificate } from "./certificates";

interface IVirtualHost {
  _id: Types.ObjectId;
  vh_ips: Array<String>;
  domain_names: Array<String>;
  enabled: boolean;
  web_server_id: Types.ObjectId;
  certificate_id: Types.ObjectId;
}

const schema = new Schema<IVirtualHost>({
  vh_ips: [],
  domain_names: [],
  enabled: {
    type: "boolean",
    required: true,
  },
  web_server_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "web_servers",
    unique: true,
  },
  certificate_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: Certificate,
  },
});

const VirtualHost = model<IVirtualHost>("VirtualHost", schema);

export { VirtualHost, IVirtualHost };
