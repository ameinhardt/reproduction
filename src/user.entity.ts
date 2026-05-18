import { defineEntity, p } from "@mikro-orm/core";
import { Device } from "./device.entity.ts";

export const UserTypes = ['casual', 'heavy'] as const;
export type UserType = typeof UserTypes[number];

export const UserSchema = defineEntity({
  discriminatorColumn: 'type',
  abstract: true,
  name: 'User',
  properties: {
    id: p.integer().primary(),
    createdAt: p.datetime()
      .onCreate(() => new Date()),
    type: p.enum(UserTypes).hidden()
  }
});
export class User extends UserSchema.class {}
UserSchema.setClass(User);

const CasualUserSchema = defineEntity({
  discriminatorValue: 'casual',
  extends: UserSchema,
  name: 'CasualUser',
  properties: {}
});

export class CasualUser extends CasualUserSchema.class {}
CasualUserSchema.setClass(CasualUser);

export const HeavyUserSchema = defineEntity({
  discriminatorValue: 'heavy',
  extends: UserSchema,
  name: 'HeavyUser',
  properties: {
    devices: () => p.manyToMany(Device).strictNullable().mappedBy('users') //.hidden(),
  }
});

export class HeavyUser extends HeavyUserSchema.class {}
HeavyUserSchema.setClass(HeavyUser);