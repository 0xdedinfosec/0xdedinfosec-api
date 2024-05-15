import { Hono, Next } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { ENV, RequestT } from './types';
import { RateLimitKeyFunc, rateLimit } from '@elithrar/workers-hono-rate-limit';
import { env } from 'hono/adapter';
import { HTTPException } from 'hono/http-exception';
import { getDrizzleDBClient, getOnlyDBClient } from './db';
import { views } from './db/schema';
import { eq, sql } from 'drizzle-orm';

const app = new Hono();

app.use(
    '*',
    secureHeaders({
        xXssProtection: '1; mode=block',
    })
);

app.use(
    '*',
    cors({
        origin: [
            'https://0xdedinfosec.vercel.app',
            'https://0xdedinfosec.pages.dev',
        ],
        allowMethods: ['POST', 'GET'],
        credentials: true,
    })
);

const getKey: RateLimitKeyFunc = (c: RequestT): string => {
    const { ENVIRONMENT } = env<ENV>(c, 'workerd');
    if (ENVIRONMENT === 'development') {
        return '127.0.0.1';
    }
    return c.req.header('cf-connecting-ip') || c.req.header('x-real-ip')!;
};

const rateLimiter = async (c: RequestT, next: Next) => {
    const { RATE_LIMITER } = env<ENV>(c, 'workerd');
    return await rateLimit(RATE_LIMITER, getKey)(c, next);
};

app.use('*', rateLimiter);

app.get('/', (c) => {
    return c.json({
        success: true,
        err: false,
        message: 'Greetings from 0xDedinfosec API! 🚀',
    });
});

app.get('/views', async (c: RequestT) => {
    const client = getOnlyDBClient(c);
    const totalCount = await client.execute(
        'SELECT SUM(count) AS total_count FROM views;'
    );

    c.header(
        'Cache-Control',
        'public, s-maxage=1200, stale-while-revalidate=900'
    );
    return c.json({
        success: true,
        err: false,
        count: totalCount.rows[0].total_count,
    });
})
    .get('/views/:slug', async (c: RequestT) => {
        const slug = c.req.param('slug');
        if (!slug || typeof slug !== 'string') {
            return c.json(
                {
                    success: false,
                    err: true,
                    message: 'Invalid slug!',
                },
                400
            );
        }

        const db = getDrizzleDBClient(c);
        const count = await db
            .select({
                count: views.count,
            })
            .from(views)
            .where(eq(views.slug, slug));

        c.header(
            'Cache-Control',
            'public, s-maxage=120, stale-while-revalidate=60'
        );

        if (!count) {
            return c.json(
                {
                    success: true,
                    err: false,
                    count: 0,
                },
                200
            );
        }

        return c.json({
            success: true,
            err: false,
            count: count[0].count,
        });
    })
    .post('/views/:slug', async (c: RequestT) => {
        const slug = c.req.param('slug');
        if (!slug || typeof slug !== 'string') {
            return c.json(
                {
                    success: false,
                    err: true,
                    message: 'Invalid slug!',
                },
                400
            );
        }

        const db = getDrizzleDBClient(c);
        const count = await db
            .update(views)
            .set({
                count: sql`${views.count} + 1`,
            })
            .where(eq(views.slug, slug))
            .returning({
                count: views.count,
            });

        return c.json({
            success: true,
            err: false,
            count: count[0].count || 0,
        });
    });

app.notFound((c) => {
    return c.json(
        {
            success: false,
            err: false,
            message: '404 not found',
        },
        404
    );
});

app.onError((err, c) => {
    try {
        if (err instanceof SyntaxError) {
            return c.json(
                {
                    success: false,
                    err: true,
                    message: 'JSON body is empty or invalid!',
                },
                400
            );
        }
        if (err instanceof HTTPException) {
            if (err.status === 429) {
                return c.json(
                    {
                        success: false,
                        err: true,
                        message: 'Too many requests! Please try again later.',
                    },
                    429
                );
            }
        }
        console.error(err);
        return c.json(
            {
                success: false,
                err: true,
                message: 'Something went wrong!',
            },
            500
        );
    } catch (e) {
        console.error(e);
        return c.json(
            {
                success: false,
                err: true,
                message: 'Something went wrong!',
            },
            500
        );
    }
});

export default app;
