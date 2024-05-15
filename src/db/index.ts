import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from 'hono/adapter';
import { ENV, RequestT } from '../types';

export const getDrizzleDBClient = (c: RequestT) => {
    const { DATABASE_URL, DATABASE_AUTH_TOKEN } = env<ENV>(c, 'workerd');
    const client = createClient({
        url: DATABASE_URL,
        authToken: DATABASE_AUTH_TOKEN,
    });
    const db = drizzle(client);
    return db;
};

export const getOnlyDBClient = (c: RequestT) => {
    const { DATABASE_URL, DATABASE_AUTH_TOKEN } = env<ENV>(c, 'workerd');
    const client = createClient({
        url: DATABASE_URL,
        authToken: DATABASE_AUTH_TOKEN,
    });
    return client;
};
