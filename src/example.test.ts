import 'reflect-metadata';
import { Entity, PrimaryKey, Property, ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { IType, MikroORM, wrap } from '@mikro-orm/sqlite';

@Entity()
class User1 {

  @PrimaryKey()
  id!: number;

  @Property({ serializer: (v: string) => new Date(parseInt(v)).toISOString() })
  createdAt: IType<Date, number, string>;

  constructor(createdAt: Date) {
    this.createdAt = createdAt;
  }
}
@Entity()
class User2 {

  @PrimaryKey()
  id!: number;

  // @Property({ serializer: (v: Date) => v.toISOString() })
  @Property({ serializer: (v: string) => new Date(parseInt(v)).toISOString() })
  createdAt: IType<Date, number, string>;

  constructor(createdAt: Date) {
    this.createdAt = createdAt;
  }
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

test('Scalar Date is a Date', async () => {
  const createdAt = new Date();
  orm.em.create(User1, { createdAt });
  await orm.em.flush();
  orm.em.clear();

  const user = await orm.em.findOneOrFail(User1, { createdAt });
  // Runtime type in sqlite is string, not Date
  expectTypeOf(wrap(user).toObject().createdAt).toEqualTypeOf<Date>();
  assert(user.createdAt instanceof Date);
});

test('explicit serialization with IType has expected type', async () => {
  const createdAt = new Date();
  orm.em.create(User2, { createdAt });
  await orm.em.flush();
  orm.em.clear();

  const user = await orm.em.findOneOrFail(User2, { createdAt });

  // Serialized type is not string, as expected
  // expectTypeOf(wrap(user).toObject().createdAt).toEqualTypeOf<IType<Date, number, string>>();
  expectTypeOf(wrap(user).toObject().createdAt).toEqualTypeOf<string>();
  assert(typeof wrap(user).toObject().createdAt === 'string');
});

