// @vitest-environment node
import type { NextApiRequest, NextApiResponse } from 'next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from './errors';
import { route } from './http';

// Just enough of a Next.js response to record what the route sent
function fakeResponse() {
  const sent = {
    status: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>
  };
  const res = {
    setHeader: (name: string, value: string) => {
      sent.headers[name] = value;
      return res;
    },
    status: (code: number) => {
      sent.status = code;
      return res;
    },
    json: (body: unknown) => {
      sent.body = body;
      return res;
    }
  };
  return { res: res as unknown as NextApiResponse, sent };
}

const request = (method: string) => ({ method }) as NextApiRequest;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('route', () => {
  it('calls the handler for the request method', async () => {
    const { res, sent } = fakeResponse();

    await route({ GET: (_req, r) => r.status(200).json({ ok: true }) })(
      request('GET'),
      res
    );

    expect(sent).toMatchObject({ status: 200, body: { ok: true } });
  });

  it('answers 405 and lists the allowed methods for any other method', async () => {
    const { res, sent } = fakeResponse();

    await route({ GET: vi.fn(), PATCH: vi.fn() })(request('DELETE'), res);

    expect(sent.status).toBe(405);
    expect(sent.headers.Allow).toBe('GET, PATCH');
  });

  it('turns an HttpError into its status, message and field errors', async () => {
    const { res, sent } = fakeResponse();

    await route({
      PATCH: async () => {
        throw new HttpError(409, 'That username is taken', {
          username: 'That username is taken'
        });
      }
    })(request('PATCH'), res);

    expect(sent).toMatchObject({
      status: 409,
      body: {
        error: 'That username is taken',
        fieldErrors: { username: 'That username is taken' }
      }
    });
  });

  it('answers 500 without leaking details for any other error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { res, sent } = fakeResponse();

    await route({
      GET: async () => {
        throw new Error('connection refused at 10.0.0.5');
      }
    })(request('GET'), res);

    expect(sent).toMatchObject({
      status: 500,
      body: { error: 'Something went wrong' }
    });
  });
});
