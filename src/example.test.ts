// import { defineEntity, p, NodeSqliteDialect, SqlEntityManager, SqliteDriver, MikroORM, wrap } from '@mikro-orm/sql';
import { MikroORM } from '@mikro-orm/core';
import { CasualUser, HeavyUser, User } from './user.entity.ts';
import config from './mikro-orm.config.ts'

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init(config);
  await orm.schema.refresh();
  orm.em.create(User, {
    id: 1,
    type: 'user'
  });
  orm.em.create(HeavyUser, {
    id: 2,
    type: 'heavy'
  });
  orm.em.create(CasualUser, {
    id: 3,
    type: 'casual'
  });
  orm.em.flush();
});

afterAll(async () => {
  await orm.close();
});

let id = 0;

test(`user exists`, async () => {
  const em = orm.em.fork(),
    user = await em.findAndCount(User, {}),
    casual = await em.findAndCount(CasualUser, {}),
    heavy = await em.findAndCount(HeavyUser, {});
  assert(user[1] === 1);
  assert(casual[1] === 1);
  assert(heavy[1] === 1);
});

test(`can be deleted`, async () => {
  const em = orm.em.fork(),
    casual = await em.findOne(CasualUser, { id: 3 });
  assert(casual != null);
  assert(casual.type === 'casual');
  // wrongly uses: delete from `user` where `id` in (3) and `type` = 'user' 
  em.remove(casual);
  await em.flush();
  const deadBody = await em.findOne(CasualUser, { id: 3 });
  assert(casual == null);
});