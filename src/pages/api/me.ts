import type { NextApiRequest, NextApiResponse } from 'next';
import { requireUser } from '@/server/auth';
import type { User } from '@/server/db/schema';

type ErrorBody = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorBody>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not signed in' });
  }

  return res.status(200).json(user);
}
