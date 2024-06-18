import { Schema, model, Types } from "mongoose";
import { WebServer } from "./web_servers";
import { Certificate } from "./certificates";
import { VirtualHost } from "./virtual_hosts";

interface IDomain {
  _id: Types.ObjectId;
  web_server_id: Types.ObjectId;
  domain_names: string;
  certificate_ids: Array<string>;
  virtual_host_ids: Array<string>;
  csr_request_status?: string;
  certificate_install_status?: string;
  rollback_status?: string;
}

const schema = new Schema<IDomain>({
  web_server_id: {
    type: Schema.Types.ObjectId,
    ref: WebServer,
  },
  domain_names: { type: String },
  certificate_ids: [{ type: Schema.Types.ObjectId, ref: Certificate }],
  virtual_host_ids: [{ type: Schema.Types.ObjectId, ref: VirtualHost }],
  csr_request_status: { type: "string" },
  certificate_install_status: { type: "string" },
  rollback_status: { type: "string" },
});

const Domain = model<IDomain>("Domain", schema);

export { Domain, IDomain };
