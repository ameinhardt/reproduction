// import { defineEntity, p, NodeSqliteDialect, SqlEntityManager, SqliteDriver, MikroORM, wrap } from '@mikro-orm/sql';
import { MikroORM, Options, wrap } from '@mikro-orm/core';
import { CasualUser, HeavyUser, User } from './user.entity.ts';
import { sqlConfig, mongoConfig } from './mikro-orm.config.ts'
import { Device } from './device.entity.ts';

let orm: MikroORM;

Object.entries({
  mongo: mongoConfig,
  sql: sqlConfig
}).forEach(([name, config]) => {
  describe(name, () => {
    beforeAll(async () => {
      orm = await MikroORM.init(config as Partial<Options>);
      await orm.schema.refresh();
      const em = orm.em.fork();
      const heavy = em.create(HeavyUser, {
        id: 1,
        type: 'heavy',
      });
      em.create(CasualUser, {
        id: 2,
        type: 'casual'
      });
      em.create(Device, {
        name: 'Monitor',
        users: [heavy]
      });
      em.flush();
    });

    afterAll(async () => {
      await orm.close();
    });

    test(`${name}: user exists`, async () => {
      const em = orm.em.fork(),
        user = await em.findAndCount(User, {}),
        casual = await em.findAndCount(CasualUser, {}),
        heavy = await em.findAndCount(HeavyUser, {});
      assert(user[1] === 2);
      assert(casual[1] === 1);
      assert(heavy[1] === 1);
    });

    test(`${name}: can be deleted`, async () => {
      const em1 = orm.em.fork(),
        entity = await em1.findOne(HeavyUser, { id: { $exists: true } });
      assert(entity != null);
      em1.remove(entity);
      await em1.flush();

      const em2 = orm.em.fork();
      const detail = await em2.findOneOrFail(Device, { name: 'Monitor' }, { populate: ['users:ref'] });
      const remaining = wrap(detail).serialize({ forceObject: true, populate: ['users'] }).users;
      assert.ok(Array.isArray(remaining));
      assert.ok(!remaining.some((item) => item.id === entity.id), `users should not contain the deleted entity`);
      // console.log('length = ' , serialize(confirmation, { forceObject: true, populate: ['devices:ref'] } ))
    });
  });
});