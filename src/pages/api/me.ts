import { requireUser } from '@/server/auth';
import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { updateProfile } from '@/server/users';

export default route({
  // The signed-in user's own profile
  GET: async (req, res) => {
    res.status(200).json(await requireUser(req));
  },
  // Edit display name, username and bio
  PATCH: async (req, res) => {
    const user = await requireUser(req);
    res.status(200).json(await updateProfile(getDb(), user.id, req.body));
  }
});
