import 'reflect-metadata';
import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { defineEntity, IType, MikroORM, p, wrap } from '@mikro-orm/sqlite';

const UserSchema = defineEntity({
  name: 'User1',
  properties: {
    createdAt: p.datetime()
      .onCreate(() => new Date())
      .$type<Date, number, string>()
      .serializer((v) => v.toISOString()),
    id: p.integer().primary()
  }
});

class User1 extends UserSchema.class {}
UserSchema.setClass(User1);

@Entity()
class User2 {

  @PrimaryKey()
  id!: number;

  @Property({
    serializer: (v: Date) => v.toISOString(),
    onCreate: () => new Date()
  })
  createdAt!: IType<Date, number, string>;
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [User1, User2],
    metadataProvider: ReflectMetadataProvider,
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refresh();
});

afterAll(async () => {
  await orm.close(true);
});

let id = 0;
Object.entries({ User1, User2 }).map((([name, User]) => {
  test(`${name}: Scalar Date is a Date`, async () => {
    const createdAt = new Date();
    orm.em.create(User, { id: ++id, createdAt });
    await orm.em.flush();
    orm.em.clear();

    const user = await orm.em.findOneOrFail(User, { id });
    // Runtime type in sqlite should be Date
    expectTypeOf(user.createdAt).toExtend<Date>();
    assert(user.createdAt instanceof Date);
  });

  test(`${name}: explicit serialization with IType has expected type`, async () => {
    const createdAt = new Date();
    orm.em.create(User, { id: ++id, createdAt });
    await orm.em.flush();
    orm.em.clear();

    const user = await orm.em.findOneOrFail(User, { id });

    // Serialized type should be string
    expectTypeOf(wrap(user).toObject().createdAt).toEqualTypeOf<string>();
    assert(typeof wrap(user).toObject().createdAt === 'string');
  });
}));
