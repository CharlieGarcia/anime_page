import { requireUser } from '@/server/auth';
import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { removeFromWatchList } from '@/server/watchList';

export default route({
  // 204 whether or not the anime was on the signed-in user's list
  DELETE: async (req, res) => {
    const user = await requireUser(req);
    await removeFromWatchList(getDb(), user.id, req.query.animeId);
    res.status(204).end();
  }
});
