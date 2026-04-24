import { defineEntity, p } from "@mikro-orm/core";

const UserSchema = defineEntity({
  name: 'User',
  properties: {
    _id: p.integer().primary(),
    createdAt: p.datetime()
      .onCreate(() => new Date())
  }
});
class User extends UserSchema.class {}
UserSchema.setClass(User);

export default User;