import { User, CasualUser, HeavyUser } from "./user.entity.ts";
import { Device } from "./device.entity.ts";
import { defineConfig as defineSqlConfig, MongoNamingStrategy, NodeSqliteDialect, SqlEntityManager, SqliteDriver } from '@mikro-orm/sqlite';
import { defineConfig as defineMongoConfig } from '@mikro-orm/mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { after } from "node:test";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";

const server = await MongoMemoryServer.create();

after(async () => {
  await server.stop();
});

class MongoIdNamingStrategy extends MongoNamingStrategy {
  propertyToColumnName(propertyName: string): string {
    return propertyName === 'id' ? '_id' : propertyName;
  }
}

const mongoConfig = defineMongoConfig({
    // debug: ['query', 'query-params'],
    clientUrl: server.getUri(),
    dbName: 'test',
    driver: MongoDriver,
    driverOptions: {
      connectTimeoutMS: 120 * 60 * 1000
    },
    entities: [User, CasualUser, HeavyUser, Device ],
    entityManager: MongoEntityManager,
    namingStrategy: MongoIdNamingStrategy,
  }),
  sqlConfig = defineSqlConfig({
    // debug: ['query', 'query-params'],
    dbName: ':memory:',
    driver: SqliteDriver,
    driverOptions: new NodeSqliteDialect(':memory:'),
    entityManager: SqlEntityManager,
    entities: [User, CasualUser, HeavyUser, Device ],
    allowGlobalContext: true, // only for testing
  });



export default sqlConfig;
export { sqlConfig, mongoConfig }