import { EntityKey, MikroORM, Options } from '@mikro-orm/core';
import { CasualUser, NormalUser } from './user.entity.ts';
import { sqlConfig, mongoConfig } from './mikro-orm.config.ts'

let orm: MikroORM;

Object.entries({
  // sql: sqlConfig,
  mongo: mongoConfig
}).forEach(([name, config]) => {
  describe(name, () => {
    beforeAll(async () => {
      orm = await MikroORM.init(config as Partial<Options>);
      await orm.schema.refresh();
    });

    afterAll(async () => {
      await orm.close();
    });

     test(`${name}: can be deleted when in one em`, async () => {
      const em = orm.em.fork();
      
      const { id } = em.create(CasualUser, {
        name: 'Casual User',
        type: 'casual'
      });
      em.flush();
      
      const user = await em.findOne(CasualUser, { id });
      assert(user != null);
      em.remove(user);
      await em.flush();
    });

    test(`${name}: can be deleted when in two em`, async () => {
      const em1 = orm.em.fork();
      
      const { id } = em1.create(CasualUser, {
        name: 'Casual User',
        type: 'casual'
      });
      em1.flush();
      
      const em2 = orm.em.fork();
      const user = await em2.findOne(CasualUser, { id });
      assert(user != null);
      em2.remove(user);
      await em2.flush();
    });
  });
});