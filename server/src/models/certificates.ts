import { Schema, model } from "mongoose";

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

const Certificate = model<ICertificate>("Certificate", schema);

export { Certificate, ICertificate };
