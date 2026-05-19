import { defineEntity, p, quote, raw } from "@mikro-orm/core";

// taken from https://mikro-orm.io/docs/defining-entities#indexes

const AuthorSchema = defineEntity({
  name: 'Author',
  properties: {
    email: p.string().unique(),
    age: p.integer().nullable().index(),
    born: p.date().nullable().index('born_index'),
    title: p.string(),
    country: p.string(),
  },
  indexes: [
    { properties: ['name', 'age'] }, // compound index, with generated name
    { name: 'custom_idx_name', properties: ['name'] }, // simple index, with custom name
    // Custom index using expression callback
    // ${table.schema}, ${table.name}, and ${columns.title} return the unquoted identifiers.
    { name: 'custom_index_country1', expression: (columns, table, indexName) => `create index \`${indexName}\` on \`${table.schema}\`.\`${table.name}\` (\`${columns.country}\`)` },
    // Using quote helper to automatically quote identifiers.
    { name: 'custom_index_country2', expression: (columns, table, indexName) => quote`create index ${indexName} on ${table} (${columns.country})` },
    // Using raw function to automatically quote identifiers.
    { name: 'custom_index_country3', expression: (columns, table, indexName) => raw(`create index ?? on ?? (??)`, [indexName, table, columns.country]) },
  ],
  uniques: [
    { properties: ['name', 'email'] },
  ],
});

export class Author extends AuthorSchema.class {}
AuthorSchema.setClass(Author);