import { getDb } from '@/server/db/client';
import { HttpError } from '@/server/errors';
import { route } from '@/server/http';
import { getUserByUsername, toPublicProfile } from '@/server/users';

export default route({
  // Anyone's public profile; no sign-in needed
  GET: async (req, res) => {
    const user = await getUserByUsername(getDb(), String(req.query.username));
    if (!user) throw new HttpError(404, 'No user with that username');

    res.status(200).json(toPublicProfile(user));
  }
});
