import { Types, Schema, model } from "mongoose";
import { WebServer, IWebServer } from "./web_servers";

// Server DocType (for typescript)
interface IServer {
  _id: Types.ObjectId;
  server_name: string;
  server_ip: string;
  operating_system: string;
  old: boolean;
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
    unique: true,
  },
  operating_system: {
    type: "string",
    required: true,
    max: 80,
  },
  old: { type: Boolean, default: false },
});

const Server = model<IServer>("Server", schema);
export { Server, IServer };
