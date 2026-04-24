// import { defineEntity, p, NodeSqliteDialect, SqlEntityManager, SqliteDriver, MikroORM, wrap } from '@mikro-orm/sql';
import { Migrator } from '@mikro-orm/migrations-mongodb';
import { MongoDriver, MongoEntityManager, wrap } from '@mikro-orm/mongodb';
import { MikroORM } from '@mikro-orm/mongodb';
import User from './user.entity.ts';
import { CLIHelper, configure } from '@mikro-orm/cli';
import { join } from 'path';

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    clientUrl: process.env.MIKRO_ORM_CLIENT_URL,
    driver: MongoDriver,
    dbName: 'test',
    entityManager: MongoEntityManager,
    //dbName: ':memory:',
    // driver: SqliteDriver,
    // driverOptions: new NodeSqliteDialect(':memory:'),
    // entityManager: SqlEntityManager,
    extensions: [Migrator],
    entities: [User],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  // await orm.schema.refresh();
});

afterAll(async () => {
  // await orm.close(true);
});

let id = 0;

test(`direct migrations works`, async () => {
  await orm.migrator.up();
  assert(true)
});

test(`cli migration doesn't`, async () => {
  //  pnpm exec mikro-orm migration:up --config ./src/mikro-orm.config.ts
  const options = { pool: { min: 1, max: 2 } };
  const cliOrm = await CLIHelper.getORM('default', [join(__dirname, 'mikro-orm.config.ts')], options);
  await cliOrm.migrator.up();
  assert(true)
});