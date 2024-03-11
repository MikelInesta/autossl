import { Schema, model, Types } from "mongoose";

interface IWebServer {
  _id: Types.ObjectId;
  web_server_name: string;
  configuration_path: string;
  server_id: Types.ObjectId;
}

const schema = new Schema<IWebServer>({
  web_server_name: {
    type: "string",
    required: true,
    max: 256,
  },
  configuration_path: {
    type: "string",
    required: true,
    max: 1024,
  },
  server_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

const WebServer = model<IWebServer>("WebServer", schema);
export { WebServer, IWebServer };
