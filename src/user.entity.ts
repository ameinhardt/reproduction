import { defineEntity, p } from "@mikro-orm/core";
import { Device } from "./device.entity.ts";

export const UserSchema = defineEntity({
  name: 'User',
  properties: {
    id: p.integer().primary(),
    devices: () => p.manyToMany(Device).strictNullable().mappedBy('users') //.hidden(),
  }
});
export class User extends UserSchema.class {}
UserSchema.setClass(User);
