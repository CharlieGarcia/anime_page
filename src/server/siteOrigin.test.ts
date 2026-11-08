// @vitest-environment node
import type { IncomingMessage } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteOrigin } from './siteOrigin';

const request = (headers: IncomingMessage['headers']) =>
  ({ headers }) as IncomingMessage;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('siteOrigin', () => {
  it('uses SITE_URL without a trailing slash', () => {
    vi.stubEnv('SITE_URL', 'https://anime.example.com/');

    expect(siteOrigin(request({ host: 'localhost:3000' }))).toBe(
      'https://anime.example.com'
    );
  });

  it('falls back to the request address', () => {
    vi.stubEnv('SITE_URL', '');

    expect(siteOrigin(request({ host: 'localhost:3000' }))).toBe(
      'http://localhost:3000'
    );
    expect(
      siteOrigin(
        request({
          host: 'anime.example.com',
          'x-forwarded-proto': 'https,http'
        })
      )
    ).toBe('https://anime.example.com');
  });
});
