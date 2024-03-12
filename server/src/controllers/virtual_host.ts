import { Types } from "mongoose";
import { IVirtualHost, VirtualHost } from "../models/virtual_hosts";

const setOldVirtualHosts = async (
  updatedVirtualHostsIds: Types.ObjectId[]
): Promise<Boolean> => {
  try {
    const oldVirtualHosts = await VirtualHost.find({
      _id: { $nin: updatedVirtualHostsIds },
    });
    if (oldVirtualHosts.length === 0) console.log("No old virtual hosts");
    for (const oldVirtualHost of oldVirtualHosts) {
      oldVirtualHost.old = true;
      await oldVirtualHost.save();
    }
    return true;
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

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

export { updateVirtualHost, setOldVirtualHosts };
