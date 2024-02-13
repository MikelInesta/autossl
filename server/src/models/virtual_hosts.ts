import { Schema, model, Types } from "mongoose";
import { Certificate, ICertificate } from "./certificates";

interface IVirtualHost {
  vh_ip: string;
  domain_name: string;
  enabled: boolean;
  web_server_id: Types.ObjectId;
  certificate: Types.ObjectId;
}

const schema = new Schema<IVirtualHost>({
  vh_ip: {
    type: "string",
    required: true,
  },
  domain_name: {
    type: "string",
    required: true,
    max: 253,
  },
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
  certificate: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: Certificate,
  },
});

const VirtualHost = model<IVirtualHost>("VirtualHost", schema);

export { VirtualHost, IVirtualHost };
