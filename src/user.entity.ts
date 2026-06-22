import { defineEntity, p } from '@mikro-orm/core';

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
  tableName: 'user'
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);

// ────────────────────────────────────────────────────────────────────────────

const NormalUserSchema = defineEntity({
  discriminatorValue: 'normal',
  extends: UserSchema,
  name: 'NormalUser',
  properties: {}
});

export class NormalUser extends NormalUserSchema.class {}
NormalUserSchema.setClass(NormalUser);

// ────────────────────────────────────────────────────────────────────────────

const HeavyUserSchema = defineEntity({
  discriminatorValue: 'heavy',
  extends: User,
  name: 'HeavyUser',
  properties: {
    age: p.integer()
  }
});

export class HeavyUser extends HeavyUserSchema.class {}
HeavyUserSchema.setClass(HeavyUser);

// ────────────────────────────────────────────────────────────────────────────

const CasualUserSchema = defineEntity({
  discriminatorValue: 'casual',
  extends: User,
  name: 'CasualUser',
  properties: {
    age: p.integer()
  }
});

export class CasualUser extends CasualUserSchema.class {}
CasualUserSchema.setClass(CasualUser);
