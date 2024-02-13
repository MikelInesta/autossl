import { Schema, model } from "mongoose";

interface IWebServer {
  configuration_path: string;
  web_server_name: string;
}

const schema = new Schema<IWebServer>({
  configuration_path: {
    type: "string",
    required: true,
    max: 1024,
  },
  web_server_name: {
    type: "string",
    required: true,
    max: 256,
  },
});

const WebServer = model<IWebServer>("WebServer", schema);
export { WebServer, IWebServer };
