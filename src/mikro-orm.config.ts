import { Migrator } from "@mikro-orm/migrations-mongodb";
import { defineConfig, MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import User from "./user.entity.ts";
import { UsersV1 } from './migrations/v1.ts'

export default defineConfig({
  clientUrl: process.env.MIKRO_ORM_CLIENT_URL,
  driver: MongoDriver,
  dbName: 'test',
  entityManager: MongoEntityManager,
  debug: ['query', 'query-params'],
  //dbName: ':memory:',
  // driver: SqliteDriver,
  // driverOptions: new NodeSqliteDialect(':memory:'),
  // entityManager: SqlEntityManager,
  extensions: [Migrator],
  migrations: {
      migrationsList: [
        UsersV1
      ],
      snapshotName: 'mikro-orm.snapshot',
      tableName: 'orm_migrations'
    },
  entities: [User],
  allowGlobalContext: true, // only for testing
});