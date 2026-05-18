import { defineEntity, p } from "@mikro-orm/core";
import { HeavyUser, CasualUser, NormalUser } from "./user.entity.ts";

export const DeviceSchema = defineEntity({
  name: 'Engagement',
  properties: {
    id: p.integer().primary(),
    heavyUsers: () => p.manyToMany(CasualUser).strictNullable(),
    normalUsers: () => p.manyToMany(NormalUser).inversedBy('devices')
  }
});
export class Device extends DeviceSchema.class {}
DeviceSchema.setClass(Device);