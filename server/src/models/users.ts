import { Schema, model, Types } from "mongoose";
import { Agent } from "./agents";

interface IUser {
  _id: Types.ObjectId;
  user_name: string;
  password: string;
  agent_ids: Array<string>;
}

const schema = new Schema<IUser>({
  user_name: {
    type: "string",
    required: true,
    max: 50,
  },
  password: {
    type: "string",
    required: true,
    max: 43,
  },
  agent_ids: [{ type: Schema.Types.ObjectId, ref: Agent }],
});

const User = model<IUser>("User", schema);

export { User, IUser };
