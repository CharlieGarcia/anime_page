import { requireUser } from '@/server/auth';
import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { loadAnimeSnapshot } from '@/server/kitsu';
import { addToWatchList, getWatchList } from '@/server/watchList';

// Always the signed-in user's own list: the user id comes from the session, never the request
export default route({
  // Newest first
  GET: async (req, res) => {
    const user = await requireUser(req);
    res.status(200).json({ items: await getWatchList(getDb(), user.id) });
  },
  // Body { animeId }. 201 when added, 200 when it was already there.
  POST: async (req, res) => {
    const user = await requireUser(req);
    const { item, created } = await addToWatchList(
      getDb(),
      user.id,
      req.body,
      loadAnimeSnapshot
    );
    res.status(created ? 201 : 200).json(item);
  }
});
