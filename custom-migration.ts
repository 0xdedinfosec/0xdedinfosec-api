import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { config } from 'dotenv';
config();

const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
});

const db = drizzle(client);

(async () => {
    await migrate(db, {
        migrationsFolder: 'drizzle',
    });
})();
