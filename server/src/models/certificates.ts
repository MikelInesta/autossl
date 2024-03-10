import { Schema, model, Types } from "mongoose";

interface ICertificate extends Document {
  _id: Types.ObjectId;
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
}

const schema = new Schema<ICertificate>({
  subject: {
    common_name: { type: String },
    organization: { type: String },
    organizational_unit: { type: String },
    country: { type: String },
    state: { type: String },
    locality: { type: String },
  },
  issuer: {
    common_name: { type: String },
    organization: { type: String },
    organizational_unit: { type: String },
    country: { type: String },
    state: { type: String },
    locality: { type: String },
  },
  has_expired: { type: Boolean, required: true },
  not_after: { type: Date, required: true },
  not_before: { type: Date, required: true },
  serial_number: { type: String, required: true },
  serial_number_hex: { type: String, required: true },
  signature_algorithm: { type: String, required: true },
  version: { type: Number, required: true },
  public_key_length: { type: Number, required: true },
});

const Certificate = model<ICertificate>("Certificate", schema);

export { Certificate, ICertificate };
