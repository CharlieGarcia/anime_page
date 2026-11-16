import { requireUser } from '@/server/auth';
import { getDb } from '@/server/db/client';
import { route } from '@/server/http';
import { loadAnimeSnapshots } from '@/server/kitsu';
import { addToTopAnime, getTopAnime, setTopAnime } from '@/server/topAnime';

// Always the signed-in user's own top 10: the user id comes from the session, never the request
export default route({
  // In rank order, rank 1 first
  GET: async (req, res) => {
    const user = await requireUser(req);
    res.status(200).json({ items: await getTopAnime(getDb(), user.id) });
  },
  // Body { animeIds } in rank order; replaces the whole list
  PUT: async (req, res) => {
    const user = await requireUser(req);
    const items = await setTopAnime(
      getDb(),
      user.id,
      req.body,
      loadAnimeSnapshots
    );
    res.status(200).json({ items });
  },
  // Body { animeId }; adds it at the next free rank. 201 when added, 200 when it was already there.
  POST: async (req, res) => {
    const user = await requireUser(req);
    const { items, created } = await addToTopAnime(
      getDb(),
      user.id,
      req.body,
      loadAnimeSnapshots
    );
    res.status(created ? 201 : 200).json({ items });
  }
});
