import { Schema, model, Types } from "mongoose";

interface ICertificate extends Document {
  _id: Types.ObjectId;
  ca_chain_path: string;
  is_old: boolean;
}

const schema = new Schema<ICertificate>({
  ca_chain_path: {
    type: "string",
    required: true,
  },
  is_old: {
    type: "boolean",
    required: true,
    default: false,
  },
});

/*
interface ICertificate extends Document {
  ca_name: string;
  ca_signature: string;
  issue_date: Date;
  expiration_date: Date;
  public_key: string;
  version: string;
}

const schema = new Schema<ICertificate>({
  ca_name: {
    type: "string",
    required: true,
    max: 50,
  },
  ca_signature: {
    type: "string",
    required: true,
  },
  issue_date: {
    type: "date",
    required: true,
  },
  expiration_date: {
    type: "date",
    required: true,
  },
  public_key: {
    type: "string",
    required: true,
  },
  version: {
    type: "string",
    required: true,
    max: 10,
  },
});

*/

const Certificate = model<ICertificate>("Certificate", schema);

export { Certificate, ICertificate };
