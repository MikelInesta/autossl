import { Schema, model, Types } from "mongoose";

interface IAgent {
  _id: Types.ObjectId;
  server_ip: string;
}

const schema = new Schema<IAgent>({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true,
  },
  server_ip: {
    type: String,
  },
});

const Agent = model<IAgent>("Agent", schema);

export { Agent, IAgent };
