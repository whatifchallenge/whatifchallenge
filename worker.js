const MAX_IDEAS = 100;
const MAX_BODY_SIZE = 4096;

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}

function cleanText(value, maxLength) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

async function listIdeas(env) {
    const listing = await env.IDEAS.list({ prefix: 'idea:', limit: MAX_IDEAS });
    const ideas = await Promise.all(listing.keys.map(async ({ name }) => {
        const idea = await env.IDEAS.get(name, 'json');
        return idea;
    }));

    return ideas
        .filter(Boolean)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname !== '/api/ideas') {
            return new Response('Not found', { status: 404 });
        }

        if (request.method === 'GET') {
            return json(await listIdeas(env));
        }

        if (request.method !== 'POST') {
            return json({ error: 'Method not allowed' }, 405);
        }

        if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY_SIZE) {
            return json({ error: 'Request is too large' }, 413);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return json({ error: 'Invalid JSON' }, 400);
        }

        const name = cleanText(body.name, 80);
        const challengeName = cleanText(body.challengeName, 120);
        const deadline = cleanText(body.deadline, 80);
        const details = cleanText(body.details, 500);
        const deadlineDate = new Date(deadline);

        if (!name || !challengeName || !deadline || Number.isNaN(deadlineDate.getTime())) {
            return json({ error: 'Name, challenge name, and a valid deadline are required' }, 400);
        }

        const idea = {
            name,
            challengeName,
            deadline: deadlineDate.toISOString(),
            details,
            createdAt: new Date().toISOString()
        };
        const id = `${Date.now()}-${crypto.randomUUID()}`;

        await env.IDEAS.put(`idea:${id}`, JSON.stringify(idea));
        return json(idea, 201);
    }
};
