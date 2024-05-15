import { RateLimitBinding } from '@elithrar/workers-hono-rate-limit';
import { Context, Env } from 'hono';

export type ENV = {
    ENVIRONMENT: 'development' | 'production';
    DATABASE_URL: string;
    DATABASE_AUTH_TOKEN: string;
    RATE_LIMITER: RateLimitBinding;
};

export type RequestT = Context<Env, any, {}>;
