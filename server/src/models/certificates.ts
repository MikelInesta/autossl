import { Schema, model, Types } from "mongoose";

interface ICertificate extends Document {
  _id: Types.ObjectId;
  directory_path: string;
  subject: {
    common_name: string;
    organization: string;
    organizational_unit: string;
  };
  issuer: {
    common_name: string;
    organization: string;
    organizational_unit: string;
  };
  validity: {
    not_before: Date;
    not_after: Date;
  };
  public_key: {
    algorithm: string;
    size: number;
    key: string;
  };
  signature_algorithm: string;
  serial_number: string;
}

const schema = new Schema<ICertificate>({
  directory_path: {
    type: "string",
    required: true,
  },
  subject: {
    common_name: {
      type: "string",
      max: 50,
    },
    organization: {
      type: "string",
      max: 50,
    },
    organizational_unit: {
      type: "string",
      max: 50,
    },
  },
  issuer: {
    common_name: {
      type: "string",
      max: 50,
    },
    organization: {
      type: "string",
      max: 50,
    },
    organizational_unit: {
      type: "string",
      max: 50,
    },
  },
  validity: {
    not_before: {
      type: "date",
    },
    not_after: {
      type: "date",
    },
  },
  public_key: {
    algorithm: {
      type: "string",

      max: 50,
    },
    size: {
      type: "number",
    },
    key: {
      type: "string",
    },
  },
  signature_algorithm: {
    type: "string",
    max: 50,
  },
  serial_number: {
    type: "string",
    max: 100,
  },
});

const Certificate = model<ICertificate>("Certificate", schema);

export { Certificate, ICertificate };
