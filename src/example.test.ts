import 'reflect-metadata';
import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { defineEntity, EntityProperty, IType, MikroORM, p, Platform, Type, wrap } from '@mikro-orm/sqlite';

export const Status = ['new', 'active', 'deleted'] as const;
const ReverseStatus = Object.fromEntries(Object.entries(Status).map(([k, v]) => [v, Number.parseInt(k)]));

class StatusType extends Type<typeof Status[number], number> {
  compareAsType() {
    return 'number';
  }

  convertToDatabaseValue(value: typeof Status[number]) {
    return ReverseStatus[value];
  }

  convertToJSValue(value: number) {
    return Status[value];
  }

  ensureComparable() {
    return false;
  }

  getColumnType(prop: EntityProperty, platform: Platform) {
    return platform.getIntegerTypeDeclarationSQL(prop);
  }
}

const UserSchema = defineEntity({
  name: 'User1',
  properties: {
    createdAt: p.datetime()
      .onCreate(() => new Date())
      .$type<Date, number, string>()
      .serializer((v) => v.toISOString()),
    id: p.integer().primary(),
    status: p.type(StatusType)
      .$type<typeof Status[number], number, typeof Status[number]>()
      .default('new'),
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

test('assign runtime value to custom type', async () => {
  orm.em.create(User1, { id: ++id, createdAt: new Date() });
  await orm.em.flush();
  orm.em.clear();

  const user = await orm.em.findOneOrFail(User1, { id });
  // expected to work like: user.status = 'active';
  wrap(user).assign({ status: 'active' });
  await orm.em.flush();
  assert(true);
});
