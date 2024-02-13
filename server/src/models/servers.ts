import { Types, Schema, model } from "mongoose";
import { WebServer, IWebServer } from "./web_servers";

// Server DocType (for typescript)
interface IServer {
  server_name: string;
  server_ip: string;
  operating_system: string;
  web_servers?: Types.DocumentArray<IWebServer>;
}

const schema = new Schema<IServer>({
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
    max: 50,
  },
  web_servers: {
    type: "array",
    items: {
      type: Types.ObjectId,
      ref: WebServer,
    },
  },
});

const Server = model<IServer>("Server", schema);
export { Server, IServer };
