import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const views = sqliteTable('views', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    slug: text('slug').unique(),
    count: integer('count', { mode: 'number' }),
});
