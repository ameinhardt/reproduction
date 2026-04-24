import { Migration } from "@mikro-orm/migrations-mongodb";

export class UsersV1 extends Migration {
  async down() {
    const users = this.getCollection('user');
    await users.dropIndex('name')
  }

  async up() {
    const users = this.getCollection('user');
    const indexNameMaybe = users.createIndex({ name: 1 });
    console.log(indexNameMaybe)
  }
}
