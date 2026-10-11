import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { HttpError } from './errors';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// Builds an API route from one handler per HTTP method. Other methods get 405,
// an HttpError becomes its status and message, anything else becomes a 500.
export function route(
  handlers: Partial<Record<Method, NextApiHandler>>
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const handler = handlers[req.method as Method];
    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof HttpError) {
        return res
          .status(error.status)
          .json({ error: error.message, fieldErrors: error.fieldErrors });
      }
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };
}
