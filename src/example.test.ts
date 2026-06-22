import { MikroORM } from '@mikro-orm/core';
import type { Options } from '@mikro-orm/core';
import { CasualUser, NormalUser } from './user.entity.ts';
import { sqlConfig, mongoConfig } from './mikro-orm.config.ts'

let orm: MikroORM;

Object.entries({
  sql: sqlConfig,
  mongo: mongoConfig
}).forEach(([name, config]) => {
  describe(name, () => {
    beforeAll(async () => {
      orm = await MikroORM.init(config as Partial<Options>);
      await orm.schema.refresh();
      const em = orm.em.fork();

      em.create(CasualUser, {
        id: '1',
        name: 'Casual User',
        age: 20,
        type: 'casual'
      });
      em.create(NormalUser, {
        id: '2',
        name: 'Normal User',
        type: 'normal'
      });
      em.flush();
    });

    afterAll(async () => {
      await orm.close();
    });

     test(`${name}: normal user doesn't have age property`, async () => {
      const em = orm.em.fork();
      
      const user = await em.findOne(NormalUser, { id: '2' });
      assert(user != null && !('age' in user));
    });
  });
});