import { Types } from "mongoose";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";

const updateVirtualHost = async (
  virtualHostData: IVirtualHost,
  webServerId: Types.ObjectId,
  certificateId: Types.ObjectId | undefined
): Promise<IVirtualHost> => {
  const virtualHost = await VirtualHost.findOneAndUpdate(
    {
      vh_ips: virtualHostData.vh_ips,
      domain_names: virtualHostData.domain_names,
    },
    {
      enabled: virtualHostData.enabled,
      web_server_id: webServerId,
      certificate_id: certificateId,
    },
    { upsert: true, new: true }
  );
  return virtualHost;
};

export { updateVirtualHost };
