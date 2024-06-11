import { Schema, model, Types } from "mongoose";
import { Certificate } from "./certificates";

interface IDomain {
  _id: Types.ObjectId;
  domain_names: string;
  certificate_ids: Array<string>;
  virtual_host_ids: Array<string>;
}

const schema = new Schema<IDomain>({
  domain_names: { type: String },
  certificate_ids: [],
  virtual_host_ids: [],
});

const Domain = model<IDomain>("Domain", schema);

export { Domain, IDomain };
