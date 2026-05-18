// import { defineEntity, p, NodeSqliteDialect, SqlEntityManager, SqliteDriver, MikroORM, wrap } from '@mikro-orm/sql';
import { MikroORM, Options, wrap } from '@mikro-orm/core';
import { User } from './user.entity.ts';
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
      const user = em.create(User, {
        id: 1
      });
      em.create(Device, {
        name: 'Monitor',
        users: [user]
      });
      em.flush();
    });

    afterAll(async () => {
      await orm.close();
    });

    test(`${name}: can be deleted`, async () => {
      const em = orm.em.fork(),
        user = await em.findOne(User, { id: { $exists: true } });
      assert(user != null);
      em.remove(user);
      await em.flush();
      // there should not be left overs in device for this user
      const device = await em.findOneOrFail(Device, { name: 'Monitor' }, { populate: ['users:ref'] });
      const remaining = wrap(device).serialize({ forceObject: true, populate: ['users'] }).users;
      assert.ok(Array.isArray(remaining));
      assert.ok(!remaining.some((item) => item.id === user.id), `users should not contain the deleted entity`);
      // console.log('length = ' , serialize(confirmation, { forceObject: true, populate: ['devices:ref'] } ))
    });
  });
});