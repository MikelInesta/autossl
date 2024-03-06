import { Schema, model, Types } from "mongoose";

interface IWebServer {
  _id: Types.ObjectId;
  web_server_name: string;
  configuration_path: string;
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
});

const WebServer = model<IWebServer>("WebServer", schema);
export { WebServer, IWebServer };
