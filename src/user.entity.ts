import { defineEntity, p } from '@mikro-orm/core';
import { Device } from './device.entity.ts';

export const UserTypes = ['heavy', 'casual', 'normal'] as const;

const UserSchema = defineEntity({
  abstract: true,
  discriminatorColumn: 'type',
  name: 'Entity',
  properties: {
    id: p.uuid().primary().onCreate(() => crypto.randomUUID()),
    name: p.string(),
    type: p.enum(UserTypes).hidden()
  },
  tableName: 'entities'
});

export class Entity extends UserSchema.class {}
UserSchema.setClass(Entity);

// ────────────────────────────────────────────────────────────────────────────

const HeavyUserSchema = defineEntity({
  discriminatorValue: 'heavy',
  extends: UserSchema,
  name: 'HeavyUser',
  properties: {
    devices: () => p.manyToMany(Device).mappedBy('heavyUsers')
  }
});

export class HeavyUser extends HeavyUserSchema.class {}
HeavyUserSchema.setClass(HeavyUser);

// ────────────────────────────────────────────────────────────────────────────

const CasualUserSchema = defineEntity({
  discriminatorValue: 'casual',
  extends: UserSchema,
  name: 'CasualUser',
  properties: {}
});

export class CasualUser extends CasualUserSchema.class {}
CasualUserSchema.setClass(CasualUser);

// ────────────────────────────────────────────────────────────────────────────

const NormalUserSchema = defineEntity({
  discriminatorValue: 'normal',
  extends: UserSchema,
  name: 'NormalUser',
  properties: {
    devices: () => p.manyToMany(Device).mappedBy('normalUsers')
  }
});

export class NormalUser extends NormalUserSchema.class {}
NormalUserSchema.setClass(NormalUser);
