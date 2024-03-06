import { Schema, model, Types } from "mongoose";
import { IServer, Server } from "./servers";

interface IUser {
  _id: Types.ObjectId;
  user_name: string;
  email: string;
  password: string;
  servers?: Types.DocumentArray<IServer>;
}

const schema = new Schema<IUser>({
  user_name: {
    type: "string",
    required: true,
    max: 50,
  },
  email: {
    type: "string",
    required: true,
    max: 254,
    unique: true,
  },
  password: {
    type: "string",
    required: true,
    max: 43,
  },
  servers: {
    type: "array",
    items: {
      type: Schema.Types.ObjectId,
      ref: Server,
    },
  },
});

const User = model<IUser>("User", schema);

export { User, IUser };
