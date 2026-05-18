import { EntityKey, MikroORM, Options } from '@mikro-orm/core';
import { CasualUser, NormalUser } from './user.entity.ts';
import { sqlConfig } from './mikro-orm.config.ts'

let orm: MikroORM;

Object.entries({
  sql: sqlConfig
}).forEach(([name, config]) => {
  describe(name, () => {
    beforeAll(async () => {
      orm = await MikroORM.init(config as Partial<Options>);
      await orm.schema.refresh();
    });

    afterAll(async () => {
      await orm.close();
    });

    test(`${name}: can be deleted`, async () => {
      const em = orm.em.fork();
      // Removing the 'heavyUsers' pointer from Device (and counterpart from HeavyUser) lets this test succeed
      // this has 'devices' as expected
      assert(em.getMetadata(NormalUser).bidirectionalRelations.find((prop) => prop.name === 'devices') != null, "NormalUser has a 'devices' bidirectionalRelations");
      // ⚡ unexpectedly, this metadata has 'devices', too:
      assert(em.getMetadata(CasualUser).bidirectionalRelations.find((prop) => prop.name === 'devices' as EntityKey<CasualUser>) == null, "CasualUser does not have 'devices' bidirectionalRelations");
      
      await em.flush();
    });
  });
});