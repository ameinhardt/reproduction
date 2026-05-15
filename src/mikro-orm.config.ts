import { User, CasualUser, HeavyUser } from "./user.entity.ts";
import { defineConfig, NodeSqliteDialect, SqlEntityManager, SqliteDriver } from '@mikro-orm/sqlite';

export default defineConfig({
  clientUrl: process.env.MIKRO_ORM_CLIENT_URL,
  debug: ['query', 'query-params'],
  dbName: ':memory:',
  driver: SqliteDriver,
  driverOptions: new NodeSqliteDialect(':memory:'),
  entityManager: SqlEntityManager,
  entities: [User, CasualUser, HeavyUser ],
  allowGlobalContext: true, // only for testing
});