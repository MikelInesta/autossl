import { Types, Schema, model } from "mongoose";
import { WebServer, IWebServer } from "./web_servers";
import { Agent } from "./agents";

// Server DocType (for typescript)
interface IServer {
  _id: Types.ObjectId;
  server_name: string;
  server_ip: string;
  operating_system: string;
  agent_id: Types.ObjectId;
}

const schema = new Schema<IServer>({
  _id: Types.ObjectId,
  server_name: {
    type: "string",
    required: true,
    max: 50,
  },
  server_ip: {
    type: "string",
    required: true,
    max: 45,
  },
  operating_system: {
    type: "string",
    required: true,
    max: 80,
  },
  agent_id: {
    type: Schema.Types.ObjectId,
    ref: Agent,
  },
});

const Server = model<IServer>("Server", schema);
export { Server, IServer };
