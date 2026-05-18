import { defineEntity, p } from "@mikro-orm/core";
import { User } from "./user.entity.ts";

export const DeviceSchema = defineEntity({
  name: 'Device',
  properties: {
    id: p.integer().primary(),
    name: p.string(),
    users: () => p.manyToMany(User).groups('device').inversedBy('devices'),
  }
});
export class Device extends DeviceSchema.class {}
DeviceSchema.setClass(Device);